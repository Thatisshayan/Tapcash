# TapCash — Master Plan & Task List

**Generated:** 2026-06-22
**Status:** Awaiting user input before starting work

---

## How to Use This Document

- ✅ = Done
- 🔲 = Pending
- 🟡 = Blocked / needs user input
- ❌ = Cancelled / deprecated
- Each task is numbered for reference in PRs and commit messages.

---

## TABLE OF CONTENTS

1. [Phase 0 — Foundation & Credential Audit](#phase-0--foundation--credential-audit)
2. [Phase 1 — Design System Unification (Space Grotesk + Manrope)](#phase-1--design-system-unification)
3. [Phase 2 — Missing Pages & Navigation Consolidation](#phase-2--missing-pages--navigation-consolidation)
4. [Phase 3 — Authentication & Route Protection](#phase-3--authentication--route-protection)
5. [Phase 4 — Content & Data Migration (Kill Fake Data)](#phase-4--content--data-migration)
6. [Phase 5 — RapidoReach Offerwall Integration](#phase-5--rapidoreach-offerwall-integration)
7. [Phase 6 — Payout System (PayPal → Interac → Tremendous)](#phase-6--payout-system)
8. [Phase 7 — Admin Panel Completion](#phase-7--admin-panel-completion)
9. [Phase 8 — Image & Asset Optimization](#phase-8--image--asset-optimization)
10. [Phase 9 — Testing & CI/CD](#phase-9--testing--cicd)
11. [Phase 10 — Documentation Refresh](#phase-10--documentation-refresh)
12. [Phase 11 — Final Polish & Launch Readiness](#phase-11--final-polish--launch-readiness)
13. [Appendix A — Everything I Need From You](#appendix-a--everything-i-need-from-you)
14. [Appendix B — Credential Audit](#appendix-b--credential-audit)

---

## Phase 0 — Foundation & Credential Audit

> **Goal:** Make sure the repo is clean, credentials are valid, and the foundation is solid before touching any code.

### 0.1 — Repo Cleanup
- [ ] 0.1.1 Delete stale `D:\AgentDevWork\Tapcash` (other copy; keep `D:\AgentDevWork\repos\tapcash`)
- [ ] 0.1.2 Remove stale `server/` directory (tRPC/Drizzle files not used by the Next.js app)
- [ ] 0.1.3 Remove or fix `server/routers/__tests__/integration.test.ts` (imports Vitest/MSW but project uses Jest)
- [ ] 0.1.4 Remove `typescript.ignoreBuildErrors: true` from `next.config.ts` (only after type-check passes)
- [ ] 0.1.5 Remove `mobile/` from repo OR move its Firebase config to env vars (currently hardcoded)
- [ ] 0.1.6 Audit `.gitignore` — ensure `mobile/node_modules`, mobile env files, `.env.local` are all ignored

### 0.2 — Credential Verification
- [ ] **0.2.1 🟡 Verify Firebase Identity Toolkit API is enabled** for project `tapcash-16238` (project `538090776118`) — this blocks signup
- [ ] **0.2.2 🟡 Verify Firebase Admin credentials work** — `.env.local` has client email + private key, but firebaseAdmin.ts may still fall back if key parsing fails
- [ ] **0.2.3 🟡 Verify GitHub Secrets match `.env.local`** — run `gh secret list` to check all 17+ secrets are set
- [ ] **0.2.4 🟡 Verify Vercel env vars match** — both tapcash.online and tapcash.click deployments
- [ ] **0.2.5 🟡 Confirm RapidoReach credentials** — you need to provide: `RAPIDOREACH_APP_ID`, `RAPIDOREACH_APP_KEY`, `RAPIDOREACH_APP_SECRET`, `RAPIDOREACH_TRANSACTION_KEY`
- [ ] **0.2.6 🟡 Confirm Upstash Redis credentials** — `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` for production rate limiting
- [ ] 0.2.7 Set all remaining `.env.local` vars that are still empty (see Appendix B)

### 0.3 — Rate Limiter Upgrade
- [ ] 0.3.1 Install `@upstash/ratelimit` + `@upstash/redis`
- [ ] 0.3.2 Rewrite `src/middleware/index.ts` to use Upstash Redis instead of in-memory `Map`
- [ ] 0.3.3 Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.example`
- [ ] 0.3.4 Test rate limiting headers work in dev + production

### 0.4 — Firebase Admin Proper Setup
- [ ] 0.4.1 Clean up `src/lib/firebaseAdmin.ts` — remove the "fallback" mode, require real credentials in production
- [ ] 0.4.2 Add startup validation — log an error at boot if Firebase Admin isn't configured
- [ ] 0.4.3 Verify `adminDb` and `adminAuth` exports work in API routes

---

## Phase 1 — Design System Unification

> **Goal:** Replace Syne → Space Grotesk, Inter → Manrope, remove premium.css/PremiumUi.tsx, create proper component library.

### 1.1 — Font Migration
- [ ] 1.1.1 Install Space Grotesk: `npm install @fontsource/space-grotesk` (or use next/font)
- [ ] 1.1.2 Install Manrope: `npm install @fontsource/manrope` (or use next/font)
- [ ] 1.1.3 Update `src/app/layout.tsx`:
  - Remove `Syne` → add `Space_Grotesk` as `--font-display`
  - Remove `Inter` → add `Manrope` as `--font-sans`
  - Remove `JetBrains_Mono` (or keep if used somewhere)
- [ ] 1.1.4 Update `src/app/globals.css`:
  - `--font-sans: var(--font-manrope), "Manrope", sans-serif`
  - `--font-display: var(--font-space-grotesk), "Space Grotesk", sans-serif`
  - Remove Syne/Inter/JetBrains fallbacks from `:root`
- [ ] 1.1.5 Update `body` font-family to use Manrope
- [ ] 1.1.6 Scan all components for hardcoded font references (`var(--font-syne)`, `var(--font-inter)`, `var(--font-jetbrains-mono)`) and replace
- [ ] 1.1.7 Update layout.tsx `className` to use new font variables

### 1.2 — Style Consolidation
- [ ] 1.2.1 Migrate needed styles from `src/styles/premium.css` into `globals.css`:
  - `.model-u-gradient-*` → Tailwind utilities
  - `.model-u-card*` → new `.glass-card` variants
  - `.model-u-btn*` → Tailwind component classes
  - `.model-u-micro`, `.model-u-badge`, `.model-u-hot-badge` → Tailwind
  - `.model-u-progress-bar*`, `.model-u-score-ring`, `.model-u-phone` → components
  - `.model-u-halo` → keep as utility
  - Animations → consolidate with existing ones
  - Typography utilities (`.text-display-lg`, etc.) → keep or use Tailwind
  - Responsive breakpoints → use Tailwind
  - Accessibility → merge into globals.css
- [ ] 1.2.2 Delete `src/styles/premium.css` after migration
- [ ] 1.2.3 Remove `import '../styles/premium.css'` from `layout.tsx`
- [ ] 1.2.4 Delete `src/styles/premium.ts` if exists (theme.ts may still be useful)

### 1.3 — Component Library
- [ ] 1.3.1 Audit `src/components/PremiumUi.tsx` — extract any unique components into `src/components/ui/`
- [ ] 1.3.2 Delete `src/components/PremiumUi.tsx`
- [ ] 1.3.3 Create proper `src/components/ui/` library:
  - `Button.tsx` (variants: primary, secondary, ghost, gradient, danger)
  - `Card.tsx` (variants: default, elevated, glass, interactive)
  - `Badge.tsx` (variants: default, hot, green, purple)
  - `ProgressBar.tsx`
  - `Input.tsx`
  - `Avatar.tsx` / `AvatarGroup.tsx`
  - `Modal.tsx`
- [ ] 1.3.4 Add barrel export `src/components/ui/index.ts`

### 1.4 — Navigation Unification
- [ ] 1.4.1 Merge `PremiumHeader.tsx` functionality into `Navbar.tsx`:
  - Avatar group + social proof (from PremiumHeader)
  - Auth buttons (both)
  - Mobile menu (both)
  - Scroll effects (from Navbar)
  - Framer Motion (both)
- [ ] 1.4.2 Update all pages to use the unified `Navbar`
- [ ] 1.4.3 Delete `PremiumHeader.tsx`
- [ ] 1.4.4 Merge `PremiumFooter.tsx` into `Footer.tsx`
- [ ] 1.4.5 Delete `PremiumFooter.tsx`

### 1.5 — Color System Finalization
- [ ] 1.5.1 Audit globals.css colors — remove duplicates, consolidate
- [ ] 1.5.2 Add any missing brand colors from premium.css
- [ ] 1.5.3 Create semantic color tokens (`--color-success`, `--color-warning`, `--color-error`, `--color-info`)
- [ ] 1.5.4 **🟡 Confirm color palette with you** (see Appendix A)

---

## Phase 2 — Missing Pages & Navigation Consolidation

> **Goal:** Every link in the header and footer must lead to a real, functional page.

### 2.1 — Landing Page Section Pages
- [ ] 2.1.1 `/games` — Game discovery/showcase page with categories (Surveys, Games, Videos, Tasks)
- [ ] 2.1.2 `/how-it-works` — Steps/walkthrough page
- [ ] 2.1.3 `/rewards` — Rewards catalog / payout showcase
- [ ] 2.1.4 `/leaderboard` — Top earners leaderboard (wired to real data)
- [ ] 2.1.5 `/cashPath` — Already exists, verify it's functional

### 2.2 — Company Pages
- [ ] 2.2.1 `/about` — About TapCash
- [ ] 2.2.2 `/careers` — Careers / join the team
- [ ] 2.2.3 `/blog` — Blog listing page
- [ ] 2.2.4 `/contact` — Contact form / support page

### 2.3 — Support Pages
- [ ] 2.3.1 `/help` — Help center / knowledge base
- [ ] 2.3.2 `/faq` — FAQ page
- [ ] 2.3.3 `/privacy` — Privacy policy (verify exists)
- [ ] 2.3.4 `/terms` — Terms of service (verify exists)
- [ ] 2.3.5 `/cookies` — Cookie policy (verify exists)

### 2.4 — Navigation Wire-Up
- [ ] 2.4.1 Update `NAV_ITEMS` in Navbar.tsx with correct paths (remove placeholder links)
- [ ] 2.4.2 Update footer links in Footer.tsx
- [ ] 2.4.3 Add proper metadata (title, description, open graph) to every page
- [ ] 2.4.4 Fix `href="/auth/login"` → `href="/auth/signin"` in Navbar.tsx (broken link)

---

## Phase 3 — Authentication & Route Protection

> **Goal:** Working signup/signin flows, proper route protection, session management.

### 3.1 — Fix Signup
- [ ] **3.1.1 🟡 Enable Identity Toolkit API** — you must do this in GCP console
- [ ] 3.1.2 Test signup end-to-end after API is enabled
- [ ] 3.1.3 Add proper error messages for signup failures
- [ ] 3.1.4 Add rate limiting to signup route
- [ ] 3.1.5 Add email verification step after signup

### 3.2 — Fix Signin
- [ ] 3.2.1 Test signin end-to-end
- [ ] 3.2.2 Add proper error messages
- [ ] 3.2.3 Add "Forgot Password?" flow
- [ ] 3.2.4 Add Google sign-in option (GoogleSignInButton.tsx exists)

### 3.3 — Route Protection
- [ ] 3.3.1 Create proper `middleware.ts` at root level (Next.js requires this exact location)
- [ ] 3.3.2 Protect `/dashboard/*` — redirect unauthenticated to `/auth/signin`
- [ ] 3.3.3 Protect `/cashout/*` — redirect unauthenticated
- [ ] 3.3.4 Protect `/rapidoreach` — redirect unauthenticated
- [ ] 3.3.5 Protect `/transactions` — redirect unauthenticated
- [ ] 3.3.6 Protect `/referrals` — redirect unauthenticated
- [ ] 3.3.7 Protect `/payouts` — redirect unauthenticated
- [ ] 3.3.8 Protect `/admin/*` — redirect without `admin: true` claim
- [ ] 3.3.9 Delete old `src/proxy.ts` (was supposed to be middleware but wasn't)

### 3.4 — Session & Auth Context
- [ ] 3.4.1 Wire `/api/auth/session` properly
- [ ] 3.4.2 Add session persistence across page refreshes
- [ ] 3.4.3 Add token refresh logic
- [ ] 3.4.4 Update `AuthContext.tsx` to handle session expiry

---

## Phase 4 — Content & Data Migration

> **Goal:** Kill ALL fake hardcoded data. Wire everything to Firestore.

### 4.1 — Remove Fake Data
- [ ] 4.1.1 Audit `shared/tapcash-content.ts` — identify every mock object
- [ ] 4.1.2 Remove all fake offers
- [ ] 4.1.3 Remove all fake stats
- [ ] 4.1.4 Remove all fake leaderboard entries
- [ ] 4.1.5 Remove all fake testimonials
- [ ] 4.1.6 Remove all fake FAQ entries
- [ ] 4.1.7 Remove all fake steps (how it works)
- [ ] 4.1.8 Delete or gut `shared/tapcash-content.ts` (keep only types/interfaces)

### 4.2 — Firestore Data Wiring
- [ ] 4.2.1 Create Firestore collection for offers: `/offers` with fields (id, title, description, payout, category, image, provider, deepLink, active)
- [ ] 4.2.2 Create Firestore collection for leaderboard: `/leaderboard` with fields (userId, displayName, avatar, totalEarned, rank)
- [ ] 4.2.3 Create Firestore collection for testimonials: `/testimonials`
- [ ] 4.2.4 Create Firestore collection for site stats: `/siteStats`
- [ ] 4.2.5 Create Firestore collection for FAQ: `/faq`
- [ ] 4.2.6 Write seed script to populate initial Firestore data
- [ ] 4.2.7 Wire `OffersSection` and offer cards to Firestore
- [ ] 4.2.8 Wire leaderboard to Firestore
- [ ] 4.2.9 Wire testimonials section to Firestore
- [ ] 4.2.10 Wire stats section to Firestore
- [ ] 4.2.11 Wire FAQ page to Firestore

### 4.3 — Offer Categories
- [ ] 4.3.1 Add category filter: Surveys
- [ ] 4.3.2 Add category filter: Games
- [ ] 4.3.3 Add category filter: Videos
- [ ] 4.3.4 Add category filter: Tasks
- [ ] 4.3.5 **🟡 Provide offer images** for each category (see Appendix A)

---

## Phase 5 — RapidoReach Offerwall Integration

> **Goal:** Working offerwall with real offers, completion tracking, and ledger entries.

### 5.1 — Configuration
- [ ] **5.1.1 🟡 Get RapidoReach credentials** from you (APP_ID, APP_KEY, APP_SECRET, TRANSACTION_KEY)
- [ ] 5.1.2 Set credentials in `.env.local` + GitHub Secrets + Vercel env vars
- [ ] 5.1.3 Verify callback URL: `https://tapcash.online/api/postback/rapidoreach`

### 5.2 — API Routes
- [ ] 5.2.1 Verify `/api/rapidoreach/iframe-url` generates correct iframe URL
- [ ] 5.2.2 Wire `/api/offers` to pass `userId` from authenticated session
- [ ] 5.2.3 Test `/api/postback/rapidoreach` handles all event types (lead, conversion, payout)
- [ ] 5.2.4 Add ledger transaction write on successful postback
- [ ] 5.2.5 Add fraud check on postback events (IP validation, duplicate detection)

### 5.3 — UI
- [ ] 5.3.1 Verify RapidoReach iframe page renders correctly
- [ ] 5.3.2 Add loading/error states for iframe
- [ ] 5.3.3 Add offer completion confirmation UI
- [ ] 5.3.4 Add earnings notification on offer complete

---

## Phase 6 — Payout System

> **Goal:** Working cashout flow — PayPal first, then Interac, then Tremendous.

### 6.1 — PayPal (Sandbox → Production)
- [ ] **6.1.1 🟡 Get PayPal API credentials** (Client ID + Secret) from your PayPal developer account
- [ ] 6.1.2 Set sandbox credentials in `.env.local`
- [ ] 6.1.3 Wire cashout form at `/cashout` to `/api/payouts/request`
- [ ] 6.1.4 Display payout request status (pending, processing, completed, failed)
- [ ] 6.1.5 Add minimum payout validation ($5.00 suggested minimum)
- [ ] 6.1.6 Add insufficient balance check
- [ ] 6.1.7 Add duplicate destination check (same PayPal email within X days)
- [ ] 6.1.8 Test PayPal sandbox payout end-to-end

### 6.2 — Interac e-Transfer (Canada)
- [ ] **6.2.1 🟡 Get Interac API credentials** when ready for this phase
- [ ] 6.2.2 Add Interac as payout method in cashout form
- [ ] 6.2.3 Add Interac email/phone collection in user profile
- [ ] 6.2.4 Test Interac sandflow flow

### 6.3 — Tremendous Gift Cards
- [ ] **6.3.1 🟡 Get Tremendous API credentials** when ready
- [ ] 6.3.2 Add gift card catalog
- [ ] 6.3.3 Add gift card selection to cashout form

---

## Phase 7 — Admin Panel Completion

> **Goal:** Fully functional admin panel wired to real data.

### 7.1 — Dashboard
- [ ] 7.1.1 Wire admin dashboard stats to real Firestore queries
- [ ] 7.1.2 Add real-time user count
- [ ] 7.1.3 Add real-time transaction volume
- [ ] 7.1.4 Add payout metrics

### 7.2 — User Management
- [ ] 7.2.1 Wire `/admin/users` to real Firestore data
- [ ] 7.2.2 Add user search/filter
- [ ] 7.2.3 Add user detail view
- [ ] 7.2.4 Add ability to flag/suspend users

### 7.3 — Offer Management
- [ ] 7.3.1 Wire `/admin/offers` to Firestore offers collection
- [ ] 7.3.2 Add offer creation form
- [ ] 7.3.3 Add offer edit form
- [ ] 7.3.4 Add offer enable/disable toggle

### 7.4 — Transaction Monitoring
- [ ] 7.4.1 Wire `/admin/transactions` to `ledger_transactions`
- [ ] 7.4.2 Add transaction search/filter
- [ ] 7.4.3 Add transaction detail view

### 7.5 — Fraud Detection
- [ ] 7.5.1 Wire `/admin/fraud` to `fraud_flags` collection
- [ ] 7.5.2 Add fraud case management (review, dismiss, ban)
- [ ] 7.5.3 Add fraud metrics dashboard

---

## Phase 8 — Image & Asset Optimization

> **Goal:** Fast loading images, proper branding, optimized assets.

### 8.1 — Image Optimization
- [ ] 8.1.1 Convert all `public/images/` PNGs to WebP (with AVIF fallback)
- [ ] 8.1.2 Resize large PNGs (1.3MB–5MB) to reasonable sizes
- [ ] 8.1.3 Add proper `next/image` usage with width/height
- [ ] 8.1.4 Audit `public/images/offers/` — replace or remove

### 8.2 — Brand Assets
- [ ] **8.2.1 🟡 Get final logo files** from your OneDrive (SVG preferred)
- [ ] **8.2.2 🟡 Get hero/mascot renders** from OneDrive
- [ ] 8.2.3 Update favicon
- [ ] 8.2.4 Update opengraph-image.png
- [ ] 8.2.5 Update `public/tapcash-logo-horizontal.svg`
- [ ] 8.2.6 Update `public/tapcash-icon.svg`
- [ ] 8.2.7 Update manifest.json with proper icons

### 8.3 — Asset Cleanup
- [ ] 8.3.1 Remove unused images from `public/images/`
- [ ] 8.3.2 Organize `public/images/` into clean directory structure
- [ ] 8.3.3 Audit `public/images/hero/` and `public/images/assets/`

---

## Phase 9 — Testing & CI/CD

> **Goal:** Green test suite, working CI pipeline, automated checks.

### 9.1 — Test Suite Fix
- [ ] 9.1.1 Remove or fix `server/routers/__tests__/integration.test.ts`
- [ ] 9.1.2 Run `npm test -- --runInBand` — verify it passes
- [ ] 9.1.3 Add unit tests for:
  - Auth context
  - Offer card component
  - Payout form validation
  - Rate limiter
  - Firebase Admin helper
- [ ] 9.1.4 Add Playwright e2e tests for:
  - Landing page loads
  - Signup flow
  - Dashboard (authenticated)
  - Offerwall iframe
  - Cashout flow

### 9.2 — CI/CD Pipeline
- [ ] 9.2.1 Update `.github/workflows/` — remove or fix any broken steps
- [ ] 9.2.2 Add lint step to CI
- [ ] 9.2.3 Add type-check step to CI
- [ ] 9.2.4 Add test step to CI
- [ ] 9.2.5 Add build step to CI
- [ ] 9.2.6 Add Vercel preview deployment step
- [ ] 9.2.7 Add Lighthouse CI step
- [ ] 9.2.8 Add dependency audit step (`npm audit`)

### 9.3 — Security
- [ ] 9.3.1 Fix `npm audit` moderate vulnerabilities (review first, don't force)
- [ ] 9.3.2 Add Snyk or similar security scanning
- [ ] 9.3.3 Review Firebase security rules in `firestore.rules`

---

## Phase 10 — Documentation Refresh

> **Goal:** All docs accurate, comprehensive, and useful.

- [ ] 10.1 Update `TODO.md` (this file) — mark completed tasks after each sprint
- [ ] 10.2 Update `README.md`:
  - Current tech stack
  - Setup instructions
  - Font info (Space Grotesk + Manrope)
  - Env vars list
  - Architecture overview
  - Scripts reference
- [ ] 10.3 Update `GROUNDTRUTH.md`:
  - Current commit history
  - Current architecture
  - Completed features
  - Outstanding actions
- [ ] 10.4 Create `CHANGELOG.md` (if not exists)
- [ ] 10.5 Update `docs/API_DOCUMENTATION.md`
- [ ] 10.6 Update `docs/DEPLOYMENT_GUIDE.md`
- [ ] 10.7 Update `docs/DEVELOPER_GUIDE.md`
- [ ] 10.8 Update `docs/USER_GUIDE.md`
- [ ] 10.9 Update `docs/SECURITY_DOCUMENTATION.md`
- [ ] 10.10 Update `docs/PRODUCTION_CHECKLIST.md`
- [ ] 10.11 Update `AGENT_HANDOFF.md` and `AGENTS.md`

---

## Phase 11 — Final Polish & Launch Readiness

> **Goal:** Production-ready platform.

### 11.1 — Performance
- [ ] 11.1.1 Run Lighthouse audit — target 90+ all categories
- [ ] 11.1.2 Fix any render-blocking resources
- [ ] 11.1.3 Add proper font-display: swap
- [ ] 11.1.4 Implement image lazy loading
- [ ] 11.1.5 Add proper caching headers

### 11.2 — Accessibility
- [ ] 11.2.1 Run axe/Playwright accessibility audit
- [ ] 11.2.2 Fix any WCAG 2.1 AA violations
- [ ] 11.2.3 Add aria-labels where missing
- [ ] 11.2.4 Test keyboard navigation across all pages
- [ ] 11.2.5 Test with screen reader

### 11.3 — Mobile Responsiveness
- [ ] 11.3.1 Test all pages at 320px, 375px, 768px, 1024px, 1440px
- [ ] 11.3.2 Fix any mobile layout breaks
- [ ] 11.3.3 Test touch targets (min 44x44px)
- [ ] 11.3.4 Test mobile menu behavior

### 11.4 — SEO
- [ ] 11.4.1 Add proper meta tags to all pages
- [ ] 11.4.2 Verify sitemap.ts generates correct sitemap
- [ ] 11.4.3 Verify robots.ts is correct
- [ ] 11.4.4 Add structured data (JSON-LD for organization, website)

### 11.5 — Monitoring
- [ ] 11.5.1 Configure Sentry (DSN already in .env.example)
- [ ] 11.5.2 Configure Better Uptime monitoring
- [ ] 11.5.3 Add health check endpoint (`/api/health` exists — verify it works)
- [ ] 11.5.4 Add error tracking for critical flows (signup, payout, postback)

### 11.6 — Final Verification
- [ ] 11.6.1 Run full build: `npm run build`
- [ ] 11.6.2 Run full lint: `npm run lint`
- [ ] 11.6.3 Run type-check: `npm run type-check`
- [ ] 11.6.4 Run tests: `npm test -- --runInBand`
- [ ] 11.6.5 Run Playwright e2e tests
- [ ] 11.6.6 Verify no broken links
- [ ] 11.6.7 Verify all redirects work
- [ ] 11.6.8 Verify SSL/HTTPS on both domains
- [ ] 11.6.9 Open PR, merge to main, deploy to production

---

## Appendix A — Everything I Need From You

> Please prepare the following items. Mark with ✅ once provided.

### A.1 — OneDrive Assets

| # | Item | Status | Notes |
|---|------|--------|-------|
| A.1.1 | **Logo files** (SVG preferred) | 🔲 | Need the final TapCash logo in SVG format |
| A.1.2 | **Hero renders / mascot** | 🔲 | The main character/illustration shown on landing page |
| A.1.3 | **Offer images** (per category) | 🔲 | Images for: Surveys, Games, Videos, Tasks |
| A.1.4 | **UI/UX reference folder** | 🔲 | The design reference you mentioned — need to see which aesthetic you want |
| A.1.5 | **Background textures/patterns** | 🔲 | Any premium background elements |
| A.1.6 | **App mockup images** | 🔲 | Phone screenshots shown in AppShowcaseSection |
| A.1.7 | **Avatar images** (team/stock) | 🔲 | For testimonials, leaderboard, social proof |
| A.1.8 | **Brand color palette** | 🔲 | Confirm the current colors or provide updated ones |

### A.2 — Credentials & Configuration

| # | Item | Status | Notes |
|---|------|--------|-------|
| A.2.1 | **Identity Toolkit API enabled?** | 🔲 | Go to GCP Console → APIs & Services → Identity Toolkit API → Enable |
| A.2.2 | **Firebase Admin tested?** | 🔲 | Try signing up at tapcash.online/auth/signup — does it work? |
| A.2.3 | **RapidoReach credentials** | 🔲 | APP_ID, APP_KEY, APP_SECRET, TRANSACTION_KEY |
| A.2.4 | **Upstash Redis URL + Token** | 🔲 | For rate limiting in production |
| A.2.5 | **PayPal sandbox credentials** | 🔲 | Client ID + Secret (or production if ready) |
| A.2.6 | **GitHub Secrets check** | 🔲 | Run `gh secret list` in the repo and share the output (redact secrets) |
| A.2.7 | **Vercel env vars check** | 🔲 | Verify tapcash.online env vars match .env.local |

### A.3 — Content Decisions

| # | Item | Status | Notes |
|---|------|--------|-------|
| A.3.1 | **Color palette** | 🔲 | Current: dark theme (#0d0d1a), green (#00FF85), purple (#7B5CF0), cyan (#00D4FF). Should I keep as-is? |
| A.3.2 | **UI/UX direction** | 🔲 | You said there's a reference folder in OneDrive — please point me to the exact folder/file |
| A.3.3 | **Blog content** | 🔲 | Do you have blog posts to add, or should I create placeholder/sample content? |
| A.3.4 | **FAQ content** | 🔲 | Do you have FAQs ready, or should I draft them? |
| A.3.5 | **Privacy Policy / Terms** | 🔲 | Do you have legal text, or should I use standard templates? |
| A.3.6 | **Contact email/address** | 🔲 | For the contact page and footer |
| A.3.7 | **Social media links** | 🔲 | Twitter/X, Instagram, Discord, TikTok — for footer |
| A.3.8 | **About / Team info** | 🔲 | For /about and /careers pages |
| A.3.9 | **Minimum payout threshold** | 🔲 | Suggested: $5.00 CAD. Is that correct? |

### A.4 — Domains & Deployment

| # | Item | Status | Notes |
|---|------|--------|-------|
| A.4.1 | **tapcash.online** | 🔲 | Is this already deployed to Vercel? Does it auto-deploy from main? |
| A.4.2 | **tapcash.click** | 🔲 | Is this domain set up? Want it to mirror tapcash.online? |
| A.4.3 | **Vercel team access** | 🔲 | Do I have access or can you share the Vercel dashboard? |

---

## Appendix B — Credential Audit

### .env.local Current Status

| Variable | Status | Notes |
|----------|--------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ Set | `AIzaSyDDdJUdDADc8feNCVzZaHoyOdbkNwlpwn4` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ Set | `tapcash-16238.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ Set | `tapcash-16238` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ Set | `tapcash-16238.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ Set | `538090776118` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ Set | `1:538090776118:web:1d96a2dbd12f2d69211a97` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | ✅ Set | `G-MNZNE9ER7D` |
| `FIREBASE_PROJECT_ID` | ❌ Empty | Not set in .env.local (uses NEXT_PUBLIC fallback) |
| `FIREBASE_CLIENT_EMAIL` | ✅ Set | `firebase-adminsdk-fbsvc@tapcash-16238.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | ✅ Set | Has key with proper formatting |
| `LOOTABLY_API_KEY` | ❌ Empty | Won't need for launch (RapidoReach only) |
| `LOOTABLY_SECRET_KEY` | ❌ Empty | Won't need for launch |
| `NEXT_PUBLIC_RAPIDOREACH_APP_ID` | ❌ Empty | **Needs your input** |
| `RAPIDOREACH_APP_ID` | ❌ Empty | **Needs your input** |
| `RAPIDOREACH_APP_KEY` | ❌ Empty | **Needs your input** |
| `RAPIDOREACH_APP_SECRET` | ❌ Empty | **Needs your input** |
| `RAPIDOREACH_TRANSACTION_KEY` | ❌ Empty | **Needs your input** |
| `PAYPAL_MODE` | ✅ Set | `sandbox` |
| `PAYPAL_CLIENT_ID` | ❌ Empty | **Needs your input** |
| `PAYPAL_CLIENT_SECRET` | ❌ Empty | **Needs your input** |
| `INTERAC_API_KEY` | ❌ Empty | For later phase |
| `INTERAC_API_SECRET` | ❌ Empty | For later phase |
| `TREMENDOUS_API_KEY` | ❌ Empty | For later phase |
| `TREMENDOUS_CAMPAIGN_ID` | ❌ Empty | For later phase |
| `UPSTASH_REDIS_REST_URL` | ❌ Empty | **Needs your input** for production rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | ❌ Empty | **Needs your input** |
| `SENTRY_DSN` | ❌ Empty | Not critical to start |
| `SENTRY_ORG` | ❌ Empty | Not critical to start |
| `SENTRY_PROJECT` | ❌ Empty | Not critical to start |
| `SENTRY_AUTH_TOKEN` | ❌ Empty | Not critical to start |
| `CRON_SECRET` | ❌ Empty | Needed for cron endpoints |
| `BETTER_UPTIME_API_KEY` | ❌ Empty | For monitoring |
| `RESEND_API_KEY` | ❌ Empty | Not in .env.local but needed for email |
| `SESSION_SECRET` | ❌ Empty | Not in .env.local — needed for session encryption |

---

## Phase Order & Sprint Plan

```
Sprint 1: Phase 0 (Foundation & Credential Audit)
Sprint 2: Phase 1 (Design System Unification)
Sprint 3: Phase 2 (Missing Pages)
Sprint 4: Phase 3 (Auth & Route Protection)
Sprint 5: Phase 4 (Content Migration)
Sprint 6: Phase 5 (RapidoReach Offerwall)
Sprint 7: Phase 6 (Payout System)
Sprint 8: Phase 7 (Admin Panel)
Sprint 9: Phase 8 + 9 (Assets + Testing)
Sprint 10: Phase 10 + 11 (Docs + Polish)
```

Each sprint ends with: commit → push to main → update all docs.

---

## Current Blockers (What I'm Waiting On)

1. **Identity Toolkit API** — You need to enable this in GCP before signup works
2. **OneDrive access** — I can't scrape the OneDrive folder; please tell me what's in it
3. **UI/UX reference** — Which specific folder/files should I look at?
4. **RapidoReach credentials** — Required for offerwall integration
5. **Color palette confirmation** — Happy with current dark/green/purple/cyan scheme?
6. **Logo files** — SVG of final logo
7. **Asset decisions** — Which hero, mascot, offer images to use

Once you provide answers/items above, I'll start Sprint 1.
