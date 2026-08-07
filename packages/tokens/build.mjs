/**
 * TapCash token build — single source of truth → both platforms.
 * Reads tokens.json and regenerates the mobile theme (the platform that
 * had drifted onto the legacy palette). Web globals.css is the rendered
 * token layer for web and is kept in parity by packages/tokens/tokens.test.ts.
 *
 * Run: node packages/tokens/build.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', '..');
const tokens = JSON.parse(readFileSync(resolve(__dirname, 'tokens.json'), 'utf8'));

const { primitives: p, semantic: s, typeScale: t, space: sp, radius: r, gradients: g } = tokens;

// ── Mobile theme.ts (TapCash Aurora, typed, generated) ───────────────────────
// Sample data kept but emoji iconography removed (REDESIGN_SPEC anti-pattern);
// fabricated-statistics / fake-live-activity anti-patterns still enforced —
// see packages/tokens/tokens.json meta.antiPatterns and meta.decisionLog.
// Colour KEYS below (green/purple/etc) are kept as the stable public API so
// existing component imports don't break across palette swaps -- only the
// hex VALUES they resolve to change. New code should prefer the semantic
// names (accent, accentBright, accentDeep, accentViolet, accentBlue).
const mobileTheme = `/**
 * TapCash Aurora Design System — GENERATED FILE.
 * Do not edit by hand. Edit packages/tokens/tokens.json and run build.mjs.
 * Source of truth: packages/tokens/tokens.json (Aurora palette, v3).
 */

export const theme = {
  colors: {
    // Base / surfaces
    bg: '${p.obsidian}',
    background: '${p.obsidian}',
    surfaceBase: '${s['surface-base']}',
    line: '${s['border-hairline']}',
    border: '${s['border-hairline']}',

    // Text
    text: '${s['text-primary']}',
    muted: '${s['text-secondary']}',
    dim: '${s['text-tertiary']}',
    ghost: '${s['text-ghost']}',

    // Semantic accents (Aurora) -- keys held stable across the Neon/Model-U ->
    // Aurora swap so existing component imports keep working; values changed.
    accent: '${p.gold}',
    accentBright: '${p.goldBright}',
    accentDeep: '${p.goldDeep}',
    accentViolet: '${p.violet}',
    accentBlue: '${p.blue}',
    green: '${p.gold}',
    greenHover: '${p.goldBright}',
    cyan: '${p.blue}',
    purple: '${p.violet}',
    yellow: '${p.gold}',
    gold: '${p.gold}',
    red: '${p.red}',
    danger: '${p.red}',
  },
  gradients: {
    primary: '${g.goldPrimary}',
    goldText: '${g.goldText}',
    cashpathLine: '${g.cashpathLine}',
    hero: 'radial-gradient(circle at 45% 16%, rgba(217,182,120,0.16), transparent 28%), radial-gradient(circle at 64% 8%, rgba(108,92,224,0.18), transparent 26%)',
  },
  radius: {
    xs: ${Number(r.sm.replace('px', ''))},
    sm: ${Number(r.md.replace('px', ''))},
    md: ${Number(r.lg.replace('px', ''))},
    lg: ${Number(r.xl.replace('px', ''))},
    xl: ${Number(r['2xl'].replace('px', ''))},
    full: 999,
  },
  spacing: {
    xs: ${Number(sp['1'].replace('px', ''))},
    sm: ${Number(sp['2'].replace('px', ''))},
    md: ${Number(sp['4'].replace('px', ''))},
    lg: ${Number(sp['6'].replace('px', ''))},
    xl: ${Number(sp['8'].replace('px', ''))},
  },
  font: {
    xs: ${Number(t.xs.replace('px', ''))},
    sm: ${Number(t.sm.replace('px', ''))},
    md: ${Number(t.base.replace('px', ''))},
    lg: ${Number(t.lg.replace('px', ''))},
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
`;

const mobilePath = resolve(root, 'mobile', 'src', 'theme.ts');
writeFileSync(mobilePath, mobileTheme, 'utf8');

console.log('[tokens] wrote', mobilePath.replace(root, '.'));
console.log('[tokens] mobile theme converged to Aurora:', p.gold, p.violet, p.obsidian);
console.log('[tokens] OK — run `jest packages/tokens/tokens.test.ts` to verify parity.');
