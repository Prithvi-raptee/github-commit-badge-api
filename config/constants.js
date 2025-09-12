// config/constants.js

const THEMES = {
  default: { labelBg: '#555', valueBg: '#007ec6', textColor: '#fff', borderColor: 'none' },
  dark: { labelBg: '#21262d', valueBg: '#238636', textColor: '#f0f6fc', borderColor: '#30363d' },
  'github-dark': { labelBg: '#21262d', valueBg: '#238636', textColor: '#f0f6fc', borderColor: '#30363d' },
  dracula: { labelBg: '#44475a', valueBg: '#bd93f9', textColor: '#f8f8f2', borderColor: '#6272a4' },
  monokai: { labelBg: '#272822', valueBg: '#a6e22e', textColor: '#f8f8f2', borderColor: '#75715e' },
  gradient: { labelBg: 'url(#grad1)', valueBg: 'url(#grad2)', textColor: '#fff', borderColor: 'none' },
  ocean: { labelBg: '#0f4c75', valueBg: '#3282b8', textColor: '#bbe1fa', borderColor: '#0f3460' },
  sunset: { labelBg: '#ff6b6b', valueBg: '#ffa726', textColor: '#fff', borderColor: '#ff5722' },
  neon: { labelBg: '#0a0a0a', valueBg: '#00ff41', textColor: '#00ff41', borderColor: '#00ff41' }
};

const COLORS = {
  red: '#e53e3e', green: '#38a169', blue: '#3182ce', yellow: '#d69e2e',
  purple: '#805ad5', pink: '#d53f8c', orange: '#dd6b20', teal: '#319795',
  cyan: '#0bc5ea', gray: '#718096'
};

const STYLES = {
  flat: { borderRadius: 3, height: 20, border: false, shadow: false },
  'flat-square': { borderRadius: 0, height: 20, border: false, shadow: false },
  plastic: { borderRadius: 4, height: 18, border: true, shadow: true },
  'for-the-badge': {
    borderRadius: 0, height: 28, border: false, shadow: false,
    fontSize: '11', textTransform: 'uppercase', letterSpacing: '1px'
  }
};

module.exports = { THEMES, COLORS, STYLES };