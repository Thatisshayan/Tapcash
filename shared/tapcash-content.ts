export type TapCashNavItem = {
  label: string;
  href: string;
};

export type TapCashStat = {
  value: string;
  label: string;
  detail: string;
};

export type TapCashStep = {
  id: string;
  title: string;
  description: string;
};

export type TapCashTrustPoint = {
  title: string;
  description: string;
};

export type TapCashOffer = {
  id: string;
  title: string;
  provider: string;
  category: string;
  payoutCoins: number;
  estimateMinutes: number;
  description: string;
  accent: "teal" | "blue" | "gold";
  cta: string;
};

export type TapCashPayoutMethod = {
  id: string;
  label: string;
  subtitle: string;
  minCoins: number;
  eta: string;
  accent: "teal" | "blue" | "gold";
  audience: string;
};

export type TapCashFaq = {
  question: string;
  answer: string;
};

export type TapCashActivityItem = {
  label: string;
  detail: string;
  value: string;
};

export type TapCashLedgerSummary = {
  balanceCoins: number;
  balanceCad: string;
  pendingCoins: number;
  verifiedState: string;
};

export const tapCashNavItems: TapCashNavItem[] = [
  { label: "Home", href: "/" },
  { label: "Earn", href: "/dashboard" },
  { label: "Cashout", href: "/cashout" },
  { label: "Activity", href: "/transactions" },
  { label: "Offerwall", href: "/rapidoreach" },
];

export const tapCashStats: TapCashStat[] = [
  { value: "3.9M+", label: "Verified completions", detail: "Offer and survey actions tracked end to end." },
  { value: "50K+", label: "Active earners", detail: "A repeatable rewards loop instead of one-off hype." },
  { value: "$2M+", label: "Total paid out", detail: "Manual review keeps the cashout side disciplined." },
  { value: "24h", label: "Avg payout window", detail: "The queue stays visible even when settlement takes time." },
];

export const tapCashTrustPoints: TapCashTrustPoint[] = [
  {
    title: "Server-verified actions",
    description: "Sensitive changes are still verified on the backend before the ledger moves.",
  },
  {
    title: "Clear payout flow",
    description: "Cashout methods, thresholds, and status updates are easy to scan.",
  },
  {
    title: "Mobile-first scanning",
    description: "The same content model drives the web and the new iPhone shell.",
  },
];

export const tapCashSteps: TapCashStep[] = [
  {
    id: "01",
    title: "Create and verify",
    description: "Set up an account, confirm email once, and unlock the full earning surface.",
  },
  {
    id: "02",
    title: "Choose a high-fit task",
    description: "Start with surveys, then stack streaks, missions, and provider offers.",
  },
  {
    id: "03",
    title: "Cash out cleanly",
    description: "Use the payout store and review the ledger before you request a withdrawal.",
  },
];

export const tapCashOffers: TapCashOffer[] = [
  {
    id: "survey_habits",
    title: "Consumer Habits Survey",
    provider: "RapidoReach",
    category: "Survey",
    payoutCoins: 150,
    estimateMinutes: 8,
    description: "A short survey with a clean approval path and quick coin credit.",
    accent: "teal",
    cta: "Start survey",
  },
  {
    id: "gaming_bonus",
    title: "Download and reach level 10",
    provider: "Lootably",
    category: "Games",
    payoutCoins: 800,
    estimateMinutes: 20,
    description: "Higher-value completion with a clear progress-based reward.",
    accent: "blue",
    cta: "View instructions",
  },
  {
    id: "daily_watch",
    title: "Watch a daily video run",
    provider: "TapCash",
    category: "Video",
    payoutCoins: 25,
    estimateMinutes: 4,
    description: "A lightweight earn path for quick top-up sessions.",
    accent: "gold",
    cta: "Do now",
  },
  {
    id: "referral_boost",
    title: "Invite a friend and both earn",
    provider: "TapCash",
    category: "Referral",
    payoutCoins: 250,
    estimateMinutes: 2,
    description: "Motivates repeat usage without relying on friction-heavy flows.",
    accent: "teal",
    cta: "Share invite",
  },
];

export const tapCashPayoutMethods: TapCashPayoutMethod[] = [
  {
    id: "paypal",
    label: "PayPal Cash",
    subtitle: "Fastest mainstream cashout",
    minCoins: 5000,
    eta: "Usually under 24h",
    accent: "teal",
    audience: "Most users",
  },
  {
    id: "interac",
    label: "Interac e-Transfer",
    subtitle: "Canada-first withdrawal path",
    minCoins: 5000,
    eta: "Manual review window",
    accent: "blue",
    audience: "Canadian users",
  },
  {
    id: "bitcoin",
    label: "Bitcoin",
    subtitle: "Direct crypto payout",
    minCoins: 10000,
    eta: "Queue based",
    accent: "gold",
    audience: "Crypto users",
  },
  {
    id: "gift",
    label: "Gift cards",
    subtitle: "Steam, Tim Hortons, and more",
    minCoins: 5000,
    eta: "Processed manually",
    accent: "teal",
    audience: "Light redeemers",
  },
];

export const tapCashFaqs: TapCashFaq[] = [
  {
    question: "Is TapCash a real rewards product?",
    answer: "Yes. The UI is designed to expose the real backend flow: offer completion, ledger entry, and payout review.",
  },
  {
    question: "Do I need to verify my email?",
    answer: "Yes. Email verification unlocks the earning and cashout surfaces, and it keeps the platform more resistant to abuse.",
  },
  {
    question: "Are payouts automatic?",
    answer: "Not always. Some methods are manual or queued so the backend can verify risk signals before money moves.",
  },
  {
    question: "Will the mobile app mirror the web experience?",
    answer: "Yes. The Expo workspace uses the same content model, CTA hierarchy, and payout-first framing.",
  },
];

export const tapCashActivity: TapCashActivityItem[] = [
  { label: "User_***92", detail: "completed a RapidoReach survey", value: "+500 coins" },
  { label: "User_***15", detail: "requested a PayPal cashout", value: "$25.00 CAD" },
  { label: "User_***44", detail: "cleared a daily mission", value: "+200 coins" },
  { label: "User_***78", detail: "earned from a quick survey", value: "+150 coins" },
];

export const tapCashLeaderboardSeed = [
  { rank: 1, displayName: "Nova", coins: 28450 },
  { rank: 2, displayName: "Avery", coins: 22000 },
  { rank: 3, displayName: "Mika", coins: 17650 },
  { rank: 4, displayName: "Riley", coins: 15125 },
];

export const tapCashLedgerSummary: TapCashLedgerSummary = {
  balanceCoins: 24750,
  balanceCad: "$24.75 CAD",
  pendingCoins: 1200,
  verifiedState: "Verified",
};

export function formatCoins(value: number) {
  return `${value.toLocaleString()} coins`;
}

export function formatCadFromCoins(value: number) {
  return `$${(value / 1000).toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CAD`;
}

export function accentClass(accent: TapCashOffer["accent"] | TapCashPayoutMethod["accent"]) {
  if (accent === "blue") {
    return {
      glow: "shadow-[0_20px_60px_rgba(58,123,255,0.18)]",
      badge: "bg-[#0f1728] text-[#9ec1ff] border-[#2f4f8f]/60",
      ring: "border-[#2a4f8f]/60",
    };
  }

  if (accent === "gold") {
    return {
      glow: "shadow-[0_20px_60px_rgba(245,200,66,0.14)]",
      badge: "bg-[#1a1608] text-[#f5c842] border-[#5d4a15]/60",
      ring: "border-[#5d4a15]/60",
    };
  }

  return {
    glow: "shadow-[0_20px_60px_rgba(0,230,195,0.16)]",
    badge: "bg-[#081716] text-[#8cf8e9] border-[#14403d]/60",
    ring: "border-[#14403d]/60",
  };
}
