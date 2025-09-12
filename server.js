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

// --- Theme & Style Configurations ---
const THEMES = {
  default: {
    labelBg: '#555',
    valueBg: '#007ec6',
    textColor: '#fff',
    borderColor: 'none'
  },
  dark: {
    labelBg: '#21262d',
    valueBg: '#238636',
    textColor: '#f0f6fc',
    borderColor: '#30363d'
  },
  'github-dark': {
    labelBg: '#21262d',
    valueBg: '#238636',
    textColor: '#f0f6fc',
    borderColor: '#30363d'
  },
  dracula: {
    labelBg: '#44475a',
    valueBg: '#bd93f9',
    textColor: '#f8f8f2',
    borderColor: '#6272a4'
  },
  monokai: {
    labelBg: '#272822',
    valueBg: '#a6e22e',
    textColor: '#f8f8f2',
    borderColor: '#75715e'
  },
  gradient: {
    labelBg: 'url(#grad1)',
    valueBg: 'url(#grad2)',
    textColor: '#fff',
    borderColor: 'none'
  },
  ocean: {
    labelBg: '#0f4c75',
    valueBg: '#3282b8',
    textColor: '#bbe1fa',
    borderColor: '#0f3460'
  },
  sunset: {
    labelBg: '#ff6b6b',
    valueBg: '#ffa726',
    textColor: '#fff',
    borderColor: '#ff5722'
  },
  neon: {
    labelBg: '#0a0a0a',
    valueBg: '#00ff41',
    textColor: '#00ff41',
    borderColor: '#00ff41'
  }
};

const COLORS = {
  red: '#e53e3e',
  green: '#38a169',
  blue: '#3182ce',
  yellow: '#d69e2e',
  purple: '#805ad5',
  pink: '#d53f8c',
  orange: '#dd6b20',
  teal: '#319795',
  cyan: '#0bc5ea',
  gray: '#718096'
};

const STYLES = {
  flat: {
    borderRadius: 3,
    height: 20,
    border: false,
    shadow: false
  },
  'flat-square': {
    borderRadius: 0,
    height: 20,
    border: false,
    shadow: false
  },
  plastic: {
    borderRadius: 4,
    height: 18,
    border: true,
    shadow: true
  },
  'for-the-badge': {
    borderRadius: 0,
    height: 28,
    border: false,
    shadow: false,
    fontSize: '11',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  }
};

// --- Caching Layer ---
const ensureCacheDir = async () => {
    try {
        await fs.mkdir(CACHE_DIR, { recursive: true });
    } catch (error) {
        console.error('Failed to create cache directory:', error);
    }
};

const cache = {
    get: async (key) => {
        try {
            const filePath = path.join(CACHE_DIR, `${key}.json`);
            const data = await fs.readFile(filePath, 'utf8');
            const entry = JSON.parse(data);

            if (Date.now() - entry.timestamp > CACHE_TTL) {
                console.log(`Cache expired for key: ${key}`);
                return null;
            }
            console.log(`Cache hit for key: ${key}`);
            return entry.value;
        } catch (error) {
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

// --- Enhanced SVG Generation ---
const getThemeColors = (theme, customColor) => {
  const baseTheme = THEMES[theme] || THEMES.default;
  
  if (customColor && COLORS[customColor]) {
    return {
      ...baseTheme,
      valueBg: COLORS[customColor]
    };
  }
  
  return baseTheme;
};

const generateGradients = (theme) => {
  if (theme === 'gradient') {
    return `
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#f093fb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f5576c;stop-opacity:1" />
        </linearGradient>
      </defs>`;
  }
  return '';
};

const generateAnimations = (animated, style) => {
  if (!animated) return '';
  
  const animationType = animated === 'pulse' ? 'pulse' : animated === 'glow' ? 'glow' : 'slide';
  
  switch (animationType) {
    case 'pulse':
      return `
        <style>
          .pulse { animation: pulse 2s infinite; }
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
          }
        </style>`;
    case 'glow':
      return `
        <style>
          .glow { 
            animation: glow 2s ease-in-out infinite alternate;
            filter: drop-shadow(0 0 4px currentColor);
          }
          @keyframes glow {
            from { filter: drop-shadow(0 0 2px currentColor); }
            to { filter: drop-shadow(0 0 8px currentColor); }
          }
        </style>`;
    case 'slide':
      return `
        <style>
          .slide { animation: slide 3s ease-in-out infinite; }
          @keyframes slide {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(2px); }
          }
        </style>`;
    default:
      return '';
  }
};

const generateSparkline = (data, width, height) => {
  if (!data || data.length < 2) return '';
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return `
    <polyline 
      points="${points}" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="1.5" 
      opacity="0.6"
    />`;
};

const generateIcon = (icon) => {
  const icons = {
    fire: '🔥',
    star: '⭐',
    rocket: '🚀',
    code: '💻',
    chart: '📈',
    commit: '📝',
    calendar: '📅',
    trophy: '🏆'
  };
  
  return icons[icon] || '';
};

const generateEnhancedSvgBadge = (label, value, options = {}) => {
    const {
      theme = 'default',
      color,
      style = 'flat',
      animated,
      icon,
      sparkline,
      showBorder = false
    } = options;

    const themeColors = getThemeColors(theme, color);
    const styleConfig = STYLES[style] || STYLES.flat;
    const iconText = generateIcon(icon);
    
    const labelText = `${iconText ? iconText + ' ' : ''}Daily Commits (${label})`;
    const valueText = value;

    // Enhanced width calculation
    const baseCharWidth = styleConfig.fontSize === '11' ? 8.5 : 7.5;
    const labelWidth = Math.max(labelText.length * baseCharWidth, 80);
    const valueWidth = Math.max(valueText.toString().length * (baseCharWidth + 1) + 20, 50);
    const totalWidth = labelWidth + valueWidth;

    const gradients = generateGradients(theme);
    const animations = generateAnimations(animated, style);
    const sparklineChart = sparkline ? generateSparkline(sparkline, valueWidth - 10, styleConfig.height - 8) : '';

    // Border styling
    const borderStyle = showBorder || themeColors.borderColor !== 'none' ? 
      `stroke="${themeColors.borderColor}" stroke-width="1"` : '';

    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${styleConfig.height}" role="img" aria-label="${labelText}: ${valueText}">
        <title>${labelText}: ${valueText}</title>
        ${gradients}
        ${animations}
        
        <linearGradient id="s" x2="0" y2="100%">
            <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
            <stop offset="1" stop-opacity=".1"/>
        </linearGradient>
        
        <clipPath id="r">
            <rect width="${totalWidth}" height="${styleConfig.height}" rx="${styleConfig.borderRadius}" fill="#fff"/>
        </clipPath>
        
        <g clip-path="url(#r)">
            <rect width="${labelWidth}" height="${styleConfig.height}" fill="${themeColors.labelBg}" ${borderStyle}/>
            <rect x="${labelWidth}" width="${valueWidth}" height="${styleConfig.height}" fill="${themeColors.valueBg}" ${borderStyle}/>
            ${styleConfig.shadow ? `<rect width="${totalWidth}" height="${styleConfig.height}" fill="url(#s)"/>` : ''}
        </g>
        
        ${sparklineChart ? `
        <g transform="translate(${labelWidth + 5}, 4)" color="${themeColors.textColor}">
            ${sparklineChart}
        </g>` : ''}
        
        <g fill="${themeColors.textColor}" 
           text-anchor="middle" 
           font-family="${styleConfig.fontSize === '11' ? 'Trebuchet MS,sans-serif' : 'Verdana,Geneva,DejaVu Sans,sans-serif'}" 
           text-rendering="geometricPrecision" 
           font-size="${styleConfig.fontSize || '110'}"
           ${styleConfig.textTransform ? `style="text-transform: ${styleConfig.textTransform}; letter-spacing: ${styleConfig.letterSpacing || '0'}"` : ''}
           ${animated ? `class="${animated}"` : ''}>
           
            <text aria-hidden="true" 
                  x="${labelWidth * 5}" 
                  y="150" 
                  fill="#010101" 
                  fill-opacity=".3" 
                  transform="scale(.1)" 
                  textLength="${(labelWidth - 10) * 10}">
                ${labelText}
            </text>
            <text x="${labelWidth * 5}" 
                  y="140" 
                  transform="scale(.1)" 
                  fill="${themeColors.textColor}" 
                  textLength="${(labelWidth - 10) * 10}">
                ${labelText}
            </text>
            
            <text aria-hidden="true" 
                  x="${(labelWidth + valueWidth / 2) * 10}" 
                  y="150" 
                  fill="#010101" 
                  fill-opacity=".3" 
                  transform="scale(.1)" 
                  textLength="${(valueWidth - 10) * 10}">
                ${valueText}
            </text>
            <text x="${(labelWidth + valueWidth / 2) * 10}" 
                  y="140" 
                  transform="scale(.1)" 
                  fill="${themeColors.textColor}" 
                  textLength="${(valueWidth - 10) * 10}">
                ${valueText}
            </text>
        </g>
    </svg>
    `;
};

const errorBadge = (message, options = {}) => generateEnhancedSvgBadge("error", message, options);

// --- Data Fetching (unchanged) ---
const getPeriodInDays = (period) => {
    switch (period) {
        case 'week': return 7;
        case 'month': return 30;
        case 'quarter': return 90;
        case 'half': return 182;
        case 'year': return 365;
        default: return 30;
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

        allDays.sort((a, b) => new Date(b.date) - new Date(a.date));

        const daysInPeriod = getPeriodInDays(period);
        const relevantDays = allDays.slice(0, daysInPeriod);

        const totalCommits = relevantDays.reduce((sum, day) => sum + day.contributionCount, 0);
        const average = (totalCommits / daysInPeriod).toFixed(2);

        // Generate sparkline data for last 7 days
        const sparklineData = relevantDays.slice(0, 7).reverse().map(day => day.contributionCount);

        return { average, sparklineData };
    } catch (error) {
        console.error("GitHub API Error:", error.message);
        if (error.message.includes("Could not resolve to a User")) {
             return { error: 'user not found' };
        }
        return { error: 'api error' };
    }
};

// --- Enhanced API Endpoint ---
app.get('/commits', async (req, res) => {
    const { 
        account, 
        period = 'month',
        theme = 'default',
        color,
        style = 'flat',
        animated,
        icon,
        sparkline,
        border
    } = req.query;

    if (!account) {
        return res.status(400).send('Missing GitHub account parameter.');
    }

    const validPeriods = ['week', 'month', 'quarter', 'half', 'year'];
    const selectedPeriod = validPeriods.includes(period) ? period : 'month';
    const cacheKey = `${account}:${selectedPeriod}`;

    const badgeOptions = {
        theme,
        color,
        style,
        animated,
        icon,
        sparkline: sparkline === 'true' || sparkline === '1',
        showBorder: border === 'true' || border === '1'
    };

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=21600');

    try {
        let cachedData = await cache.get(cacheKey);

        if (!cachedData) {
            console.log(`Fetching fresh data for ${cacheKey}`);
            const newData = await fetchAndCalculateAverage(account, selectedPeriod);
            
            if (newData.error) {
                const oldCache = await cache.get(cacheKey);
                if (oldCache) {
                    console.log("Serving stale cache due to API error.");
                    return res.send(generateEnhancedSvgBadge(selectedPeriod, oldCache.average, {
                        ...badgeOptions,
                        sparkline: badgeOptions.sparkline ? oldCache.sparklineData : null
                    }));
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

// --- Documentation Route ---
app.get('/', (req, res) => {
    res.send(`
    <html>
    <head><title>GitHub Commit Badge API</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1>🏆 GitHub Commit Badge API</h1>
        <p>Generate beautiful, customizable badges showing GitHub commit activity!</p>
        
        <h2>Basic Usage</h2>
        <code>/commits?account=USERNAME</code>
        
        <h2>All Parameters</h2>
        <ul>
            <li><strong>account</strong> (required) - GitHub username</li>
            <li><strong>period</strong> - week, month, quarter, half, year (default: month)</li>
            <li><strong>theme</strong> - default, dark, github-dark, dracula, monokai, gradient, ocean, sunset, neon</li>
            <li><strong>color</strong> - red, green, blue, yellow, purple, pink, orange, teal, cyan, gray</li>
            <li><strong>style</strong> - flat, flat-square, plastic, for-the-badge</li>
            <li><strong>animated</strong> - pulse, glow, slide</li>
            <li><strong>icon</strong> - fire, star, rocket, code, chart, commit, calendar, trophy</li>
            <li><strong>sparkline</strong> - true/false (mini chart in badge)</li>
            <li><strong>border</strong> - true/false</li>
        </ul>
        
        <h2>Examples</h2>
        <p><img src="/commits?account=octocat&theme=dark&style=for-the-badge&icon=fire" alt="Dark theme"></p>
        <p><img src="/commits?account=octocat&theme=gradient&animated=pulse&sparkline=true" alt="Gradient with animation"></p>
        <p><img src="/commits?account=octocat&color=green&style=flat-square&icon=trophy" alt="Green flat-square"></p>
    </body>
    </html>
    `);
});

// --- Server Initialization ---
ensureCacheDir().then(() => {
    app.listen(PORT, () => {
        console.log(`Enhanced GitHub Commit Badge API running on http://localhost:${PORT}`);
        console.log('🎨 New features: themes, colors, styles, animations, icons, sparklines!');
    });
});