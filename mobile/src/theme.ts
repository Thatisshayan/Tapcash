/**
 * TapCash Neon Design System — GENERATED FILE.
 * Do not edit by hand. Edit packages/tokens/tokens.json and run build.mjs.
 * Source of truth: packages/tokens/tokens.json (TapCash Neon palette, v2).
 */

export const theme = {
  colors: {
    // Base / surfaces
    bg: '#080C14',
    background: '#080C14',
    surfaceBase: '#080C14',
    surfaceRaised: '#111624',
    surfaceOverlay: '#1A2133',
    panel: 'rgba(17, 22, 36, 0.9)',
    line: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.08)',

    // Text
    text: '#FFFFFF',
    muted: '#B5B6B9',
    dim: '#84868A',

    // Legacy-named surface slots (kept for backward-compatible imports)
    card: '#111624',
    elevated: '#1A2133',

    // Semantic accents (Model U)
    green: '#14F195',
    greenHover: '#00E676',
    cyan: '#00B4D8',
    purple: '#6D28D9',
    yellow: '#FFC442',
    gold: '#FFC442',
    red: '#FF2F42',
    danger: '#FF2F42',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #14F195, #00B4D8)',
    green: 'linear-gradient(90deg, #14F195, #00E676)',
    cyanPurple: 'linear-gradient(90deg, #00B4D8, #6D28D9)',
    panel: 'linear-gradient(145deg, rgba(17, 22, 36, 0.9), rgba(12, 16, 26, 0.9))',
    hero: 'radial-gradient(circle at 45% 16%, rgba(29, 214, 255, 0.16), transparent 28%), radial-gradient(circle at 64% 8%, rgba(124, 61, 255, 0.22), transparent 26%)',
  },
  radius: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 22,
    xl: 28,
    full: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  font: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    hero: 86,
  },
};

// Backwards-compatible alias for files still importing tapCashTheme
export const tapCashTheme = theme;

// Type exports
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeGradients = typeof theme.gradients;

// Sample data for components (emoji-free; see REDESIGN_SPEC anti-patterns)
export const sampleOffers = [
  { id: 1, title: 'Monopoly Go!', payout: '$35.00', tags: ['Easy', 'Fast'], platform: 'iOS', hot: true, tapScore: 94 },
  { id: 2, title: 'Warzone Mobile', payout: '$25.00', tags: ['Medium', 'Popular'], platform: 'Android', hot: false, tapScore: 87 },
  { id: 3, title: 'Bingo Blitz', payout: '$20.00', tags: ['Easy', 'No Purchase'], platform: 'iOS', hot: false, tapScore: 91 },
];

export const cashPathSteps = [
  { step: 1, title: 'Choose Offer', text: 'Pick one you like', icon: 'gamepad' },
  { step: 2, title: 'Tracking', text: 'We track it', icon: 'target' },
  { step: 3, title: 'Pending', text: 'Almost there', icon: 'clock' },
  { step: 4, title: 'Approved', text: 'Reward confirmed', icon: 'check' },
  { step: 5, title: 'Cashed Out', text: 'Paid to you', icon: 'wallet' },
];

export const dashboardOffers = [
  { id: 'survey_1', title: 'Consumer Habits Survey', provider: 'RapidoReach', category: 'Survey', payout: '150 coins', time: '8 min', accent: 'success' },
  { id: 'game_1', title: 'Download and reach level 10', provider: 'Lootably', category: 'Games', payout: '800 coins', time: '20 min', accent: 'info' },
  { id: 'video_1', title: 'Watch a daily video run', provider: 'TapCash', category: 'Video', payout: '25 coins', time: '4 min', accent: 'reward' },
  { id: 'refer_1', title: 'Invite a friend and both earn', provider: 'TapCash', category: 'Referral', payout: '250 coins', time: '2 min', accent: 'success' },
];

// NOTE: Interac e-Transfer intentionally omitted — frozen per Shayan's
// 2026-08-06 launch-push decision (no UI, code path, or docs referencing it).
export const payoutMethods = [
  { id: 'paypal', label: 'PayPal Cash', subtitle: 'Fastest mainstream cashout', min: '5,000 coins', eta: 'Usually under 24h', audience: 'Most users', accent: 'success' },
  { id: 'bank', label: 'Bank Transfer', subtitle: 'Direct to your account', min: '5,000 coins', eta: '1-3 business days', audience: 'Most users', accent: 'info' },
  { id: 'bitcoin', label: 'Bitcoin', subtitle: 'Direct crypto payout', min: '10,000 coins', eta: 'Queue based', audience: 'Crypto users', accent: 'reward' },
  { id: 'gift', label: 'Gift cards', subtitle: 'Steam, Tim Hortons, and more', min: '5,000 coins', eta: 'Processed manually', audience: 'Light redeemers', accent: 'success' },
];

export const activityFeed = [
  { user: 'User_***92', action: 'completed a RapidoReach survey', value: '+500 coins' },
  { user: 'User_***15', action: 'requested a PayPal cashout', value: '$25.00 CAD' },
  { user: 'User_***44', action: 'cleared a daily mission', value: '+200 coins' },
  { user: 'User_***78', action: 'earned from a quick survey', value: '+150 coins' },
];

export const leaderboard = [
  { rank: 1, name: 'Nova', coins: 28450 },
  { rank: 2, name: 'Avery', coins: 22000 },
  { rank: 3, name: 'Mika', coins: 17650 },
  { rank: 4, name: 'Riley', coins: 15125 },
];
