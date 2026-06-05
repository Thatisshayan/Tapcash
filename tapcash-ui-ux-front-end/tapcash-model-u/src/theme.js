export const theme = {
  colors: {
    bg: "#050813",
    panel: "rgba(9,16,31,0.74)",
    panel2: "rgba(10,18,34,0.56)",
    line: "rgba(150,190,255,0.14)",
    text: "#f6f8ff",
    muted: "#9aa8c6",
    cyan: "#18d9ff",
    green: "#31f06f",
    purple: "#7c3dff",
    yellow: "#ffc442",
    surface: "rgba(8,19,35,0.62)",
    surfaceSolid: "#060b16",
    greenGlow: "rgba(49,240,111,0.45)",
    cyanGlow: "rgba(24,217,255,0.15)",
    purpleGlow: "rgba(124,61,255,0.22)",
  },
  radius: {
    sm: 12,
    md: 15,
    lg: 22,
    xl: 28,
    pill: 99,
  },
  shadow: {
    card: "inset 0 1px rgba(255,255,255,0.04)",
    glow: "0 16px 44px rgba(24,217,255,0.15)",
    heavy: "0 38px 60px rgba(0,0,0,0.42)",
  },
  font: {
    family: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
};

export const offers = [
  { id: 1, title: "Monopoly Go!", payout: "$35.00", image: "\uD83C\uDFA9", tags: ["Easy", "Fast"], platform: "iOS", hot: true },
  { id: 2, title: "Warzone Mobile", payout: "$25.00", image: "\uD83C\uDFAE", tags: ["Medium", "Popular"], platform: "Android", hot: false },
  { id: 3, title: "Bingo Blitz", payout: "$20.00", image: "\uD83C\uDFB2", tags: ["Easy", "No Purchase"], platform: "iOS", hot: false },
];

export const cashPath = [
  { step: 1, title: "Choose Offer", text: "Pick one you like", icon: "gamepad" },
  { step: 2, title: "Tracking", text: "We track it", icon: "target" },
  { step: 3, title: "Pending", text: "Almost there", icon: "clock" },
  { step: 4, title: "Approved", text: "Reward confirmed", icon: "check" },
  { step: 5, title: "Cashed Out", text: "Paid to you", icon: "wallet" },
];

export const dashboardOffers = [
  { id: "survey_1", title: "Consumer Habits Survey", provider: "RapidoReach", category: "Survey", payout: "150 coins", time: "8 min", accent: "teal" },
  { id: "game_1", title: "Download and reach level 10", provider: "Lootably", category: "Games", payout: "800 coins", time: "20 min", accent: "blue" },
  { id: "video_1", title: "Watch a daily video run", provider: "TapCash", category: "Video", payout: "25 coins", time: "4 min", accent: "gold" },
  { id: "refer_1", title: "Invite a friend and both earn", provider: "TapCash", category: "Referral", payout: "250 coins", time: "2 min", accent: "teal" },
];

export const payoutMethods = [
  { id: "paypal", label: "PayPal Cash", subtitle: "Fastest mainstream cashout", min: "5,000 coins", eta: "Usually under 24h", audience: "Most users", accent: "teal" },
  { id: "interac", label: "Interac e-Transfer", subtitle: "Canada-first withdrawal path", min: "5,000 coins", eta: "Manual review window", audience: "Canadian users", accent: "blue" },
  { id: "bitcoin", label: "Bitcoin", subtitle: "Direct crypto payout", min: "10,000 coins", eta: "Queue based", audience: "Crypto users", accent: "gold" },
  { id: "gift", label: "Gift cards", subtitle: "Steam, Tim Hortons, and more", min: "5,000 coins", eta: "Processed manually", audience: "Light redeemers", accent: "teal" },
];

export const activityFeed = [
  { user: "User_***92", action: "completed a RapidoReach survey", value: "+500 coins" },
  { user: "User_***15", action: "requested a PayPal cashout", value: "$25.00 CAD" },
  { user: "User_***44", action: "cleared a daily mission", value: "+200 coins" },
  { user: "User_***78", action: "earned from a quick survey", value: "+150 coins" },
];

export const leaderboard = [
  { rank: 1, name: "Nova", coins: 28450 },
  { rank: 2, name: "Avery", coins: 22000 },
  { rank: 3, name: "Mika", coins: 17650 },
  { rank: 4, name: "Riley", coins: 15125 },
];
