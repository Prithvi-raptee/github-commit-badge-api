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
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                background: white;
                min-height: 100vh;
                box-shadow: 0 0 30px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
                padding: 40px 0;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                border-radius: 15px;
                margin: -20px -20px 40px -20px;
            }
            .header h1 {
                font-size: 3em;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .header p {
                font-size: 1.2em;
                opacity: 0.9;
            }
            .section {
                margin-bottom: 40px;
                padding: 25px;
                background: #f8f9fa;
                border-radius: 10px;
                border-left: 4px solid #667eea;
            }
            .section h2 {
                color: #2c3e50;
                margin-bottom: 20px;
                font-size: 1.8em;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .quick-start {
                background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
                color: white;
                border-left: 4px solid #00b894;
            }
            .quick-start h2 {
                color: white;
            }
            code {
                background: #2d3748;
                color: #ed8936;
                padding: 8px 12px;
                border-radius: 6px;
                font-family: 'Monaco', 'Consolas', monospace;
                font-size: 0.9em;
                display: inline-block;
                margin: 5px 0;
                word-break: break-all;
            }
            .code-block {
                background: #2d3748;
                color: #e2e8f0;
                padding: 20px;
                border-radius: 8px;
                margin: 15px 0;
                overflow-x: auto;
                font-family: 'Monaco', 'Consolas', monospace;
            }
            .params-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }
            .param-card {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                border-top: 3px solid #667eea;
            }
            .param-card h4 {
                color: #667eea;
                margin-bottom: 10px;
                font-size: 1.1em;
            }
            .param-card .param-name {
                background: #667eea;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-family: monospace;
                font-size: 0.9em;
            }
            .examples-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 25px;
                margin: 25px 0;
            }
            .example-card {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                border: 1px solid #e1e8ed;
            }
            .example-card h4 {
                color: #2c3e50;
                margin-bottom: 15px;
                font-size: 1.1em;
            }
            .example-card img {
                margin: 10px 0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                border-radius: 4px;
            }
            .try-it {
                background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                margin: 40px 0;
                color: #2c3e50;
            }
            .try-it h3 {
                font-size: 1.5em;
                margin-bottom: 15px;
            }
            .input-group {
                display: flex;
                gap: 10px;
                margin: 20px 0;
                flex-wrap: wrap;
                justify-content: center;
            }
            .input-group input, .input-group select {
                padding: 10px;
                border: 2px solid #ddd;
                border-radius: 6px;
                font-size: 1em;
                min-width: 120px;
            }
            .btn {
                background: #667eea;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 1em;
                text-decoration: none;
                display: inline-block;
                transition: all 0.3s ease;
            }
            .btn:hover {
                background: #5a67d8;
                transform: translateY(-2px);
            }
            .feature-highlight {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 15px;
                margin: 30px 0;
                text-align: center;
            }
            .features-list {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin: 20px 0;
            }
            .feature-item {
                background: rgba(255,255,255,0.1);
                padding: 15px;
                border-radius: 8px;
                backdrop-filter: blur(10px);
            }
            .footer {
                text-align: center;
                padding: 40px 20px;
                background: #2c3e50;
                color: white;
                margin: 40px -20px -20px -20px;
                border-radius: 0 0 15px 15px;
            }
            @media (max-width: 768px) {
                .container {
                    padding: 10px;
                }
                .header h1 {
                    font-size: 2em;
                }
                .examples-grid {
                    grid-template-columns: 1fr;
                }
                .input-group {
                    flex-direction: column;
                    align-items: center;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header class="header">
                <h1>🏆 GitHub Commit Badge API</h1>
                <p>Generate beautiful, customizable badges showing GitHub commit activity with advanced theming, animations, and visual enhancements!</p>
            </header>

            <div class="section quick-start">
                <h2>🚀 Quick Start</h2>
                <p>Get started in seconds! Just replace <strong>USERNAME</strong> with any GitHub username:</p>
                <div class="code-block">${req.protocol}://${req.get('host')}/commits?account=USERNAME</div>
                <p><strong>Example:</strong></p>
                <code>${req.protocol}://${req.get('host')}/commits?account=octocat</code>
                <br><br>
                <img src="/commits?account=octocat" alt="Basic example" style="box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 4px;">
            </div>

            <div class="feature-highlight">
                <h2>✨ Key Features</h2>
                <div class="features-list">
                    <div class="feature-item">📊 <strong>Multiple Periods</strong><br>Week, Month, Quarter, Half, Year</div>
                    <div class="feature-item">🎨 <strong>9 Themes</strong><br>Dark, Gradient, Neon & More</div>
                    <div class="feature-item">🌈 <strong>10 Colors</strong><br>Red, Green, Blue, Purple & More</div>
                    <div class="feature-item">🎭 <strong>4 Styles</strong><br>Flat, Square, Plastic, Badge</div>
                    <div class="feature-item">⚡ <strong>Animations</strong><br>Pulse, Glow, Slide Effects</div>
                    <div class="feature-item">🚀 <strong>Icons</strong><br>Fire, Rocket, Trophy & More</div>
                    <div class="feature-item">📈 <strong>Sparklines</strong><br>Mini Trend Charts</div>
                    <div class="feature-item">⚡ <strong>Smart Caching</strong><br>6-hour Performance Cache</div>
                </div>
            </div>

            <div class="try-it">
                <h3>🎮 Interactive Badge Builder</h3>
                <p>Customize your badge in real-time!</p>
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
                <button class="btn" onclick="updatePreview()">🎨 Generate Badge</button>
                <div id="preview" style="margin: 20px 0; min-height: 50px;">
                    <img id="previewImg" src="/commits?account=octocat" alt="Preview">
                </div>
                <div id="badgeUrl" style="background: rgba(0,0,0,0.1); padding: 15px; border-radius: 6px; margin-top: 15px; word-break: break-all; font-family: monospace;"></div>
            </div>

            <div class="section">
                <h2>📋 Complete Parameter Reference</h2>
                <div class="params-grid">
                    <div class="param-card">
                        <h4>🔧 Core Parameters</h4>
                        <p><span class="param-name">account</span> - GitHub username (required)</p>
                        <p><span class="param-name">period</span> - Time range: week, month, quarter, half, year</p>
                    </div>
                    <div class="param-card">
                        <h4>🎨 Visual Parameters</h4>
                        <p><span class="param-name">theme</span> - Badge theme (9 available)</p>
                        <p><span class="param-name">color</span> - Custom color override</p>
                        <p><span class="param-name">style</span> - Badge style (4 available)</p>
                    </div>
                    <div class="param-card">
                        <h4>⚡ Enhancement Parameters</h4>
                        <p><span class="param-name">animated</span> - Animation type</p>
                        <p><span class="param-name">icon</span> - Emoji icon to display</p>
                        <p><span class="param-name">sparkline</span> - Show mini chart (true/false)</p>
                        <p><span class="param-name">border</span> - Add border (true/false)</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>🎨 Theme Gallery</h2>
                <div class="examples-grid">
                    <div class="example-card">
                        <h4>🌟 Default Theme</h4>
                        <img src="/commits?account=octocat&theme=default" alt="Default theme">
                        <div class="code-block">?theme=default</div>
                    </div>
                    <div class="example-card">
                        <h4>🌙 Dark Theme</h4>
                        <img src="/commits?account=octocat&theme=dark&icon=fire" alt="Dark theme">
                        <div class="code-block">?theme=dark&icon=fire</div>
                    </div>
                    <div class="example-card">
                        <h4>🧛 Dracula Theme</h4>
                        <img src="/commits?account=octocat&theme=dracula&icon=rocket" alt="Dracula theme">
                        <div class="code-block">?theme=dracula&icon=rocket</div>
                    </div>
                    <div class="example-card">
                        <h4>🌈 Gradient Theme</h4>
                        <img src="/commits?account=octocat&theme=gradient&sparkline=true" alt="Gradient theme">
                        <div class="code-block">?theme=gradient&sparkline=true</div>
                    </div>
                    <div class="example-card">
                        <h4>💚 Neon Theme</h4>
                        <img src="/commits?account=octocat&theme=neon&animated=glow" alt="Neon theme">
                        <div class="code-block">?theme=neon&animated=glow</div>
                    </div>
                    <div class="example-card">
                        <h4>🌊 Ocean Theme</h4>
                        <img src="/commits?account=octocat&theme=ocean&style=for-the-badge" alt="Ocean theme">
                        <div class="code-block">?theme=ocean&style=for-the-badge</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>🚀 Advanced Examples</h2>
                <div class="examples-grid">
                    <div class="example-card">
                        <h4>🏆 Achievement Style</h4>
                        <img src="/commits?account=octocat&style=for-the-badge&icon=trophy&color=purple&animated=pulse" alt="Achievement style">
                        <div class="code-block">?style=for-the-badge&icon=trophy&color=purple&animated=pulse</div>
                    </div>
                    <div class="example-card">
                        <h4>📈 Analytics Style</h4>
                        <img src="/commits?account=octocat&theme=monokai&sparkline=true&icon=chart&period=quarter" alt="Analytics style">
                        <div class="code-block">?theme=monokai&sparkline=true&icon=chart&period=quarter</div>
                    </div>
                    <div class="example-card">
                        <h4>🔥 Streamer Style</h4>
                        <img src="/commits?account=octocat&theme=sunset&animated=slide&icon=fire&style=plastic" alt="Streamer style">
                        <div class="code-block">?theme=sunset&animated=slide&icon=fire&style=plastic</div>
                    </div>
                    <div class="example-card">
                        <h4>💎 Premium Style</h4>
                        <img src="/commits?account=octocat&theme=gradient&style=for-the-badge&sparkline=true&animated=glow&icon=star" alt="Premium style">
                        <div class="code-block">?theme=gradient&style=for-the-badge&sparkline=true&animated=glow&icon=star</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>📝 Markdown Usage</h2>
                <p>Copy and paste these examples into your README.md files:</p>
                <div class="code-block">
<!-- Basic usage -->
![Daily Commits](${req.protocol}://${req.get('host')}/commits?account=yourusername)

<!-- Themed badge -->
![Commits](${req.protocol}://${req.get('host')}/commits?account=yourusername&theme=dark&icon=fire)

<!-- Complete dashboard -->
| Period | Badge |
|--------|-------|
| Week | ![Week](${req.protocol}://${req.get('host')}/commits?account=yourusername&period=week&theme=dark) |
| Month | ![Month](${req.protocol}://${req.get('host')}/commits?account=yourusername&period=month&theme=gradient) |
| Year | ![Year](${req.protocol}://${req.get('host')}/commits?account=yourusername&period=year&theme=neon) |
                </div>
            </div>

            <div class="section">
                <h2>⚡ Performance & Caching</h2>
                <div class="params-grid">
                    <div class="param-card">
                        <h4>🏎️ Fast Response Times</h4>
                        <p>6-hour intelligent caching system ensures lightning-fast badge loading while keeping data fresh.</p>
                    </div>
                    <div class="param-card">
                        <h4>🛡️ Error Resilience</h4>
                        <p>Graceful fallback to cached data during GitHub API issues. Always shows a badge, never breaks your README.</p>
                    </div>
                    <div class="param-card">
                        <h4>📊 GitHub API Optimized</h4>
                        <p>Respects GitHub rate limits with smart request batching and authenticated API access.</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>🔗 API Endpoints</h2>
                <div class="code-block">
GET ${req.protocol}://${req.get('host')}/commits
    ?account=<username>          # Required: GitHub username
    &period=<week|month|quarter|half|year>  # Optional: Time period
    &theme=<theme_name>          # Optional: Visual theme
    &color=<color_name>          # Optional: Custom color
    &style=<style_name>          # Optional: Badge style
    &animated=<animation_type>   # Optional: Animation
    &icon=<icon_name>            # Optional: Emoji icon
    &sparkline=<true|false>      # Optional: Mini chart
    &border=<true|false>         # Optional: Border
                </div>
            </div>

            <footer class="footer">
                <h3>🚀 Ready to Enhance Your GitHub Profile?</h3>
                <p>Start using these beautiful commit badges in your repositories today!</p>
                <br>
                <p>Made with ❤️ for the GitHub community | Powered by GitHub GraphQL API</p>
                <p style="margin-top: 20px; opacity: 0.8;">
                    <strong>Pro Tip:</strong> Bookmark this page for easy access to all parameters and examples!
                </p>
            </footer>
        </div>

        <script>
            function updatePreview() {
                const username = document.getElementById('username').value || 'octocat';
                const period = document.getElementById('period').value;
                const theme = document.getElementById('theme').value;
                const style = document.getElementById('style').value;
                const animated = document.getElementById('animated').value;
                const icon = document.getElementById('icon').value;
                
                let url = '/commits?account=' + encodeURIComponent(username);
                if (period !== 'month') url += '&period=' + period;
                if (theme !== 'default') url += '&theme=' + theme;
                if (style !== 'flat') url += '&style=' + style;
                if (animated) url += '&animated=' + animated;
                if (icon) url += '&icon=' + icon;
                
                document.getElementById('previewImg').src = url;
                document.getElementById('badgeUrl').textContent = window.location.origin + url;
            }
            
            // Update preview when dropdowns change
            document.querySelectorAll('select, input').forEach(element => {
                element.addEventListener('change', updatePreview);
            });
            
            // Initialize
            updatePreview();
            
            // Add some interactive hover effects
            document.querySelectorAll('.example-card').forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px)';
                    this.style.transition = 'all 0.3s ease';
                });
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
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