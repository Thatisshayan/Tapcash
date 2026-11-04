# UIUX_GENERATION_PREP.md — TapCash UI/UX Generation Preparation

**Generated:** July 6, 2026  
**Based on:** UIUX_PROPOSAL.md  
**Purpose:** Prepare all assets, tokens, and configurations for UI/UX implementation  

---

## 1. DESIGN TOKEN FILES

### 1.1 `src/styles/tokens.ts`
```typescript
export const colors = {
  primary: '#00D68F',
  primaryHover: '#00B87A',
  secondary: '#1E1E2E',
  accent: '#FFB800',
  danger: '#FF4757',
  success: '#00D68F',
  warning: '#FFB800',
  background: {
    dark: '#0F0F1A',
    card: '#1A1A2E',
    elevated: '#242438',
    modal: '#1A1A2E',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0B8',
    muted: '#6B6B80',
    inverse: '#0F0F1A',
  },
  border: {
    default: '#2A2A3E',
    hover: '#3A3A4E',
    focus: '#00D68F',
  },
  difficulty: {
    easy: '#00D68F',
    medium: '#FFB800',
    hard: '#FF4757',
  },
};

export const typography = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: {
    hero: '3rem',      // 48px
    h1: '2rem',        // 32px
    h2: '1.25rem',     // 20px
    body: '1rem',      // 16px
    small: '0.875rem', // 14px
    coin: '2.25rem',   // 36px
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
};

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
};

export const shadows = {
  card: '0 2px 8px rgba(0, 0, 0, 0.3)',
  elevated: '0 4px 16px rgba(0, 0, 0, 0.4)',
  modal: '0 8px 32px rgba(0, 0, 0, 0.5)',
  glow: (color: string) => `0 0 20px ${color}40`,
};
```

### 1.2 `src/styles/theme.css`
```css
:root {
  --color-primary: #00D68F;
  --color-primary-hover: #00B87A;
  --color-secondary: #1E1E2E;
  --color-accent: #FFB800;
  --color-danger: #FF4757;
  --color-success: #00D68F;
  --color-warning: #FFB800;
  --color-bg-dark: #0F0F1A;
  --color-bg-card: #1A1A2E;
  --color-bg-elevated: #242438;
  --color-bg-modal: #1A1A2E;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #A0A0B8;
  --color-text-muted: #6B6B80;
  --color-text-inverse: #0F0F1A;
  --color-border-default: #2A2A3E;
  --color-border-hover: #3A3A4E;
  --color-border-focus: #00D68F;
  --color-difficulty-easy: #00D68F;
  --color-difficulty-medium: #FFB800;
  --color-difficulty-hard: #FF4757;
  --font-family: 'Inter', system-ui, sans-serif;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-elevated: 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-modal: 0 8px 32px rgba(0, 0, 0, 0.5);
}
```

---

## 2. COMPONENT GENERATION CHECKLIST

### 2.1 Landing Page Components
| Component | File | Dependencies | Status |
|-----------|------|-------------|--------|
| HeroSection | `src/components/landing/HeroSection.tsx` | AnimatedCounter, LiveFeedWidget | ☐ |
| AnimatedCounter | `src/components/ui/AnimatedCounter.tsx` | framer-motion | ☐ |
| LiveFeedWidget | `src/components/landing/LiveFeedWidget.tsx` | api fetch | ☐ |
| HowItWorks | `src/components/landing/HowItWorks.tsx` | framer-motion | ☐ |
| SocialProofBar | `src/components/landing/SocialProofBar.tsx` | AnimatedCounter | ☐ |
| CashoutMethodsStrip | `src/components/landing/CashoutMethodsStrip.tsx` | icons | ☐ |
| FAQSection | `src/components/landing/FAQSection.tsx` | framer-motion | ☐ |
| Footer | `src/components/landing/Footer.tsx` | links | ☐ |

### 2.2 Dashboard Components
| Component | File | Dependencies | Status |
|-----------|------|-------------|--------|
| CoinBalanceWidget | `src/components/dashboard/CoinBalanceWidget.tsx` | AnimatedCounter, ProgressBar | ☐ |
| StreakWidget | `src/components/dashboard/StreakWidget.tsx` | framer-motion, achievements API | ☐ |
| OfferCard | `src/components/dashboard/OfferCard.tsx` | DifficultyBadge, ProgressBar | ☐ |
| OfferGrid | `src/components/dashboard/OfferGrid.tsx` | OfferCard | ☐ |
| MiniFeed | `src/components/dashboard/MiniFeed.tsx` | api fetch | ☐ |
| StatsPanel | `src/components/dashboard/StatsPanel.tsx` | StatBlock | ☐ |
| LeaderboardSection | `src/components/dashboard/LeaderboardSection.tsx` | LeaderboardRow | ☐ |

### 2.3 Cashout Components
| Component | File | Dependencies | Status |
|-----------|------|-------------|--------|
| CashoutPage | `src/components/cashout/CashoutPage.tsx` | Step components | ☐ |
| MethodSelector | `src/components/cashout/MethodSelector.tsx` | CashoutMethod card | ☐ |
| AmountInput | `src/components/cashout/AmountInput.tsx` | slider, input | ☐ |
| ConfirmationPreview | `src/components/cashout/ConfirmationPreview.tsx` | balance display | ☐ |
| SuccessState | `src/components/cashout/SuccessState.tsx` | framer-motion, confetti | ☐ |

### 2.4 Shared UI Components
| Component | File | Dependencies | Status |
|-----------|------|-------------|--------|
| DifficultyBadge | `src/components/ui/DifficultyBadge.tsx` | tokens | ☐ |
| StatBlock | `src/components/ui/StatBlock.tsx` | tokens | ☐ |
| LeaderboardRow | `src/components/ui/LeaderboardRow.tsx` | tokens | ☐ |
| SkeletonCard | `src/components/ui/SkeletonCard.tsx` | tokens | ☐ |
| ProgressBar | `src/components/ui/ProgressBar.tsx` | tokens | ☐ |
| CoinIcon | `src/components/ui/CoinIcon.tsx` | SVG | ☐ |

---

## 3. PAGE LAYOUTS

### 3.1 Landing Page Layout
```
src/app/(marketing)/layout.tsx    — Marketing layout (no auth)
src/app/(marketing)/page.tsx      — Landing page
src/app/(marketing)/privacy/page.tsx
src/app/(marketing)/terms/page.tsx
```

### 3.2 Dashboard Layout
```
src/app/(dashboard)/layout.tsx    — Dashboard layout (auth required)
src/app/(dashboard)/dashboard/page.tsx
src/app/(dashboard)/dashboard/earn/page.tsx
src/app/(dashboard)/dashboard/cashout/page.tsx
src/app/(dashboard)/dashboard/activity/page.tsx
src/app/(dashboard)/dashboard/account/page.tsx
```

### 3.3 API Routes (New)
```
src/app/api/activity/live/route.ts      — Live cashout feed
src/app/api/user/data-export/route.ts   — GDPR data export
src/app/api/user/delete-account/route.ts — Account deletion
src/app/api/auth/session/route.ts       — Session management
```

---

## 4. ASSET REQUIREMENTS

### 4.1 Illustrations (SVG/Lottie)
| Asset | Description | Source |
|-------|-------------|--------|
| signup-illustration | Person signing up on phone | Create or commission |
| offers-illustration | Person completing tasks | Create or commission |
| coins-illustration | Coins flying into wallet | Create or commission |
| cashout-illustration | Money being sent | Create or commission |
| empty-state | Friendly empty state graphic | Create or commission |
| error-state | Error illustration | Create or commission |

### 4.2 Icons
| Icon | Usage | Source |
|------|-------|--------|
| Coin | TapCoin symbol | Custom SVG |
| Streak | Fire/flame icon | Lucide `Flame` |
| Timer | Estimated time | Lucide `Clock` |
| Difficulty | Star rating | Lucide `Star` |
| Cashout | Money icon | Lucide `DollarSign` |
| PayPal | PayPal logo | Brand asset |
| Interac | Interac logo | Brand asset |
| Visa | Visa logo | Brand asset |
| Amazon | Amazon logo | Brand asset |
| Gift Card | Gift icon | Lucide `Gift` |

### 4.3 Animations (Lottie)
| Animation | Trigger | Duration |
|-----------|---------|----------|
| Coin flip | Balance update | 1s |
| Streak fire | Streak increase | 0.5s |
| Success checkmark | Cashout success | 0.8s |
| Confetti | Cashout success | 1.5s |
| Loading spinner | API calls | infinite |

---

## 5. INTEGRATION POINTS

### 5.1 API Endpoints to Call
| Endpoint | Component | Frequency |
|----------|-----------|-----------|
| `/api/stats` | HeroSection, SocialProofBar | 60s |
| `/api/activity/live` | LiveFeedWidget, MiniFeed | 30s |
| `/api/leaderboard/top10` | LeaderboardSection | 300s |
| `/api/user/profile` | CoinBalanceWidget, StatsPanel | 30s |
| `/api/offers` | OfferGrid | on load |
| `/api/user/transactions` | Activity page | on load |
| `/api/user/streak` | StreakWidget | 300s |

### 5.2 WebSocket/Realtime
| Channel | Component | Event |
|---------|-----------|-------|
| Firestore: `users/{uid}` | CoinBalanceWidget | balance update |
| Firestore: `ledger_transactions/{id}` | MiniFeed | new transaction |
| Firestore: `cashout_requests/{id}` | Activity page | status change |

### 5.3 State Management
| State | Location | Update Trigger |
|-------|----------|---------------|
| User profile | AuthContext | login, refresh |
| Coin balance | CoinBalanceWidget (local) | Firestore listener |
| Streak | StreakWidget (local) | Firestore listener |
| Offers | OfferGrid (local) | API fetch |
| Live feed | LiveFeedWidget (local) | API polling |

---

## 6. PERFORMANCE REQUIREMENTS

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP | <2.5s | Lighthouse |
| FCP | <1.8s | Lighthouse |
| CLS | <0.1 | Lighthouse |
| TTI | <3.5s | Lighthouse |
| Bundle size (landing) | <200KB | Next.js build |
| Bundle size (dashboard) | <300KB | Next.js build |
| Image size | <50KB each | Manual |
| Animation FPS | 60fps | Chrome DevTools |

---

## 7. TESTING REQUIREMENTS

| Test Type | Count | Target |
|-----------|-------|--------|
| Component unit tests | 20+ | All new components |
| Page integration tests | 5+ | All new pages |
| E2E flow tests | 3+ | Landing → signup, Dashboard → cashout, etc. |
| Visual regression tests | 5+ | Key screens |

---

## 8. BUILD ORDER

| Order | Component | Depends On | Est. Time |
|-------|-----------|-----------|-----------|
| 1 | Design tokens | — | 2h |
| 2 | UI primitives (Badge, StatBlock, ProgressBar) | tokens | 4h |
| 3 | AnimatedCounter | framer-motion | 2h |
| 4 | CoinBalanceWidget | AnimatedCounter, ProgressBar | 4h |
| 5 | StreakWidget | framer-motion | 4h |
| 6 | DifficultyBadge | tokens | 1h |
| 7 | OfferCard | DifficultyBadge, ProgressBar | 3h |
| 8 | LiveFeedWidget | API | 4h |
| 9 | MiniFeed | API | 2h |
| 10 | HeroSection | AnimatedCounter, LiveFeedWidget | 6h |
| 11 | HowItWorks | framer-motion | 3h |
| 12 | SocialProofBar | AnimatedCounter | 2h |
| 13 | Landing page | All landing components | 4h |
| 14 | Dashboard page | All dashboard components | 4h |
| 15 | Cashout page | All cashout components | 6h |
| 16 | Legal pages | Content only | 2h |
| 17 | Mobile theme sync | All components | 4h |
| **TOTAL** | | | **~54h** |

---

*End of UIUX_GENERATION_PREP.md — All preparation for implementing UIUX_PROPOSAL.md. Follow build order for efficient parallel development.*
