const express = require('express');
const { graphql } = require("@octokit/graphql");
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Configuration ---
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
const CACHE_DIR = path.join('/tmp', 'commit-badge-cache'); // Use /tmp for Vercel's writable directory

// GitHub GraphQL API client
const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`,
  },
});

// --- Caching Layer ---
// Ensures cache directory exists
const ensureCacheDir = async () => {
    try {
        await fs.mkdir(CACHE_DIR, { recursive: true });
    } catch (error) {
        console.error('Failed to create cache directory:', error);
    }
};

// Simple file-based cache get/set
const cache = {
    get: async (key) => {
        try {
            const filePath = path.join(CACHE_DIR, `${key}.json`);
            const data = await fs.readFile(filePath, 'utf8');
            const entry = JSON.parse(data);

            if (Date.now() - entry.timestamp > CACHE_TTL) {
                // Cache expired
                console.log(`Cache expired for key: ${key}`);
                return null;
            }
            console.log(`Cache hit for key: ${key}`);
            return entry.value;
        } catch (error) {
            // Not found or other read error
            console.log(`Cache miss for key: ${key}`);
            return null;
        }
    },
    set: async (key, value) => {
        try {
            const filePath = path.join(CACHE_DIR, `${key}.json`);
            const entry = {
                timestamp: Date.now(),
                value,
            };
            await fs.writeFile(filePath, JSON.stringify(entry), 'utf8');
            console.log(`Cache set for key: ${key}`);
        } catch (error) {
            console.error(`Failed to set cache for key ${key}:`, error);
        }
    }
};

// --- SVG Rendering ---
const generateSvgBadge = (label, value) => {
    const labelText = `Daily Commits (${label})`;
    const valueText = value;

    // Simple width calculation based on text length
    const labelWidth = labelText.length * 7.5;
    const valueWidth = valueText.length * 8 + 10;
    const totalWidth = labelWidth + valueWidth;

    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${labelText}: ${valueText}">
        <title>${labelText}: ${valueText}</title>
        <linearGradient id="s" x2="0" y2="100%">
            <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
            <stop offset="1" stop-opacity=".1"/>
        </linearGradient>
        <clipPath id="r">
            <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
        </clipPath>
        <g clip-path="url(#r)">
            <rect width="${labelWidth}" height="20" fill="#555"/>
            <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="#007ec6"/>
            <rect width="${totalWidth}" height="20" fill="url(#s)"/>
        </g>
        <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
            <text aria-hidden="true" x="${labelWidth * 5}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(labelWidth - 10) * 10}">${labelText}</text>
            <text x="${labelWidth * 5}" y="140" transform="scale(.1)" fill="#fff" textLength="${(labelWidth - 10) * 10}">${labelText}</text>
            <text aria-hidden="true" x="${(labelWidth + valueWidth / 2) * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(valueWidth - 10) * 10}">${valueText}</text>
            <text x="${(labelWidth + valueWidth / 2) * 10}" y="140" transform="scale(.1)" fill="#fff" textLength="${(valueWidth - 10) * 10}">${valueText}</text>
        </g>
    </svg>
    `;
};

const errorBadge = (message) => generateSvgBadge("error", message);

// --- Data Fetching and Calculation ---
const getPeriodInDays = (period) => {
    switch (period) {
        case 'week': return 7;
        case 'month': return 30;
        case 'quarter': return 90;
        case 'half': return 182;
        case 'year': return 365;
        default: return 30; // Default to month
    }
};

const fetchAndCalculateAverage = async (account, period) => {
    try {
        const query = `
        query($login: String!) {
          user(login: $login) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }
        `;

        const { user } = await graphqlWithAuth(query, { login: account });

        if (!user) {
            return { error: 'user not found' };
        }

        const allDays = user.contributionsCollection.contributionCalendar.weeks.flatMap(
            week => week.contributionDays
        );

        // Sort days by date just in case
        allDays.sort((a, b) => new Date(b.date) - new Date(a.date));

        const daysInPeriod = getPeriodInDays(period);
        const relevantDays = allDays.slice(0, daysInPeriod);

        const totalCommits = relevantDays.reduce((sum, day) => sum + day.contributionCount, 0);
        const average = (totalCommits / daysInPeriod).toFixed(2);

        return { average };
    } catch (error) {
        console.error("GitHub API Error:", error.message);
        // Check for specific errors
        if (error.message.includes("Could not resolve to a User")) {
             return { error: 'user not found' };
        }
        return { error: 'api error' };
    }
};


// --- API Endpoint ---
app.get('/commits', async (req, res) => {
    const { account, period = 'month' } = req.query;

    if (!account) {
        return res.status(400).send('Missing GitHub account parameter.');
    }

    const validPeriods = ['week', 'month', 'quarter', 'half', 'year'];
    const selectedPeriod = validPeriods.includes(period) ? period : 'month';
    const cacheKey = `${account}:${selectedPeriod}`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=21600'); // 6 hours browser cache

    try {
        let cachedData = await cache.get(cacheKey);

        if (!cachedData) {
            console.log(`Fetching fresh data for ${cacheKey}`);
            const newData = await fetchAndCalculateAverage(account, selectedPeriod);
            
            if (newData.error) {
                // If there's an API error but we have old cache, serve it
                const oldCache = await cache.get(cacheKey); // a re-check in case another process populated it
                if (oldCache) {
                    console.log("Serving stale cache due to API error.");
                    return res.send(generateSvgBadge(selectedPeriod, oldCache.average));
                }
                 return res.send(errorBadge(newData.error));
            }
            
            await cache.set(cacheKey, newData);
            cachedData = newData;
        }

        return res.send(generateSvgBadge(selectedPeriod, cachedData.average));

    } catch (error) {
        console.error("Server Error:", error);
        // Serve a generic error badge
        return res.status(500).send(errorBadge('server error'));
    }
});

// --- Server Initialization ---
ensureCacheDir().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});
