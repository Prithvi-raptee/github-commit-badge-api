const { THEMES, COLORS, STYLES } = require('../config/constants');

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

module.exports = { generateEnhancedSvgBadge, errorBadge };
