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

// --- Enhanced Documentation Route ---
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🏆 GitHub Commit Badge API</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            :root {
                --bg-color: #0D1117;
                --card-bg: #161B22;
                --border-color: #30363d;
                --text-primary: #c9d1d9;
                --text-secondary: #8b949e;
                --accent-primary: #58a6ff;
                --accent-hover: #82baff;
                --code-bg: #010409;
                --success-color: #238636;
                --font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                --font-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            }
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: var(--font-sans);
                line-height: 1.6;
                color: var(--text-primary);
                background-color: var(--bg-color);
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem 1.5rem;
            }
            .header {
                text-align: center;
                margin-bottom: 4rem;
                padding: 2rem 0;
            }
            .header h1 {
                font-size: 3rem;
                font-weight: 700;
                margin-bottom: 1rem;
                letter-spacing: -1.5px;
                background: linear-gradient(90deg, #58a6ff, #9370db);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .header p {
                font-size: 1.25rem;
                color: var(--text-secondary);
                max-width: 700px;
                margin: 0 auto;
            }
            .section {
                margin-bottom: 3rem;
                padding: 1.5rem;
                background-color: var(--card-bg);
                border-radius: 8px;
                border: 1px solid var(--border-color);
            }
            .section h2 {
                color: var(--text-primary);
                margin-bottom: 1.5rem;
                font-size: 1.75rem;
                font-weight: 600;
                padding-bottom: 0.75rem;
                border-bottom: 1px solid var(--border-color);
            }
            code, .code-block {
                font-family: var(--font-mono);
                font-size: 0.9em;
                background-color: var(--code-bg);
                border-radius: 6px;
                border: 1px solid var(--border-color);
            }
            code {
                padding: 0.2em 0.4em;
                color: var(--text-secondary);
            }
            .code-block {
                padding: 1rem;
                margin: 1rem 0;
                overflow-x: auto;
                white-space: pre;
            }
            .params-grid, .examples-grid, .features-list {
                display: grid;
                gap: 1.5rem;
            }
            .params-grid {
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            }
            .param-card {
                padding: 1.5rem;
                background: var(--bg-color);
                border-radius: 6px;
                border: 1px solid var(--border-color);
            }
            .param-card h4 {
                color: var(--accent-primary);
                margin-bottom: 0.75rem;
                font-size: 1.1em;
                font-weight: 600;
            }
            .param-card .param-name {
                background-color: rgba(88, 166, 255, 0.1);
                color: var(--accent-primary);
                padding: 4px 8px;
                border-radius: 4px;
                font-family: var(--font-mono);
                font-size: 0.85em;
            }
            .examples-grid {
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            }
            .example-card {
                background: var(--bg-color);
                padding: 1.5rem;
                border-radius: 6px;
                border: 1px solid var(--border-color);
                transition: transform 0.2s ease, border-color 0.2s ease;
            }
            .example-card:hover {
                transform: translateY(-3px);
                border-color: var(--accent-primary);
            }
            .example-card h4 {
                color: var(--text-primary);
                margin-bottom: 1rem;
                font-weight: 500;
            }
            .example-card img {
                margin: 0.5rem 0;
                max-width: 100%;
            }
            .try-it {
                text-align: center;
                background-color: var(--bg-color); /* No harsh gradient */
            }
            .input-group {
                display: flex;
                gap: 1rem;
                margin: 1.5rem 0;
                flex-wrap: wrap;
                justify-content: center;
            }
            .input-group input, .input-group select {
                padding: 0.75rem;
                border: 1px solid var(--border-color);
                background-color: var(--bg-color);
                color: var(--text-primary);
                border-radius: 6px;
                font-size: 1em;
                font-family: var(--font-sans);
                min-width: 150px;
                transition: border-color 0.2s ease, box-shadow 0.2s ease;
            }
            .input-group input:focus, .input-group select:focus {
                outline: none;
                border-color: var(--accent-primary);
                box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.2);
            }
            .btn {
                background-color: var(--success-color);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 0.75rem 1.5rem;
                border-radius: 6px;
                cursor: pointer;
                font-size: 1em;
                font-weight: 500;
                text-decoration: none;
                display: inline-block;
                transition: background-color 0.2s ease;
            }
            .btn:hover {
                background-color: #2ea043;
            }
            #preview {
                margin-top: 2rem;
            }
            #badgeUrl {
                background-color: var(--code-bg);
                padding: 1rem;
                border-radius: 6px;
                margin-top: 1.5rem;
                word-break: break-all;
                font-family: var(--font-mono);
                color: var(--text-secondary);
                border: 1px solid var(--border-color);
            }
            .features-list {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            }
            .feature-item {
                background-color: var(--bg-color);
                padding: 1rem;
                border-radius: 6px;
                border: 1px solid var(--border-color);
                text-align: center;
            }
            .footer {
                text-align: center;
                padding: 3rem 1rem;
                margin-top: 3rem;
                border-top: 1px solid var(--border-color);
                color: var(--text-secondary);
            }
            @media (max-width: 768px) {
                .header h1 { font-size: 2.5rem; }
                .header p { font-size: 1.1rem; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header class="header">
                <h1>GitHub Commit Badge API</h1>
                <p>Generate beautiful, customizable badges for your GitHub commit activity with advanced theming, animations, and visual enhancements.</p>
            </header>

            <div class="section">
                <h2>🚀 Quick Start</h2>
                <p>Embed the badge in your Markdown. Just replace <code>USERNAME</code> with any GitHub username:</p>
                <div class="code-block">${req.protocol}://${req.get('host')}/commits?account=USERNAME</div>
                <p><strong>Live Example for <code>octocat</code>:</strong></p>
                <img src="/commits?account=octocat" alt="Basic example">
            </div>

            <div class="section try-it">
                <h2>🎮 Interactive Badge Builder</h2>
                <p>Customize your badge in real-time and generate the URL.</p>
                <div class="input-group">
                    <input type="text" id="username" placeholder="GitHub Username" value="octocat">
                    <select id="period">
                        <option value="week">Week</option>
                        <option value="month" selected>Month</option>
                        <option value="quarter">Quarter</option>
                        <option value="half">Half Year</option>
                        <option value="year">Year</option>
                    </select>
                    <select id="theme">
                        <option value="default" selected>Default</option>
                        <option value="dark">Dark</option>
                        <option value="github-dark">GitHub Dark</option>
                        <option value="dracula">Dracula</option>
                        <option value="monokai">Monokai</option>
                        <option value="gradient">Gradient</option>
                        <option value="ocean">Ocean</option>
                        <option value="sunset">Sunset</option>
                        <option value="neon">Neon</option>
                    </select>
                    <select id="style">
                        <option value="flat" selected>Flat</option>
                        <option value="flat-square">Flat Square</option>
                        <option value="plastic">Plastic</option>
                        <option value="for-the-badge">For The Badge</option>
                    </select>
                    <select id="animated">
                        <option value="">No Animation</option>
                        <option value="pulse">Pulse</option>
                        <option value="glow">Glow</option>
                        <option value="slide">Slide</option>
                    </select>
                    <select id="icon">
                        <option value="">No Icon</option>
                        <option value="fire">🔥 Fire</option>
                        <option value="rocket">🚀 Rocket</option>
                        <option value="trophy">🏆 Trophy</option>
                        <option value="star">⭐ Star</option>
                        <option value="code">💻 Code</option>
                        <option value="chart">📈 Chart</option>
                    </select>
                </div>
                <button class="btn" onclick="updatePreview()">Generate Badge</button>
                <div id="preview">
                    <img id="previewImg" src="/commits?account=octocat" alt="Preview">
                </div>
                <div id="badgeUrl"></div>
            </div>

            <div class="section">
                <h2>✨ Key Features</h2>
                <div class="features-list">
                    <div class="feature-item">📊 Multiple Periods</div>
                    <div class="feature-item">🎨 9+ Themes</div>
                    <div class="feature-item">🌈 10+ Colors</div>
                    <div class="feature-item">🎭 4 Styles</div>
                    <div class="feature-item">⚡ Animations</div>
                    <div class="feature-item">🚀 Icons</div>
                    <div class="feature-item">📈 Sparklines</div>
                    <div class="feature-item">⚡ Smart Caching</div>
                </div>
            </div>

            <div class="section">
                <h2>📋 Parameter Reference</h2>
                <div class="params-grid">
                    <div class="param-card">
                        <h4>🔧 Core</h4>
                        <p><span class="param-name">account</span> (required)</p>
                        <p><span class="param-name">period</span></p>
                    </div>
                    <div class="param-card">
                        <h4>🎨 Visuals</h4>
                        <p><span class="param-name">theme</span></p>
                        <p><span class="param-name">color</span></p>
                        <p><span class="param-name">style</span></p>
                    </div>
                    <div class="param-card">
                        <h4>⚡ Enhancements</h4>
                        <p><span class="param-name">animated</span></p>
                        <p><span class="param-name">icon</span></p>
                        <p><span class="param-name">sparkline</span></p>
                        <p><span class="param-name">border</span></p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>🎨 Theme & Style Gallery</h2>
                <div class="examples-grid">
                    <div class="example-card">
                        <h4>Dracula Theme</h4>
                        <img src="/commits?account=octocat&theme=dracula&icon=rocket" alt="Dracula theme">
                        <div class="code-block">?theme=dracula&icon=rocket</div>
                    </div>
                    <div class="example-card">
                        <h4>Gradient with Sparkline</h4>
                        <img src="/commits?account=octocat&theme=gradient&sparkline=true" alt="Gradient theme">
                        <div class="code-block">?theme=gradient&sparkline=true</div>
                    </div>
                    <div class="example-card">
                        <h4>Neon Glow Animation</h4>
                        <img src="/commits?account=octocat&theme=neon&animated=glow" alt="Neon theme">
                        <div class="code-block">?theme=neon&animated=glow</div>
                    </div>
                    <div class="example-card">
                        <h4>"For The Badge" Style</h4>
                        <img src="/commits?account=octocat&theme=ocean&style=for-the-badge" alt="Ocean theme">
                        <div class="code-block">?theme=ocean&style=for-the-badge</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>📝 Markdown Usage</h2>
                <p>Copy and paste into your README.md files:</p>
                <div class="code-block">
# Basic
![Daily Commits](${req.protocol}://${req.get('host')}/commits?account=yourusername)

# Themed
![Commits](${req.protocol}://${req.get('host')}/commits?account=yourusername&theme=dark&icon=fire)
                </div>
            </div>

            <footer class="footer">
                <p>Powered by the GitHub GraphQL API | Made for the developer community</p>
            </footer>
        </div>

        <script>
            function updatePreview() {
                const username = document.getElementById('username').value.trim() || 'octocat';
                const params = new URLSearchParams();
                params.set('account', username);

                const period = document.getElementById('period').value;
                if (period) params.set('period', period);

                const theme = document.getElementById('theme').value;
                if (theme) params.set('theme', theme);

                const style = document.getElementById('style').value;
                if (style) params.set('style', style);
                
                const animated = document.getElementById('animated').value;
                if (animated) params.set('animated', animated);

                const icon = document.getElementById('icon').value;
                if (icon) params.set('icon', icon);

                const url = '/commits?' + params.toString();
                
                document.getElementById('previewImg').src = url;
                document.getElementById('badgeUrl').textContent = window.location.origin + url;
            }
            
            document.querySelectorAll('select, input').forEach(element => {
                element.addEventListener('change', updatePreview);
            });
            
            document.getElementById('username').addEventListener('keyup', updatePreview);
            
            window.onload = updatePreview;
        </script>
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