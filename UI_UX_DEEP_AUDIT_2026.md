# TapCash — Deep UI/UX & Front-End Audit (Web + Mobile)

**Date:** 2026-08-03
**Auditor:** Hermes (U)
**Repo:** `D:\AgentDevWork\repos\tapcash`
**Branch:** `agent/hermes-governance-bootstrap`
**Scope:** Web app (Next.js 16 / React 19 / Tailwind v4) + Mobile app (Expo SDK 56 / RN 0.85)
**Method:** Full static read of 130 web `.tsx` files and 29 mobile files, plus measured
asset weights, computed WCAG contrast ratios, typecheck and lint execution.

> Every number in this report was produced by running a tool against the repo.
> Nothing here is estimated.

---

## 0. VERDICT

TapCash does not have one design system. It has **four overlapping ones**, layered by
successive rewrites that were never cleaned up:

1. `@theme` tokens in `src/app/globals.css` (the "Model U" system, `#050813` / `#31F06F`)
2. A parallel TS object in `src/styles/theme.ts` (same values, different API, unused by most components)
3. The legacy palette still live in the shipping landing page (`#0d0d1a` / `#00FF85` / `#7B5CF0`)
4. A separate mobile palette in `mobile/src/theme.ts` (`#0d0d1a` / `#00FF85`) that matches #3, not #1

The result: **1,146 hardcoded hex colors across 103 unique values** in a codebase that
already ships a token layer. The token layer is decorative — components bypass it.

On top of that, the mobile app is **not shippable in its current asset state**: every
single file in `mobile/assets/` is a 1×1 pixel placeholder, including the app icon.

**Redesign is the correct call.** This is not a polish job. The recommendation is a
token-first rebuild of the visual layer with a shared cross-platform palette, executed
against the surface inventory in §2 — not a from-scratch rewrite of the business logic,
which is largely sound.

---

## 1. BLOCKERS FOUND (fix before any redesign work starts)

| # | Severity | Finding | Evidence |
|---|----------|---------|----------|
| B1 | **CRITICAL** | Typecheck fails — JSX fragment syntax error | `src/app/admin/fraud/page.tsx:428-471`, 4 × TS errors |
| B2 | **CRITICAL** | All mobile assets are 1×1 px placeholders (69 bytes each), incl. app icon | `mobile/assets/*` — 11 files, all byte-identical |
| B3 | **CRITICAL** | ESLint completely non-functional | `eslint-plugin-react` crash: `contextOrFilename.getFilename is not a function` |
| B4 | **HIGH** | Money bug: `OfferCard` (web + mobile) divides coins by **100**; canonical rate is **/1000** | `src/components/OfferCard.tsx:34` + `mobile/src/components/OfferCard.tsx:12` vs `shared/tapcash-content.ts:304` |
| B5 | **HIGH** | Mobile references a font that does not exist and is never loaded | `JetBrainsMono-Regular` × 4 sites; no font file, no `useFonts()` |
| B6 | **HIGH** | 84 MB of unoptimized PNGs in `public/`; 0 WebP/AVIF | 34 PNGs, largest 4.79 MB @ 2560×1440 |
| B7 | **HIGH** | 20.2 MB of byte-identical duplicate images shipped twice | 13 duplicate pairs, e.g. `offer-1.png` == `ChatGPTImageJun14…05_11_56PM.png` |

### B1 — the typecheck failure, in detail

```
src/app/admin/fraud/page.tsx(428,9): error TS17015: Expected corresponding closing tag for JSX fragment.
src/app/admin/fraud/page.tsx(428,12): error TS1382: Unexpected token. Did you mean `{'>'}` or `&gt;`?
src/app/admin/fraud/page.tsx(429,3): error TS1003: Identifier expected.
src/app/admin/fraud/page.tsx(471,17): error TS1381: Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
```

Line 429 reads `</>) : fraudTab === 'blocked_ips' ? (` — a fragment is being closed inside a
ternary whose opening tag doesn't match. `npm run type-check` cannot pass. This means the
repo currently has **no working type gate and no working lint gate simultaneously**.

---
## 2. SURFACE INVENTORY

### 2.1 Web — 42 routes

**Public / marketing (16):** `/`, `/about`, `/how-it-works`, `/faq`, `/help`, `/contact`,
`/careers`, `/blog`, `/blog/[slug]`, `/games`, `/rewards`, `/leaderboard`, `/cashPath`,
`/tapScore`, `/affiliate`, `/ref/[refId]`

**Legal (4):** `/privacy`, `/terms`, `/cookies` + cookie consent overlay

**Auth (3):** `/auth/signin`, `/auth/signup`, `/auth/verify-email`

**Authenticated product (7):** `/dashboard`, `/cashout`, `/cashout/status`, `/transactions`,
`/payouts`, `/referrals`, `/rapidoreach`

**Admin (8):** `/admin`, `/admin/dashboard`, `/admin/users`, `/admin/transactions`,
`/admin/offers`, `/admin/fraud`, `/admin/multiplier`, `/admin/promo-analytics`

**System (4):** `error.tsx`, `loading.tsx`, `not-found.tsx`, `layout.tsx`

### 2.2 Mobile — 6 tab screens + 5 auth screens

| Screen | File | Lines |
|--------|------|-------|
| Home | `mobile/app/(tabs)/index.tsx` | 245 |
| Earn | `mobile/app/(tabs)/earn.tsx` | 359 |
| Cashout | `mobile/app/(tabs)/cashout.tsx` | 304 |
| Activity | `mobile/app/(tabs)/activity.tsx` | 212 |
| Account | `mobile/app/(tabs)/account.tsx` | 330 |
| Offer detail | `mobile/app/(tabs)/offer/[id].tsx` | 240 |
| Welcome | `mobile/app/(auth)/welcome.tsx` | 134 |
| Verify email | `mobile/app/(auth)/verify-email.tsx` | 110 |
| Sign up | `mobile/app/(auth)/signup.tsx` | 83 |
| Sign in | `mobile/app/(auth)/signin.tsx` | 79 |

Shared components: `GlassCard`, `OfferCard`, `ScreenFrame`, `TapScoreRing`, `PulsingDot`,
`NetworkBanner`, `ErrorBoundary` (7 total).

### 2.3 Component graph rot

**32 of ~70 web components are orphaned** — defined, styled, maintained, never imported:

```
admin/AdminOverviewPremium        dashboard/BalanceCardsPremium
admin/FraudManagementPremium      dashboard/LeaderboardPremium
admin/TransactionManagementPremium dashboard/OfferGridPremium
admin/UserManagementPremium       dashboard/TransactionHistoryPremium
cashout/BalanceSummaryPremium     landing/CashPathLivePremium
cashout/CashoutFormPremium        landing/HeroDynamic
cashout/PayoutHistoryPremium      landing/HeroPremium
cashout/PayoutMethodsPremium      landing/TapScoreSectionPremium
sections/FinalCTASection          landing/TopOffersPremium
sections/HowItWorksSection        landing/TrustStripPremium
sections/PayoutMethodsSection     ui/DashboardMockup
sections/PayoutTicker             BrandLogos, CashPathFlow
sections/StatsSection             CompletionReceiptModal
sections/TestimonialsSection      OnboardingModal
TapScoreIndicator                 PushNotificationPrompt
TrustBadges
```

**Seven competing Hero implementations exist.** Only one ships:

| Component | Shipped? |
|-----------|----------|
| `sections/HeroSection` | ✅ imported by `src/app/page.tsx:28` |
| `landing/Hero` | ❌ |
| `landing/HeroDynamic` | ❌ orphan |
| `landing/HeroPremium` | ❌ orphan |
| `landing/HeroV1Balanced` | ❌ A/B variant, unreferenced |
| `landing/HeroV2Gaming` | ❌ A/B variant, unreferenced |
| `landing/HeroV3Offers` | ❌ A/B variant, unreferenced |

Same pattern for `TrustStrip` (3 versions), `TopOffers` (2), `PayoutMethods` (2),
`CashPath` (2), `TapScoreSection` (2 — same name in two directories).

**Impact:** any redesign touching "the hero" has a 6-in-7 chance of editing dead code.
This is the single biggest velocity tax in the repo.

---
## 3. DESIGN SYSTEM AUDIT

### 3.1 The palette fork — four sources of truth

| Source | Background | Green | Purple | Cyan |
|--------|-----------|-------|--------|------|
| `globals.css` `@theme` | `#050813` | `#31F06F` | `#7C3DFF` | `#18D9FF` |
| `src/styles/theme.ts` | `#050813` | `#31F06F` | `#7C3DFF` | `#18D9FF` |
| `src/app/layout.tsx:70` (inline) | **`#0a0f0d`** | — | — | — |
| `sections/HeroSection.tsx` (shipping) | **`#0d0d1a`** | **`#00FF85`** | **`#7B5CF0`** | **`#00D4FF`** |
| `mobile/src/theme.ts` | **`#0d0d1a`** | **`#00FF85`** | **`#7B5CF0`** | **`#00D4FF`** |

Three different background colors are applied to the same page. `globals.css:58` sets
`background-color: #050813` on `html, body`; `layout.tsx:70` then overrides the `<body>`
inline with `#0a0f0d`; the hero renders avatar borders against `#0d0d1a`.

`globals.css` itself also contains **both** palettes — `.btn-primary` uses `#00FF85`
(line 204) while `@theme --color-brand-green` is `#31F06F` (line 14). The legacy
`.glass-card` uses `#13132b` (line 172), which appears in neither `@theme` block.

### 3.2 Token bypass — measured

```
Hardcoded hex in web .tsx     1,146 occurrences
Unique hex values               103
Tailwind arbitrary [#hex]       929 uses across 69 distinct classes
```

Top offenders by arbitrary-class frequency:

```
183 × [#31F06F]     55 × [#7C3DFF]     32 × [#050816]
132 × [#18D9FF]     34 × [#FFC442]     32 × [#8CF8E9]
123 × [#00E6C3]     30 × [#D7DEEF]     28 × [#050813]
```

Note `[#00E6C3]` at 123 uses — a teal that exists in **no** theme file. Note also
`[#050816]` (32×) vs `[#050813]` (28×): two backgrounds differing by 3 in the blue
channel, both in active use. That is a copy-paste artifact, not a decision.

Worst files: `src/app/admin/page.tsx` (58 hex), `landing/HeroV3Offers.tsx` (34),
`landing/HeroV2Gaming.tsx` (34), `landing/HeroV1Balanced.tsx` (34) — the last three
being dead code that still carries maintenance weight.

### 3.3 Admin is a different product

**384 light-theme utility hits** (`bg-white`, `bg-gray-50/100/200`, `text-gray-700/800/900`)
inside a dark app. Concentration:

```
46  src/app/admin/fraud/page.tsx
38  src/app/admin/users/page.tsx
34  src/app/admin/offers/page.tsx
27  src/app/admin/page.tsx
27  src/app/admin/transactions/page.tsx
16  src/app/admin/dashboard/page.tsx
```

Admin renders white cards with grey text on a dark shell. It reads as a different
application bolted on. Meanwhile four `*Premium` admin components — the dark-themed
replacements someone already built — sit unimported.

### 3.4 Typography — loaded but unused

`layout.tsx:12-32` loads three Google fonts with `preload: true`:
Space Grotesk (display), Manrope (body), JetBrains Mono (numerals).

Actual usage across 130 files:

```
font-display    14 uses
font-mono       11 uses
font-sans        3 uses
```

Three typefaces are downloaded on every page load to be used 28 times total. A fintech
product's core asset is its numerals — balances, payouts, countdowns — and the mono face
is applied 11 times. Most currency is rendered in the body font.

There is no type scale in use. `theme.ts:76-86` defines one (`xs`→`hero`, 12px→86px) that
components ignore in favour of arbitrary values like `text-[32px]`, `text-[13px]`,
`text-[11px]`, `text-[10px]`.

---
## 4. ACCESSIBILITY AUDIT

### 4.1 Web — measured ARIA coverage

Against **100 `<button>`, 35 `<input>`, 34 `<label>`, 116 `onClick` handlers**:

| Attribute | Count | Verdict |
|-----------|-------|---------|
| `aria-label` | 5 | ✗ |
| `aria-labelledby` | 0 | ✗ |
| `aria-describedby` | 0 | ✗ |
| `role=` | 0 | ✗ |
| `aria-live` | 0 | ✗ **critical** |
| `aria-modal` | 0 | ✗ **critical** |
| `aria-expanded` | 0 | ✗ |
| `aria-current` | 0 | ✗ |
| `tabIndex` | 0 | ✗ |
| `sr-only` | 0 | ✗ |
| `htmlFor` | **1** (for 34 labels) | ✗ **critical** |
| `onKeyDown` | 1 | ✗ |
| `aria-hidden` | 6 | partial |
| `focus-visible` | 16 | partial |

**`htmlFor` = 1 against 34 labels and 35 inputs.** Follow-up file-level review (§6A.7)
found that signin and signup use **wrapping `<label>` elements**, which is a valid
accessible association — those two forms are fine despite the low `htmlFor` count.

The real gap is `cashout/page.tsx:407,432,459`, where the amount and destination inputs
have **no `<label>` at all** — only `<p>` captions and placeholders. The money-movement
form is unlabeled for screen readers. `referrals/page.tsx:166` has the same defect. No
`autoComplete` attribute appears on any auth or cashout field.

**`aria-live` = 0.** Balance updates, payout status changes, form errors and toast
notifications (17 toast references) are all announced to nobody.

**`aria-modal` = 0** across `InstructionModal`, `CompletionReceiptModal`,
`OnboardingModal`, and the admin `AlertModal`. No focus trap, no scroll lock, no ESC
handling found (`onKeyDown` = 1 in the entire codebase).

Mitigating: `useReducedMotion` is used 21 times and `globals.css:663-669` has a global
`prefers-reduced-motion` block. Motion accessibility is the one area handled well.

### 4.2 Mobile — zero accessibility

| Prop | Count |
|------|-------|
| `accessibilityLabel` | **0** |
| `accessibilityRole` | **0** |
| `accessibilityHint` | **0** |
| `accessibilityState` | **0** |
| `accessible=` | **0** |
| `hitSlop` | **0** |

Against 35 `TouchableOpacity`, 33 `Pressable`, 25 `onPress`. The mobile app is
**completely opaque to VoiceOver and TalkBack**. Icon-only controls — the notification
bell at `mobile/app/(tabs)/index.tsx:85-87` is a bare `Ionicons` in a `TouchableOpacity`
— announce as nothing at all.

Also absent: `allowFontScaling` handling (0), `AccessibilityInfo` / reduce-motion (0),
`Platform.OS`/`Platform.select` (0 — no iOS/Android divergence anywhere).

### 4.3 WCAG 2.2 contrast — computed ratios

| Pair | Ratio | AA normal | AA large |
|------|-------|-----------|----------|
| `#9AA8C6` muted on `#050813` | 8.37:1 | PASS | PASS |
| `#31F06F` green on `#050813` | 13.16:1 | PASS | PASS |
| `#18D9FF` cyan on `#050813` | 11.81:1 | PASS | PASS |
| `#FFC442` gold on `#050813` | 12.59:1 | PASS | PASS |
| black on `#31F06F` button | 13.82:1 | PASS | PASS |
| **white on `#31F06F` button** | **1.52:1** | **FAIL** | **FAIL** |
| **`#7C3DFF` purple on `#050813`** | **3.78:1** | **FAIL** | PASS |
| **white on `#FF2F42`** | **3.66:1** | **FAIL** | PASS |
| **`text-dim` rgba(255,255,255,0.3)** | **2.94:1** | **FAIL** | **FAIL** |
| **mobile `dim` rgba(255,255,255,0.25)** | **1.74:1** | **FAIL** | **FAIL** |
| **mobile inactive tab rgba(255,255,255,0.3)** | **2.20:1** | **FAIL** | **FAIL** |

Six failures. Three matter most:

1. **`--color-text-dim` at 2.94:1** (`globals.css:21`) — a token that cannot legally
   carry text. Any copy using it is non-compliant by construction.
2. **Mobile inactive tab label at 2.20:1** (`(tabs)/_layout.tsx:26`) — the primary
   navigation of the app fails contrast in its default state.
3. **Purple `#7C3DFF` at 3.78:1** — used for `Start Offer` CTA text and links. Fine as a
   large-text/UI-component colour, fails for body copy. `OfferCard.tsx:109` uses it as a
   button *background* with white text, which passes at 5.29:1 — so the fix is to forbid
   purple-on-dark for text while keeping it for fills.

---
## 5. PERFORMANCE & ASSET AUDIT

### 5.1 Payload weight

```
public/            84.46 MB   71 files
  └ PNG            84.12 MB   34 files
  └ SVG             0.03 MB   21 files
WebP / AVIF             0     ← none
mobile/assets      0.00 MB    11 files, all 1×1 placeholders
```

Largest offenders, all served as raw PNG:

| File | Size | Dimensions |
|------|------|-----------|
| `hero/hero-offers-focus-v2.png` | 4.79 MB | 2560×1440 |
| `offers/warzone-card.png` | 4.76 MB | 1920×1920 |
| `hero/hero-gaming-focus-v2.png` | 4.74 MB | 2560×1440 |
| `offers/monopoly-go-card.png` | 4.39 MB | 1920×1920 |
| `hero/hero-character-modern.png` | 4.19 MB | 1440×2560 |
| `hero/phone-dashboard-3d.png` | 4.03 MB | 1920×1920 |
| `offers/bingo-blitz-card.png` | 3.85 MB | 1920×1920 |
| `misc/ab-test.png` | 3.74 MB | 2560×1440 |

A 1920×1920 PNG is being rendered into an 80×80 box at `OfferCard.tsx:56-61`. That is a
**576× overdraw in pixel area** for a single card thumbnail.

`public/icon.png` is 1.05 MB at 1024×1024, and `manifest.json` declares only *one* icon
(`/icon.jpg`, 301 KB) for every size including the 96×96 shortcut icons. There is no
192×192 or 512×512 maskable PWA icon.

### 5.2 Duplicate shipping — 20.22 MB wasted

Thirteen byte-identical pairs are deployed twice. The `images/assets/ChatGPTImage*.png`
folder is a verbatim copy of `images/offers/` plus `hero/character.png`:

```
2.81 MB  offers/offer-1.png   ==  assets/ChatGPTImageJun14,2026,05_11_56PM.png
2.36 MB  offers/offer-4.png   ==  assets/ChatGPTImageJun14,2026,05_12_19PM.png
2.28 MB  offers/offer-2.png   ==  assets/ChatGPTImageJun14,2026,05_11_59PM.png
2.25 MB  offers/offer-3.png   ==  assets/ChatGPTImageJun14,2026,05_12_08PM.png
1.92 MB  offers/offer-7.png   ==  assets/ChatGPTImageJun14,2026,05_12_34PM(8).png
1.60 MB  hero/character.png   ==  assets/ChatGPTImageJun14,2026,05_12_45PM.png
1.58 MB  offers/offer-5.png   ==  assets/ChatGPTImageJun14,2026,05_12_34PM(4).png
1.51 MB  offers/offer-10.png  ==  assets/ChatGPTImageJun14,2026,05_12_33PM(2).png
1.34 MB  offers/offer-9.png   ==  assets/ChatGPTImageJun14,2026,05_12_34PM(10).png
1.33 MB  offers/offer-6.png   ==  assets/ChatGPTImageJun14,2026,05_12_34PM(9)…
1.23 MB  offers/offer-8.png   ==  assets/ChatGPTImageJun14,2026,05_12_34PM(9).png
   +2 SVG logo pairs (tapcash-icon, tapcash-logo-horizontal — root and /logos)
```

The raw generator filenames (`ChatGPTImageJun14,2026,05_12_34PM(10).png`) also contain
commas and parentheses — characters that require URL-encoding and break naïve CDN paths.

**Deleting `public/images/assets/` alone recovers ~20 MB with zero visual change.**

### 5.3 Projected savings

| Action | Saving |
|--------|--------|
| Delete duplicate `images/assets/` | −20.2 MB |
| Convert remaining PNG → AVIF/WebP @ q80 | −55 to −60 MB |
| Resize offer art 1920² → 320² (served at 80px @2x) | −8 MB |
| Resize hero art 2560×1440 → 1600×900 + `sizes` attr | −6 MB |
| **Total** | **84 MB → ~3–5 MB (≈95% reduction)** |

### 5.4 Rendering & responsive

Breakpoint usage across 130 files: `sm:` 165, `md:` 92, `lg:` 210, `xl:` 2, `2xl:` 0.
The `lg:`-heavy, `xl:`-absent distribution means the layout is designed for one desktop
width and one mobile width, with nothing above 1280px — despite `.model-u-page` setting
`max-width: 1800px` (`globals.css:299`).

**Fourteen substantial files have zero responsive prefixes**, including:

```
10 KB  src/app/cashout/status/page.tsx     ← money screen, desktop-only layout
 9 KB  src/components/cashout/CashoutFormPremium.tsx
 7 KB  src/components/dashboard/TransactionHistoryPremium.tsx
 5 KB  src/components/OfferCard.tsx
 4 KB  src/components/BalanceCard.tsx
```

`src/app/cashout/status/page.tsx` is the payout-tracking screen — the page users open on
their phone to check if they got paid — and it carries no mobile layout rules at all.

Eleven `<table>` elements exist with no responsive card-collapse pattern; admin tables
rely on `overflow-x-auto` (`fraud/page.tsx:438`), producing horizontal scroll on mobile.

There are no skeleton components (`skeleton` class defined at `globals.css:242` but
**0 usages** in TSX). Loading states are plain text — `mobile/app/(tabs)/index.tsx:178`
renders the string `"Loading offers..."`.

---
## 6. MOBILE-SPECIFIC FINDINGS

### 6.1 Native patterns not used

| Capability | Installed | Used |
|-----------|-----------|------|
| `react-native-reanimated` 4.3.1 | ✅ | **0 imports** — animation done with legacy `Animated` |
| `FlatList` / `FlashList` | (RN core) | **0** — all lists are `ScrollView` |
| `KeyboardAvoidingView` | (RN core) | **0** |
| `Platform.OS` / `Platform.select` | (RN core) | **0** |
| `react-native-svg` 15.15.4 | ✅ | not used for the TapScore ring |
| `expo-haptics` | ✅ | **37 uses** — the one well-adopted native affordance |

`react-native-reanimated` is a heavyweight dependency carried in the bundle and never
imported. Every offer list renders through `ScrollView`, which mounts all children at
once — fine for 3 items, degrades as the offerwall grows.

`KeyboardAvoidingView` = 0 means the keyboard covers the input on the signin, signup and
cashout-amount screens on smaller devices.

### 6.2 The 1×1 asset problem

All 11 files in `mobile/assets/` are the same 69-byte 1×1 PNG:

```
mobile/assets/icon.png            69 B   1×1   ← app icon
mobile/assets/offers/offer-1.png  69 B   1×1
… offer-2 … offer-10             69 B   1×1
```

`app.json:10` and `app.config.js:11` both point the notification icon at
`./assets/icon.png`. **This is a hard store-submission blocker** — Apple requires a
1024×1024 icon, Google Play requires 512×512. There is also no splash screen asset
despite `expo-splash-screen` being a dependency, and no adaptive-icon foreground/background
pair for Android.

### 6.3 Hardcoded and fabricated content

`mobile/app/(tabs)/index.tsx` ships placeholder data as if it were live:

- **L14-15:** `const CASHPATH = [...]; const ACTIVE = 2;` — the progress tracker is
  hardcoded to step 2 for every user regardless of actual state.
- **L127-129:** renders `"Real-time payouts loading"` / `$0.00` / `"via Network · Just now"`
  as a permanent fake row inside a card labelled **"LIVE PAYOUT"**.
- **L189-193:** stats `50K+` users, `$2.5M+` paid, `98%` verified — hardcoded strings.
- **L89:** avatar always renders the literal letter `"U"`, never the user's initial.

Web equivalents: `HeroSection.tsx:33` claims `2,847+ users cashed out in last 24h` and
`L45` animates a counter to a hardcoded `2547382`. `Navbar.tsx:52` claims
`2.3K+ cashed out today`. These are three different fabricated social-proof numbers on
one page load.

For a financial product these are a **compliance and trust liability**, not just a design
issue. They should be wired to `/api/stats/platform` (which exists) or removed.

### 6.4 Currency bug (B4) in detail — CORRECTED

The canonical conversion rate is **1000 coins = $1 CAD**, established by the shared
helper and confirmed across 18 call sites including the payout API:

```ts
// shared/tapcash-content.ts:304  ← SOURCE OF TRUTH
return `$${(value / 1000).toLocaleString("en-CA", {...})} CAD`;

// src/app/api/payout/route.ts:20
return coins / 1000;
```

Agreeing with /1000: `cashout/page.tsx:173`, `cashout/status/page.tsx:136`,
`lib/email.ts:85,117`, `api/activity/route.ts:77`, `api/admin/promo-analytics/route.ts:42`,
`api/payouts/request/route.ts:83,134`, `mobile/(tabs)/index.tsx:76`,
`mobile/(tabs)/cashout.tsx:111,138`, `mobile/(tabs)/activity.tsx:57`,
`mobile/(tabs)/account.tsx:226,231`.

**The outliers are the two `OfferCard` components — both use /100:**

```ts
// src/components/OfferCard.tsx:34        ← WRONG, 10× too high
const cadValue = (offer.payout / 100).toFixed(2);

// mobile/src/components/OfferCard.tsx:12  ← WRONG, 10× too high
const price = (offer.payoutCoins / 100).toFixed(2);
```

**Impact:** every offer in the catalogue — web and mobile — advertises a payout **10×
larger than the user will actually receive**. A 500-coin offer displays as `$5.00` but
credits `$0.50`. This is the most severe finding in the audit: it is a
consumer-protection and chargeback exposure, not a formatting nit.

`mobile/(tabs)/offer/[id].tsx:227` should be checked against the same rate during the fix.

**Additional money defects found on the web side:**

- `src/app/admin/page.tsx:489` — column header reads **"Amount (CAD)"** while the cell at
  `:504` renders `w.amountCoins` as `"… Coins"`. Admins approving withdrawals are reading
  a mislabelled column.
- `src/app/cashout/status/page.tsx:136` — `(p.amountCents / 100).toFixed(2) || (p.amountCoins / 1000).toFixed(2)`.
  When `amountCents` is `0`, `"0.00"` is truthy, so the coin fallback never fires and a
  real payout can display as `$0.00`.
- `admin/users`, `admin/transactions`, `admin/offers`, `admin/dashboard` print `$` from
  raw API values (`u.balance.toFixed(2)` etc.) with no divisor. If those endpoints return
  coins rather than dollars, admin shows values **1000× too large**. Not verifiable from
  the frontend — must be confirmed against the API response shape.

`mobile/app/(tabs)/index.tsx:78` uses the correct /1000 rate in its withdrawal-progress
bar (`minW = 20`, `prog = (balanceCoins / (minW * 1000)) * 100`) — consistent with canon.

---

## 6A. WEB AUTHENTICATED & ADMIN FINDINGS

Verified independently against the source. All line references confirmed.

### 6A.1 Admin is split across THREE visual styles

| Surface | Theme | Evidence |
|---------|-------|----------|
| Admin shell (sidebar) | dark `#050816` | `admin/layout.tsx:64` |
| Command Center, multiplier, promo-analytics | dark, coherent | — |
| **users, transactions, offers, fraud, dashboard** | **light** `from-purple-50 to-blue-50` | `users:136,212`, `transactions:213`, `offers:174`, `fraud:193`, `dashboard:104` |
| `error.tsx` / `loading.tsx` / `not-found.tsx` | **third palette** `#0a0a0a` + `#ff2e63` | `error.tsx:18,28`, `loading.tsx:3`, `not-found.tsx:7` |

Five of eight admin pages render a **full-bleed light page nested inside the dark
sidebar shell**. The system-state pages use a fourth background (`#0a0a0a`) that matches
neither the consumer theme (`#050813`) nor the admin shell (`#050816`).

### 6A.2 The fraud page JSX error, root-caused

`admin/fraud/page.tsx:280` opens a fragment wrapping two `<div>`s:
```tsx
{fraudTab === 'alerts' ? (
<><div className="bg-white rounded-lg shadow-lg p-6 mb-6">
```
By line 428 there is one **stray extra `</div>`** before the fragment closes at `:429`
(`</>) : fraudTab === 'blocked_ips' ? (`). Removing that surplus `</div>` fixes all four
TS errors. One-line fix.

### 6A.3 Dead controls — Retry buttons do nothing

```tsx
// src/app/cashout/page.tsx:507
onClick={() => handleSubmit}          // ← missing (), returns the fn, never calls it

// src/app/cashout/page.tsx:516
onClick={() => { setSubmitError(null); handleSubmit; }}   // ← same, no-op statement
```

Both Retry buttons on the **cashout error path** are inert. A user whose payout request
fails clicks Retry and nothing happens — on the highest-stakes screen in the product.

### 6A.4 Modals — none are accessible

Eight modals audited: `admin/page.tsx:681,737`, `UserModal :312`,
`TransactionModal :420`, `OfferModal :407`, `AlertModal :496`, plus consumer modals.
**Every one is missing** `role="dialog"`, `aria-modal`, focus trap, ESC-to-close,
click-outside-to-close, and body scroll lock. Only an explicit Cancel button closes them
(`:713,758`).

### 6A.5 Destructive admin actions use native browser dialogs

`window.prompt` for withdrawal-rejection reason (`admin/page.tsx:181`); `confirm()` for
approve/reject/refund (`transactions:76,134`), offer delete (`offers:120`), unflag/unblock
(`fraud:115,120,139`); `alert()` for results (`users:90,113`, `transactions:96,124,154`).
No in-app confirmation, no undo, unstyled, and blocked by some browsers.

### 6A.6 Swallowed errors

`cashout/page.tsx:151`, `referrals/page.tsx:49`, `leaderboard/page.tsx:34`, and
`transactions/page.tsx:41` catch fetch/snapshot failures into `console.error` with **no
user-facing error state**. The user sees an empty list and assumes they have no data,
rather than learning the request failed.

### 6A.7 Auth form details

Correction to §4.1: signin and signup use **wrapping `<label>` elements**
(`signin:141-154`, `signup:145-188`), which is a valid accessible association without
`htmlFor`. Those two forms are compliant.

**`cashout/page.tsx` is not** — its inputs have no `<label>` at all, only `<p>` captions
and placeholders (`:407,432,459`). The amount and destination fields on the money-movement
form are unlabeled for screen readers. `referrals/page.tsx:166` has the same issue.

No `autoComplete` attributes anywhere in the auth or cashout forms (`signin:145,160`,
`signup:149,164,179`) — password managers cannot prefill.

### 6A.8 Security observation (flagged, not UI)

`src/app/cashout/status/page.tsx:57` sends `Authorization: Bearer ${user.uid}` — a raw
Firebase UID used as a bearer token. A UID is a public identifier, not a secret. If
`/api/ledger/summary` trusts it, any user knowing another's UID can read their ledger.
**Outside UI/UX scope — routing to Shayan for a security review.**

### 6A.9 What the web app does well

- `rapidoreach/page.tsx` has the **best state coverage in the repo**: loading, no-user,
  unverified, error-with-cause, iframe, and fallback (`:119,127,140,153,164,171`).
- `dashboard/page.tsx` combines `Promise.allSettled`, `cancelled`-flag cleanup, a live
  Firestore `onSnapshot` with correct unsubscribe, and polling (`:57,103,117,127,164`).
- Auth gating is consistently `authLoading`-guarded, so no flash of wrong content.
- `admin/multiplier` and `admin/promo-analytics` are dark, coherent, and have full
  loading/empty/error coverage — the model for the admin retheme.

---

## 7. WHAT'S ALREADY GOOD

Not everything needs replacing. Preserve these:

- **Motion discipline.** `useReducedMotion` used 21×, plus a global
  `prefers-reduced-motion` reset (`globals.css:663`). Better than most production apps.
- **Haptics.** 37 uses in mobile — well-adopted and correctly scoped to confirmations.
- **The `@theme` token block itself** (`globals.css:3-55`) is well-structured. The problem
  is adoption, not design. It is a valid foundation to build the redesign on.
- **`ErrorBoundary` + `NetworkBanner`** in mobile — real resilience components.
- **Route/IA structure.** 42 routes are logically grouped; the information architecture
  is sound. This audit recommends no route changes.
- **`focus-visible` rings** exist on the primary Model U buttons (`globals.css:656-661`)
  and in `Navbar.tsx` — the pattern is established, just not applied broadly.
- **Semantic `<table>` markup** in admin (11 tables) — correct element choice, just needs
  responsive treatment.

---
## 8. PRIORITIZED REMEDIATION PLAN

### Phase 0 — Unblock (½ day, do first)

| # | Task | Effort |
|---|------|--------|
| 0.1 | Fix JSX fragment error `admin/fraud/page.tsx:428` — remove the one stray `</div>`; get `tsc --noEmit` green | 15 m |
| 0.2 | Repair ESLint (pin `eslint-plugin-react` / downgrade ESLint 10 → 9) | 1 h |
| 0.3 | **Fix `OfferCard` /100 → /1000 (web + mobile)** — offers currently advertise 10× the real payout; add a unit test | 1 h |
| 0.4 | `git rm -r public/images/assets/` → −20.2 MB, zero visual change | 15 m |
| 0.5 | Fix the two no-op Retry buttons at `cashout/page.tsx:507,516` (missing `()`) | 10 m |
| 0.6 | Fix `admin/page.tsx:489` "Amount (CAD)" header that displays coins | 10 m |

### Phase 1 — Foundation (3–4 days)

| # | Task |
|---|------|
| 1.1 | Pick ONE palette. Recommendation: keep Model U (`#050813`/`#31F06F`/`#7C3DFF`/`#18D9FF`) — higher contrast, already tokenized |
| 1.2 | Delete the legacy palette from `globals.css` (`.btn-primary`, `.glass-card`, `.text-gradient-*` legacy hexes) |
| 1.3 | Remove the inline `backgroundColor: '#0a0f0d'` at `layout.tsx:70` |
| 1.4 | Port the chosen palette into `mobile/src/theme.ts` so web and mobile match |
| 1.5 | Fix the 6 contrast failures — raise `text-dim` to ≥4.5:1, raise mobile inactive tab to ≥3:1, forbid purple-on-dark text |
| 1.6 | Delete the 32 orphaned components and 6 dead Hero variants |
| 1.7 | Codemod the 929 `[#hex]` arbitrary classes → semantic token classes |
| 1.8 | Add a CI gate that fails on any new raw hex in `src/**/*.tsx` |

### Phase 2 — Accessibility (3–4 days)

| # | Task |
|---|------|
| 2.1 | Add `htmlFor`/`id` to all 34 label/input pairs |
| 2.2 | Add `aria-live="polite"` to balance, payout status, and toasts |
| 2.3 | Build one accessible `<Modal>` primitive (focus trap, ESC, scroll lock, `aria-modal`) and migrate all 4 modals |
| 2.4 | Add `aria-label` to all icon-only buttons (web + mobile) |
| 2.5 | Add `accessibilityLabel` / `accessibilityRole` / `accessibilityHint` across all 68 mobile touchables |
| 2.6 | Add `hitSlop` to every mobile touch target under 44×44 pt |
| 2.7 | Add `aria-current="page"` to nav, `aria-expanded` to the mobile hamburger |

### Phase 3 — Asset pipeline (2 days)

| # | Task |
|---|------|
| 3.1 | Generate real mobile assets: 1024² icon, 512² adaptive, splash, notification icon |
| 3.2 | Convert all PNG → AVIF + WebP with PNG fallback |
| 3.3 | Resize offer art to 320²; hero art to 1600×900; add `sizes` to every `next/image` |
| 3.4 | Add 192²/512² maskable PWA icons; fix `manifest.json` to declare all sizes |
| 3.5 | Rename generator-named files to semantic slugs (no commas/parens) |
| 3.6 | Ship the real JetBrains Mono font to mobile + add `useFonts()`, or remove the 4 references |

### Phase 4 — Component system (5–7 days)

| # | Task |
|---|------|
| 4.1 | Build the primitive set: Button, Input, Card, Badge, Modal, Table, Skeleton, EmptyState, Toast |
| 4.2 | Retheme admin dark using the 4 existing `*Premium` components; remove 384 light-theme hits |
| 4.3 | Add skeleton loaders (the `.skeleton` CSS already exists, 0 usages) |
| 4.4 | Add responsive rules to the 14 zero-breakpoint files, starting with `cashout/status` |
| 4.5 | Convert admin tables to card-collapse below `md:` |
| 4.6 | Mobile: `ScrollView` → `FlatList`; adopt reanimated or drop the dependency |
| 4.7 | Mobile: add `KeyboardAvoidingView` to all form screens |
| 4.8 | Replace all fabricated stats with live `/api/stats/platform` data or delete them |
| 4.9 | Apply the mono face to every currency/numeral in the product |

---

## 9. SEVERITY SUMMARY

| Severity | Count | Items |
|----------|-------|-------|
| **CRITICAL** | 4 | **Offers advertise 10× real payout (`OfferCard` /100)** · Typecheck broken · Mobile assets are 1×1 · ESLint broken |
| **HIGH** | 13 | 4-way palette fork · 0 mobile a11y · cashout form unlabeled · `aria-live`=0 · 8 modals with no focus trap/ESC/`aria-modal` · 84 MB payload · 20 MB duplicates · missing font · fabricated financial stats · 2 no-op Retry buttons on cashout · admin "Amount (CAD)" shows coins · swallowed errors on 4 pages · native `alert`/`confirm`/`prompt` for destructive admin actions |
| **MEDIUM** | 9 | 6 contrast failures · 32 orphan components · 7 Hero variants · admin split across 3 themes (384 light hits) · 14 non-responsive files · 0 skeletons · no `FlatList` · no `KeyboardAvoidingView` · no `autoComplete` on any auth/cashout field |
| **LOW** | 5 | 3 fonts for 28 uses · no `xl:`/`2xl:` breakpoints · generator filenames · reanimated unused · no `Platform` divergence |

**Total: 31 distinct findings.**

### Referred out of UI/UX scope

- **`cashout/status/page.tsx:57`** sends `Authorization: Bearer ${user.uid}` — a public
  Firebase UID used as a bearer credential. Potential IDOR on `/api/ledger/summary`.
  Needs a security review, not a design fix.
- **Admin dollar rendering** (`users`, `transactions`, `offers`, `dashboard`) prints `$`
  from raw API values with no divisor. Confirm whether those endpoints return dollars or
  coins; if coins, admin is showing values 1000× too large.

---

## 10. COMPANION DOCUMENTS

- **`ASSETS_REQUIRED.md`** — complete asset manifest for the redesign: every image, icon,
  video, font and illustration needed for web + mobile, with exact dimensions, formats,
  and current-state status.
- **`REDESIGN_SPEC.md`** — target design direction, token architecture, component
  inventory, and the cross-platform system both apps should share.

---

*Audit performed by static analysis and tool execution against the working tree at
`agent/hermes-governance-bootstrap`. No files were modified. All counts are reproducible.*
