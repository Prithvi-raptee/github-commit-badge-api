// api/index.js

const express = require('express');
const { ensureCacheDir, cache } = require('../utils/cache');
const { fetchAndCalculateAverage } = require('../utils/github');
const { generateEnhancedSvgBadge, errorBadge } = require('../utils/svgGenerator');
const { getDocumentationHTML } = require('../views/documentation');

const { track } = require('@vercel/analytics/server');

const app = express();

// --- API Endpoint ---
app.get('/commits', async (req, res) => {
    // FIX: Destructure 'theme' from req.query so it's available as a variable
    const { account, period = 'month', theme = 'default', ...options } = req.query;

    // This custom event will now work correctly
    track('Badge Generated', { 
        account: account, 
        period: period,
        theme: theme 
    });

    if (!account) {
        return res.status(400).send('Missing GitHub account parameter.');
    }

    const validPeriods = ['week', 'month', 'quarter', 'half', 'year'];
    const selectedPeriod = validPeriods.includes(period) ? period : 'month';
    const cacheKey = `${account}:${selectedPeriod}`;

    const badgeOptions = {
      ...options,
      theme, // Pass the theme to your badge generator
      sparkline: options.sparkline === 'true' || options.sparkline === '1',
      showBorder: options.border === 'true' || options.border === '1'
    };

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=21600'); // 6-hour browser cache

    try {
        let cachedData = await cache.get(cacheKey);

        if (!cachedData) {
            const newData = await fetchAndCalculateAverage(account, selectedPeriod);
            
            if (newData.error) {
                const oldCache = await cache.get(cacheKey);
                if (oldCache) {
                    return res.send(generateEnhancedSvgBadge(selectedPeriod, oldCache.average, {...badgeOptions, sparkline: badgeOptions.sparkline ? oldCache.sparklineData : null}));
                }
                return res.send(errorBadge(newData.error, badgeOptions));
            }
            
            await cache.set(cacheKey, newData);
            cachedData = newData;
        }

        const finalOptions = {
            ...badgeOptions,
            sparkline: badgeOptions.sparkline ? cachedData.sparklineData : null
        };

        return res.send(generateEnhancedSvgBadge(selectedPeriod, cachedData.average, finalOptions));

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).send(errorBadge('server error', badgeOptions));
    }
});

// --- Other Routes ---
app.get('/test', (req, res) => {
    res.send('<h1>Test Route - Server is working!</h1>');
});

app.get('/', (req, res) => {
    try {
        const html = getDocumentationHTML(req);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        console.error('Error generating documentation:', error);
        res.status(500).send('<h1>Error generating documentation</h1><p>' + error.message + '</p>');
    }
});

// --- Server Startup ---
const PORT = process.env.PORT || 3000;
ensureCacheDir().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running locally on http://localhost:${PORT}`);
    });
});

module.exports = app;