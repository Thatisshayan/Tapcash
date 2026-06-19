export const theme = {
  colors: {
    bg: '#0d0d1a',
    background: '#0d0d1a',
    card: '#13132b',
    surface: '#13132b',
    elevated: '#1a1a35',
    surfaceAlt: '#1a1a35',
    border: 'rgba(255,255,255,0.07)',
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.5)',
    dim: 'rgba(255,255,255,0.25)',
    green: '#00FF85',
    accent: '#00FF85',
    purple: '#7B5CF0',
    purpleDark: '#5b3fd4',
    cyan: '#00D4FF',
    gold: '#FFAB00',
  },
  radius: { xs: 8, sm: 12, md: 16, lg: 20, xl: 24, full: 999 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  font: { xs: 11, sm: 13, md: 15, lg: 18, xl: 24, xxl: 32, hero: 42 },
};

// Backwards-compatible alias for files still importing tapCashTheme
export const tapCashTheme = theme;
