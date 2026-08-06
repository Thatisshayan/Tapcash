# Track 2 — UI/UX Model U Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate TapCash's web UI (`src/components/`, `src/app/`) off four competing color systems and 914 hardcoded hex values onto the single Model U semantic token layer already published in `packages/tokens/tokens.json`, remove fabricated statistics and hardcoded progress state, retheme the admin panel dark, and flag (never delete) orphaned components for Shayan's review — split into 2-3 directory-disjoint batches so parallel Vertex/Gemini sessions never touch the same file.

**Architecture:** Three independent, non-overlapping component/route batches (marketing, product/dashboard, admin), each claimed as its own ledger task and git branch by a separate AI session. Every batch consumes the same read-only dependency — `packages/tokens/tokens.json` (already migrated, Phase 1 complete) — and must keep `packages/tokens/tokens.test.ts` green without modifying it. A single prerequisite task produces the orphaned-component review doc before the three batches start, since it would otherwise require all three sessions to edit one shared file.

**Tech Stack:** Next.js 16 / React 19 / Tailwind v4 (`src/app/globals.css` `@theme` block), Framer Motion, `packages/tokens/tokens.json` as token source of truth, Jest (`next-jest`) for the drift test.

## Global Constraints

- Scope is web UI/styling only: `src/components/**`, `src/app/**` (routes + `globals.css`). Do NOT touch `mobile/**` (Track 3) or `src/app/api/**` route handler logic (Track 1) — reading an API route to learn its response shape is fine, editing its logic is not.
- No file or component deletion without Shayan's explicit sign-off (Rule 14, `AGENTS.md`). Orphaned/dead components are flagged in `docs/superpowers/orphaned-components-for-review.md`, never deleted, in any task in this plan.
- Every task's commit message must include `traces-to: TASK-038`.
- Branch naming: `agent/vertex/037-<directory-slug>` — one branch per batch task, created off the current default branch before that task's first commit.
- Every batch must preserve `packages/tokens/tokens.test.ts` passing (`npm test -- packages/tokens/tokens.test.ts`) — the file itself is not edited by any batch task; batches only make `globals.css` / `mobile/src/theme.ts`-adjacent web files consistent with it. (Mobile is out of scope so only the web half of that test is relevant to this track, but the whole suite must stay green.)
- Migrate hex → token by using the CSS custom properties already defined in `src/app/globals.css`'s `@theme` block (sourced from `packages/tokens/tokens.json`) — e.g. replace `bg-[#31F06F]` with `bg-[var(--color-brand-green)]` or the equivalent Tailwind utility already mapped in `@theme`, never a new literal hex.
- Banned legacy hex anywhere touched: `#00FF85`, `#7B5CF0`, `#0d0d1a`, `#00D4FF`, `#FFAB00`, `#00E6C3` (from `packages/tokens/tokens.json` → `legacy.bannedHex`). Any of these found in a file a batch touches must be converted to the Model U equivalent in the same pass.
- No fabricated statistics, fake "live" widgets, confetti outside a genuinely completed payout, or the word "Premium" in any new/renamed component (per `REDESIGN_SPEC.md` §1.4). Existing `*Premium`-named files are handled per Task 1 (flag, don't rename/delete) unless a task explicitly says to harvest and rename.
- End every task with the concrete verification steps listed in that task — do not mark a task done without running them.

---

## Baseline Findings (verified 2026-08-06, supersedes stale counts in `UI_UX_DEEP_AUDIT_2026.md` where they differ)

| Claim | Audit doc said | Verified now | Delta |
|---|---|---|---|
| Hardcoded hex in `src/components` + `src/app` (`.tsx`/`.ts`/`.css`) | 1,146 occurrences / 103 unique | **914 occurrences / 127 unique** | Occurrence count dropped (~230 fewer, likely partial interim cleanup), unique-value count went up (127 vs 103) — drift is not improving, it's diversifying. Re-run: `grep -rIcoE "#[0-9a-fA-F]{3,8}" src/components src/app --include="*.tsx" --include="*.ts" --include="*.css" \| awk -F: '{sum+=$2} END {print sum}'` |
| Fabricated `2,847+ users cashed out in last 24h` | Present | **Confirmed present** — `src/components/sections/HeroSection.tsx:33` | Matches |
| Fabricated `$2,547,382 paid out` counter | Present | **Confirmed present** — `src/components/sections/HeroSection.tsx:45` (`const target = 2547382;`), animated by `EarningsCounter()` (lines 39-84) | Matches |
| Fabricated `2.3K+ cashed out today` | Present | **Confirmed present** — `src/components/layout/Navbar.tsx:52`, inside `AvatarGroup()` | Matches |
| `/api/stats/platform` exists to replace these | Implied | **Confirmed** — `src/app/api/stats/platform/route.ts` already returns real Firestore-backed `{ verifiedCompletions, activeEarners, totalPaidOut, avgPayoutWindow }` with a labeled `source: "fallback"` when Firebase Admin isn't configured | Matches, directly actionable |
| CashPath hardcoded to a fixed step for every user | "hardcoded to step 2 for every user" | **Web equivalent found, but it's a different hardcode than the audit's mobile citation**: `src/components/sections/CashPathSection.tsx:3-32` — the shipped `STEPS` array hardcodes `done: true` **only** on the last node ("Cashed Out") and `done: false` on all four others, unconditionally, for every render. The audit's literal "step 2" claim (`ACTIVE = 2`) is `mobile/app/(tabs)/index.tsx:15`, which is Track 3 (mobile) and out of this track's scope. | Contradicts audit phrasing — the audit's CashPath-hardcode citation for "step 2" is mobile-only; the web CashPathSection has its own, differently-shaped hardcode not previously called out by file:line |
| 32 orphaned components | Listed by name | **Sampled 35 of the ~32 listed names via import-grep; 32 show 0 non-self imports anywhere in `src/app` or `src/components`.** `landing/HeroV1Balanced`, `landing/HeroV2Gaming`, `landing/HeroV3Offers` each show 1 "import" but it is `landing/HeroDynamic.tsx` importing them — and `HeroDynamic` itself has 0 imports from anywhere live, so the whole 4-file chain is transitively dead. | Matches; orphan count confirmed accurate, with the added detail that the Hero A/B chain is dead as a unit, not individually |
| 384 light-theme utility hits in admin | 384 | **354** (`grep -c` of `bg-white\|bg-gray-[0-9]+\|text-gray-[0-9]+\|from-purple-50\|to-blue-50` across `src/app/admin/**/*.tsx`) — concentrated in `admin/fraud/page.tsx` (59), `admin/offers/page.tsx` (50), `admin/users/page.tsx` (49), `admin/transactions/page.tsx` (46), `admin/dashboard/page.tsx` (23), `admin/page.tsx` (24), plus 6 in `admin/promo-analytics/page.tsx`, 6 in `admin/multiplier/page.tsx`, 1 in `admin/layout.tsx` | Lower than audit's 384 by 30 (regex pattern differs slightly from the audit's; still hundreds, still concentrated in the same 5 pages), directionally confirmed |

**Directory inventory used to build the batches below** (`src/components/*`, non-mobile, non-`ui`-shared-package):

```
src/components/
  sections/   14 files   (marketing sections — HeroSection, CashPathSection, etc.)
  landing/    15 files   (10 of 15 orphaned/dead — see Task 1)
  layout/      2 files   (Navbar.tsx, Footer.tsx)
  ui/          8 files   (Button, Card, Badge, GlassCard, Logo, ProgressBar, DashboardMockup[orphan], index.ts)
  dashboard/   4 files   (all 4 are orphaned *Premium components)
  cashout/     4 files   (all 4 are orphaned *Premium components)
  admin/       4 files   (all 4 are orphaned *Premium components — dark reference implementation for Task 4)
  *.tsx (loose, 21 files): BalanceCard, BrandLogos[orphan], CashPathFlow[orphan], CompletionReceiptModal[orphan],
    ConversionStrip, CookieConsent, GlobalNotificationListener, GoogleSignInButton, Header, InstructionModal,
    OfferCard, OnboardingModal[orphan], PageMetadata, PremiumUi, PushNotificationPrompt[orphan],
    ServiceWorkerRegistrar, SessionManager, StreakWidget, TapScoreIndicator[orphan], TrustBadges[orphan],
    VercelAnalytics, VerifiedAccessGate

src/app/ routes (42 total, excluding api/):
  Marketing (19): /, /about, /how-it-works, /faq, /help, /contact, /careers, /blog, /blog/[slug], /games,
    /rewards, /leaderboard, /cashPath, /tapScore, /affiliate, /ref/[refId], /privacy, /terms, /cookies
  Product/auth (9): /dashboard, /cashout, /cashout/status, /transactions, /payouts, /referrals,
    /rapidoreach, /auth/signin, /auth/signup, /auth/verify-email  (10, listed 9+1 verify-email)
  Admin + system (11): /admin, /admin/dashboard, /admin/users, /admin/transactions, /admin/offers,
    /admin/fraud, /admin/multiplier, /admin/promo-analytics, error.tsx, loading.tsx, not-found.tsx
```

**Batch split (directory-disjoint, so file-level collision between parallel sessions is structurally impossible):**

| Batch | Components | Routes | Branch |
|---|---|---|---|
| **A — Marketing** (Task 2) | `sections/`, `landing/`, `layout/` | 19 marketing routes | `agent/vertex/038-landing` |
| **B — Product/Dashboard** (Task 3) | `dashboard/`, `cashout/`, `ui/`, 21 loose top-level `src/components/*.tsx` | `/dashboard`, `/cashout*`, `/transactions`, `/payouts`, `/referrals`, `/rapidoreach`, `/auth/*` | `agent/vertex/038-product-dashboard` |
| **C — Admin** (Task 4) | `admin/` (the 4 `*Premium` reference components) | 8 `/admin/*` routes + `error.tsx`/`loading.tsx`/`not-found.tsx` | `agent/vertex/038-admin-panel` |

---

### Task 5: Generated Hero/Product Asset Pipeline — cross-platform, single source (updated 2026-08-06)

**Context:** Shayan supplied a coded design reference (`C:\Users\AgentDev\Downloads\tapcash-frontend-design-request`) showing the level of "alive" visual asset TapCash currently lacks — a 3D-style hero character render, a wallet render, and per-category offer art (slots/tycoon/strike/bingo), used as real `<img>` content behind glassmorphic panels rather than flat CSS gradients. Decision: **Model U stays the canonical palette** (not the reference's `#14F195`/`#6D28D9` palette) — this task's job is to bring that reference's asset *quality and presence* into the Model U system, not its colors. The reference's own PNGs are also a cautionary example: they're 1.9-3.9MB each, uncompressed — this task must not repeat that.

**Updated scope, per Shayan's direction 2026-08-06:**
- Web, mobile (Expo), iOS, and Android must all render the **same generated asset set** — one canonical `public/images/` (web) source, synced/copied into `mobile/assets/` (which Track 3 currently has as 1x1 placeholder stubs — see Track 3 Task 1) rather than two teams generating divergent art independently. This task is the single source of truth; Track 3's asset task consumes its output, it does not generate its own.
- **Quality over quantity, explicitly bounded**: real, relevant assets only — one hero render, one wallet render, one image per *actual* offer category (not per-offer, not invented categories). Shayan explicitly said not to mass-generate ("do NOT go ahead and generate 5k images") — this task's asset count is deliberately small (hero + wallet + N offer categories, where N = however many categories `OfferCard.tsx`'s props actually define, likely single digits).
- **Tooling**: Higgsfield (already connected) OR Google's Gemini 2.5 Flash Image ("Nano Banana", via Vertex AI / Google API — Shayan has Vertex access) are both acceptable generators; use whichever produces cleaner results for a given asset, don't lock to one.
- **Ownership**: this task's *execution* (the actual generation/prompting work) should be delegated to Shayan's content-creator agent or Hermes, not run inline in a Claude Code session — Shayan flagged this specifically to conserve Claude usage on mechanical asset-generation work that doesn't need Claude Code's judgment. Claude Code's role here is limited to: writing this task spec (done), and later wiring the *already-generated* files into components (Step 4-6 below) if that part still needs code-level judgment. Whoever executes Steps 1-2 should treat this document as their brief.

**Files:**
- Create: `public/images/hero-character.webp` (or `.png` source + `.webp` output — see Step 3)
- Create: `public/images/wallet-render.webp`
- Create: `public/images/offer-art/*.webp` (one per active offer category — enumerate real categories from `src/app/api/offers` response shape or `OfferCard.tsx` props, don't invent categories)
- Modify: `src/components/sections/HeroSection.tsx` (Batch A) — add the hero image, do not duplicate Batch A's token-migration edits, coordinate via the same branch/PR
- Modify: `src/components/BalanceCard.tsx` (Batch B) — add the wallet render
- Modify: `src/components/OfferCard.tsx` (Batch B) — wire per-category offer art

**Interfaces:**
- Consumes: Model U hex values from `packages/tokens/tokens.json` §`primitives` (as the exact color-matching brief for generation, so output art reads as part of the same system, not a mismatched overlay).
- Produces: static files under `public/images/` that Batch A and Batch B's `<Image>` components reference by path.

- [ ] **Step 1: Generate the hero character render**

Use the `Higgsfield` image-generation tool (already connected) with a prompt built from Model U's exact hex values, e.g.:
"3D-rendered stylized character holding a smartphone displaying a rewards app UI, dark navy background #050813, primary accent glow #31F06F, secondary accent #7C3DFF, floating coins/cash particles, soft rim lighting, transparent or dark-navy background, no text overlays" — generate at minimum 2000px on the long edge so it downsamples cleanly.

- [ ] **Step 2: Generate the wallet render and offer-category art**

Same palette brief, one prompt per asset: a wallet/card render for the balance widget, and one image per real offer category (check `OfferCard.tsx`'s category prop values first — do not guess category names).

- [ ] **Step 3: Compress every generated asset before committing**

Run (adjust tool to whatever's available — `sharp-cli`, `squoosh-cli`, or Next.js's own image optimization at build time is NOT a substitute for pre-optimizing source weight):
```bash
npx @squoosh/cli --webp '{"quality":80}' -d public/images/optimized public/images/*.png
```
Target: **under 300KB per asset**, ideally under 150KB for anything above-the-fold (hero). Verify with:
```bash
find public/images -name "*.webp" -size +300k
```
Expected: no output (nothing over budget).

- [ ] **Step 4: Wire into components using Next.js `<Image>`, not raw `<img>`**

In `HeroSection.tsx`, replace any placeholder/gradient-only hero area with:
```tsx
import Image from "next/image";
// ...
<Image
  src="/images/hero-character.webp"
  alt="TapCash rewards character"
  width={800}
  height={800}
  priority
  className="absolute -bottom-10 -right-10 hidden lg:block w-[55%] h-auto object-contain"
/>
```
Adjust exact positioning to fit the section's actual current layout (read the file first — do not assume it matches the reference's absolute positioning verbatim). Apply the equivalent pattern for the wallet render in `BalanceCard.tsx` and offer art in `OfferCard.tsx`, using `loading="lazy"` (not `priority`) for anything below the fold.

- [ ] **Step 5: Verify**

Run: `npx next build 2>&1 | grep -i "warn\|error"` — expect no new image-related warnings (missing `alt`, oversized unoptimized images, etc.)
Run: `find public/images -size +300k` — expect no output.
Visually confirm in `npm run dev` that no asset visually clashes with Model U (no leftover `#14F195`-family green bleeding through from a generated asset's background — regenerate if the AI tool didn't respect the transparent/dark-navy background instruction).

- [ ] **Step 6: Commit**

```bash
git add public/images src/components/sections/HeroSection.tsx src/components/BalanceCard.tsx src/components/OfferCard.tsx
git commit -m "feat(assets): add generated Model U hero/wallet/offer art

traces-to: TASK-038"
```

**Sequencing note:** This task should land *after* Batch A and Batch B's token-migration commits, not before — inserting images into a component mid-migration risks the migration diff missing image-adjacent class changes. Same branches (`agent/vertex/038-landing` for the hero image, `agent/vertex/038-product-dashboard` for wallet/offer art) — this is a second commit on each, not a fourth batch/branch.

---

### Task 6: Real Brand Logos — NOT AI-generated, NOT hand-vectored (added 2026-08-06 per Shayan)

**Hard rule, explicit from Shayan: every payment/brand logo in this app must be the company's actual official logo asset, sourced from that company's real brand/press kit. No AI-generated logos, no icon-library approximations (the current `lucide-react` `CreditCard`/`ShoppingBag`/`Bitcoin`/`Landmark` icons and emoji (💰🎁☕🎮💳) standing in for real brands), no hand-built "looks close enough" vector reconstructions. This is a different category of asset from Task 5's AI-generated hero/wallet/offer *illustrations* — illustrations can be AI-generated, real company logos cannot.**

**Files:**
- Create: `public/images/logos/paypal.svg` (and `.png` fallback if the official kit provides one)
- Create: `public/images/logos/amazon.svg`
- Create: `public/images/logos/tim-hortons.svg`
- Create: `public/images/logos/steam.svg`
- Create: `public/images/logos/visa.svg`
- Create: `public/images/logos/bitcoin.svg`
- Create: `public/images/logos/litecoin.svg`
- Modify: `src/components/sections/CashoutMethodsSection.tsx` — replace the `icon: "💰"` etc. emoji map with real logo images
- Modify: `src/components/sections/PayoutMethodsSection.tsx` — replace the `lucide-react` icon map (`CreditCard`, `ShoppingBag`, `Bitcoin`, `Landmark`) with real logo images; remove the stale `/* TODO: Replace with official PayPal/Interac SVG logos when available */` comment (superseded by this task; the Interac half of that TODO is moot since Track 1 froze Interac entirely)

**Interfaces:**
- Consumes: nothing generated — these are sourced assets, not produced ones.
- Produces: `public/images/logos/*.svg` referenced by both sections above via Next.js `<Image>`.

- [ ] **Step 1: Source each logo from the company's own official brand/press resources — not a search-engine image result, not a generic icon pack**

Real official sources only, e.g.: PayPal — https://newsroom.paypal-corp.com or PayPal's brand guideline page; Visa — usa.visa.com brand assets; Steam — Valve's partner/press assets; Bitcoin — bitcoin.org (the Bitcoin Foundation's own site publishes the open logo); Litecoin — litecoin.org's press kit; Amazon and Tim Hortons — their respective investor-relations/press-kit pages typically host approved logo downloads (Amazon in particular has strict brand-usage guidelines — check their trademark guidelines page before using their logo, since retail/rewards platforms using the Amazon logo for a "gift card" context need to comply with Amazon's affiliate/brand-usage terms, not just download the SVG). If Shayan's content-creator agent or Hermes has access to a licensed brand-asset library, use that instead of ad hoc downloads.

- [ ] **Step 2: Verify each downloaded asset against the source, don't trust a filename**

For each logo, confirm the file actually renders as that company's current logo (not a legacy/outdated version, not a placeholder) by opening it and visually comparing against the official site. Do not skip this — a stale or wrong-version logo is worse than no logo.

- [ ] **Step 3: Normalize format and size, preserve brand color (don't force logos into Model U)**

Company logos are exempt from the Model U palette migration (Batches A/B don't touch these) — a payment brand's logo must stay in that brand's real colors for recognizability/trust, not be recolored to match the app. Export/save each as SVG where the official kit provides one (preferred — crisp at any size); PNG at minimum 256×256 otherwise. Do not compress SVGs lossily.

- [ ] **Step 4: Wire into both sections**

Replace the emoji/icon-library placeholders with real `<Image>` (or inline SVG component) references, sized consistently within each section's existing card layout. Keep each brand's logo on a neutral/transparent background so it reads correctly against the dark Model U card background — most official logos are exported for light backgrounds, so check for a "for dark backgrounds" or white/reversed variant in the same press kit, and use that variant instead of just placing a light-background logo directly on dark UI.

- [ ] **Step 5: Verify**

Run: `npx next build 2>&1 | grep -i "error"` — no broken image references.
Visual check in `npm run dev`: every payment method card shows a real, correctly-oriented, legible brand mark — no emoji, no generic lucide icon standing in for a real company.

- [ ] **Step 6: Commit**

```bash
git add public/images/logos src/components/sections/CashoutMethodsSection.tsx src/components/sections/PayoutMethodsSection.tsx
git commit -m "feat(assets): replace placeholder icons with real official brand logos

traces-to: TASK-038"
```

**Licensing note:** Some brand-usage guidelines (Amazon in particular) restrict how their logo may be displayed and in what context. Flag to Shayan if any sourced brand's terms conflict with how TapCash displays it (e.g., implying an endorsement/partnership that doesn't exist) — don't silently proceed past a licensing red flag.

---

### Task 7: Contrast Audit — WCAG AA (4.5:1 text, 3:1 UI) — REDESIGN_SPEC Phase 1 gate (added 2026-08-06)

**Context:** `docs/governance/DEFERRED_WORK.md`'s "Per-component raw-hex purge" entry explicitly pairs the hex purge with a contrast audit as REDESIGN_SPEC's own Phase 1 gate criterion — this was missing from Batches A-C above, which only covered the hex-to-token migration itself, not verifying the resulting token pairings are actually readable. This task closes that gap.

**Files:**
- No new files — audits the output of Tasks 2-4 (Batches A/B/C) after they land.
- Modify: any component where a check below fails (fix by choosing a different Model U semantic pairing, not by inventing a new off-palette color).

**Interfaces:**
- Consumes: the final rendered output of Batches A, B, C (this task runs after all three, not in parallel with them).

- [ ] **Step 1: Enumerate every text-on-background and UI-element-on-background color pairing actually used post-migration**

For each component touched in Batches A-C, list the semantic token pairs in use (e.g., `text-white/70` on `bg-[#050813]`, `text-[--color-brand-green]` on a card background, etc.).

- [ ] **Step 2: Check each pairing against WCAG AA**

Text pairs must meet ≥ 4.5:1 contrast ratio (3:1 for large text ≥ 24px/19px-bold). Non-text UI elements (borders, icons conveying meaning, focus indicators) must meet ≥ 3:1. Use a real contrast-checking tool (e.g., the WebAIM contrast checker, or a CLI tool like `wcag-contrast` — don't eyeball it) against the actual hex values resolved from each Model U token.

- [ ] **Step 3: Fix any failing pairing**

If a pairing fails, substitute a different existing Model U semantic token with sufficient contrast (e.g., a higher-contrast text-white opacity step, or a different semantic surface token) — do not introduce a new off-palette hex value to patch a contrast failure, that would undo the purge Batches A-C just did.

- [ ] **Step 4: Verify and document**

Record the audit result (pass/fail per pairing, any fixes applied) in a short note appended to `docs/superpowers/mockups/track2-mockup-notes.md` or a new `docs/superpowers/contrast-audit-2026-08-06.md`, so this isn't re-litigated per PR.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix(a11y): contrast audit pass on Model U token pairings (REDESIGN_SPEC Phase 1 gate)

traces-to: TASK-038"
```

---

### Task 0: Token Dependency (do not replan — read-only reference for every batch)

**Files:**
- Reference only, not modified by this plan: `D:\AgentDevWork\repos\tapcash\packages\tokens\tokens.json`, `D:\AgentDevWork\repos\tapcash\packages\tokens\build.mjs`, `D:\AgentDevWork\repos\tapcash\packages\tokens\tokens.test.ts`

This is not a claimable ledger task. It exists so Tasks 2, 3, and 4 have a single documented dependency instead of each re-deriving the palette. `tokens.json` is the canonical Model U primitive/semantic source (Phase 1, already complete — confirmed present and correct during research for this plan). Every batch task below reads the semantic names from `tokens.json` §`semantic` and the CSS custom properties they compile to in `src/app/globals.css`'s `@theme` block; no batch edits `tokens.json`, `build.mjs`, or `tokens.test.ts`.

If a batch needs a semantic token that doesn't exist yet (none identified in this plan — the 11-entry semantic layer in `tokens.json` covers every case below), stop and escalate to Shayan rather than inventing a new primitive inline.

---

### Task -1: Mockup Approval Gate (prerequisite — run before Task 1 and all batches; added 2026-08-06 per Shayan)

**Context:** Shayan's explicit instruction: before any full page/component migration work starts, he wants to see a generated mockup image of the target look first. This is a visual sign-off gate, not a code task — no batch (Tasks 1-4) or the asset pipeline (Task 5) may start until this is approved.

**Files:**
- Create: `docs/superpowers/mockups/track2-mockup-v1.png` (or `.jpg`) — one representative composite image, not a full page build
- Create: `docs/superpowers/mockups/track2-mockup-notes.md` — what the mockup shows and what it doesn't (e.g. "shows Home/landing hero + dashboard balance card + one offer card, does not show every route")

**Interfaces:**
- Consumes: `packages/tokens/tokens.json` Model U primitives, and Task 5's asset-generation approach (same tool: Higgsfield or Gemini 2.5 Flash Image / Nano Banana) so the mockup reflects the same visual language the real build will use — not a disconnected concept image.
- Produces: nothing consumed by later tasks — this is a human checkpoint, not a code dependency. Tasks 1-4 and 5 read this task's outcome (approved / not approved) as a go/no-go gate.

- [ ] **Step 1: Generate one composite mockup image**

Using Higgsfield or Gemini 2.5 Flash Image (Nano Banana), generate a single image showing the target look applied to 2-3 representative real surfaces — not every page. Recommended composition: the landing hero section (Batch A's territory) + the dashboard balance/offers area (Batch B's territory), shown side by side or stacked, using Model U's exact hex values (`#050813` bg, `#31F06F` green, `#7C3DFF` purple, `#18D9FF` cyan) plus a sample of the Task 5 hero/wallet asset style. This does not need to be pixel-accurate production code — it's a direction-check image, generated once, not iterated 20 times.

- [ ] **Step 2: Write the notes file**

In `docs/superpowers/mockups/track2-mockup-notes.md`, state plainly: which surfaces the mockup covers, which it doesn't, and that approval of this image is approval of the *direction* (palette + asset style + layout feel), not a pixel-exact spec every batch must match precisely.

- [ ] **Step 3: Present to Shayan for approval — STOP here**

Do not proceed to Task 1 or any batch until Shayan explicitly approves the mockup. If he requests changes, regenerate (Step 1) and re-present — do not silently proceed on an assumption of approval.

- [ ] **Step 4: Commit (only after approval)**

```bash
git add docs/superpowers/mockups/
git commit -m "docs(track2): add approved mockup, gate for full-page work

traces-to: TASK-038"
```

---

### Task 1: Orphaned Component Review Doc (prerequisite — run before Tasks 2-4 start)

Single-session task. Must land before the three parallel batches begin, because it writes one shared file (`docs/superpowers/orphaned-components-for-review.md`) that all three batches would otherwise race on. Read-only against component code — this task greps for import counts and writes a doc, it does not modify any component.

**Files:**
- Create: `D:\AgentDevWork\repos\tapcash\docs\superpowers\orphaned-components-for-review.md`

**Interfaces:**
- Consumes: nothing (pure repo grep).
- Produces: `docs/superpowers/orphaned-components-for-review.md`, which Tasks 2-4 may read (not edit) to know which files in their batch are flagged dead vs. live, so they don't spend migration effort re-theming code nobody renders. Flagged files still get their hex migrated if a task touches them for another reason (e.g. Task 4 harvests styling from the `admin/*Premium` files even though they're flagged) — flagging is not a license to skip token migration, only a signal against deletion.

- [ ] **Step 1: Re-run the import-count grep for every candidate orphan and capture output**

Run this from the repo root (`D:\AgentDevWork\repos\tapcash`), once per candidate — this is the exact check already run during planning research, re-run it fresh so the doc reflects the state at execution time, not planning time:

```bash
for f in "landing/Hero" "landing/HeroDynamic" "landing/HeroPremium" "landing/HeroV1Balanced" \
  "landing/HeroV2Gaming" "landing/HeroV3Offers" "landing/CashPathLivePremium" \
  "landing/TapScoreSectionPremium" "landing/TopOffersPremium" "landing/TrustStripPremium" \
  "admin/AdminOverviewPremium" "admin/FraudManagementPremium" "admin/TransactionManagementPremium" \
  "admin/UserManagementPremium" "dashboard/BalanceCardsPremium" "dashboard/LeaderboardPremium" \
  "dashboard/OfferGridPremium" "dashboard/TransactionHistoryPremium" "cashout/BalanceSummaryPremium" \
  "cashout/CashoutFormPremium" "cashout/PayoutHistoryPremium" "cashout/PayoutMethodsPremium" \
  "sections/FinalCTASection" "sections/HowItWorksSection" "sections/PayoutMethodsSection" \
  "sections/PayoutTicker" "sections/StatsSection" "sections/TestimonialsSection" \
  "TapScoreIndicator" "TrustBadges" "BrandLogos" "CashPathFlow" "CompletionReceiptModal" \
  "OnboardingModal" "PushNotificationPrompt" "ui/DashboardMockup"; do
  base=$(basename "$f")
  count=$(grep -rl "from '@/components/$f'\|from \"@/components/$f\"\|/$base'" src/app src/components --include="*.tsx" | grep -v "components/$f.tsx" | wc -l)
  echo "$count  $f"
done
```

Expected: every line reads `0  <path>` except the three `HeroV*Balanced/Gaming/Offers` lines, which read `1  <path>` (imported only by the also-dead `landing/HeroDynamic.tsx`).

- [ ] **Step 2: Write the review doc**

Create `docs/superpowers/orphaned-components-for-review.md` with this content, substituting the fresh grep output from Step 1 if any count changed from what's shown here (as of this plan's research pass, none had):

```markdown
# Orphaned Components — Flagged for Shayan's Review

Per boardroom Rule 14 (`AGENTS.md`), no file or component may be deleted without
Shayan's explicit sign-off. This document lists every component found with **zero**
live imports anywhere in `src/app/` or `src/components/` (verified by import-grep,
not just the audit's static read) so Shayan can approve deletions in a batch
instead of one at a time. Nothing listed here has been deleted or modified.

Verification command used for every row:
`grep -rl "from '@/components/<path>'" src/app src/components --include="*.tsx" | grep -v "components/<path>.tsx" | wc -l`

## Dead Hero variants (6 files, all reachable only through each other)

| File | Why flagged |
|---|---|
| `src/components/landing/Hero.tsx` | 0 imports found |
| `src/components/landing/HeroDynamic.tsx` | 0 imports found (imports the 3 files below, but nothing imports it) |
| `src/components/landing/HeroPremium.tsx` | 0 imports found |
| `src/components/landing/HeroV1Balanced.tsx` | 1 import — from `HeroDynamic.tsx`, itself dead. Transitively unreachable. |
| `src/components/landing/HeroV2Gaming.tsx` | 1 import — from `HeroDynamic.tsx`, itself dead. Transitively unreachable. |
| `src/components/landing/HeroV3Offers.tsx` | 1 import — from `HeroDynamic.tsx`, itself dead. Transitively unreachable. |

The shipped hero is `src/components/sections/HeroSection.tsx`, imported at `src/app/page.tsx:4,28`.

## Other `landing/` orphans (4 files)

| File | Why flagged |
|---|---|
| `src/components/landing/CashPathLivePremium.tsx` | 0 imports found |
| `src/components/landing/TapScoreSectionPremium.tsx` | 0 imports found |
| `src/components/landing/TopOffersPremium.tsx` | 0 imports found |
| `src/components/landing/TrustStripPremium.tsx` | 0 imports found |

## Admin `*Premium` components (4 files) — SPECIAL CASE, do not treat as pure dead code

| File | Why flagged | Caveat |
|---|---|---|
| `src/components/admin/AdminOverviewPremium.tsx` | 0 imports found | Dark-themed reference implementation for the Task 4 admin retheme — Task 4 harvests its styling patterns before any deletion decision is made. Keep until Task 4 lands and Shayan reviews. |
| `src/components/admin/FraudManagementPremium.tsx` | 0 imports found | Same caveat |
| `src/components/admin/TransactionManagementPremium.tsx` | 0 imports found | Same caveat |
| `src/components/admin/UserManagementPremium.tsx` | 0 imports found | Same caveat |

## Dashboard `*Premium` components (4 files)

| File | Why flagged |
|---|---|
| `src/components/dashboard/BalanceCardsPremium.tsx` | 0 imports found |
| `src/components/dashboard/LeaderboardPremium.tsx` | 0 imports found |
| `src/components/dashboard/OfferGridPremium.tsx` | 0 imports found |
| `src/components/dashboard/TransactionHistoryPremium.tsx` | 0 imports found |

## Cashout `*Premium` components (4 files)

| File | Why flagged |
|---|---|
| `src/components/cashout/BalanceSummaryPremium.tsx` | 0 imports found |
| `src/components/cashout/CashoutFormPremium.tsx` | 0 imports found |
| `src/components/cashout/PayoutHistoryPremium.tsx` | 0 imports found |
| `src/components/cashout/PayoutMethodsPremium.tsx` | 0 imports found |

## `sections/` orphans (6 files)

| File | Why flagged |
|---|---|
| `src/components/sections/FinalCTASection.tsx` | 0 imports found |
| `src/components/sections/HowItWorksSection.tsx` | 0 imports found |
| `src/components/sections/PayoutMethodsSection.tsx` | 0 imports found |
| `src/components/sections/PayoutTicker.tsx` | 0 imports found |
| `src/components/sections/StatsSection.tsx` | 0 imports found |
| `src/components/sections/TestimonialsSection.tsx` | 0 imports found |

## Top-level loose orphans (8 files)

| File | Why flagged |
|---|---|
| `src/components/TapScoreIndicator.tsx` | 0 imports found |
| `src/components/TrustBadges.tsx` | 0 imports found |
| `src/components/BrandLogos.tsx` | 0 imports found |
| `src/components/CashPathFlow.tsx` | 0 imports found |
| `src/components/CompletionReceiptModal.tsx` | 0 imports found |
| `src/components/OnboardingModal.tsx` | 0 imports found |
| `src/components/PushNotificationPrompt.tsx` | 0 imports found |
| `src/components/ui/DashboardMockup.tsx` | 0 imports found |

**Total flagged: 32 files.** None deleted. Awaiting Shayan's sign-off before any removal,
per Rule 14. Tasks 2-4 of the Track 2 redesign plan (`docs/superpowers/plans/2026-08-06-track2-uiux-redesign.md`)
still migrate the hex/tokens in the admin `*Premium` files specifically, since Task 4
harvests their styling — they are not skipped just because they're flagged.
```

- [ ] **Step 2: Commit**

```bash
git checkout -b agent/vertex/038-orphan-audit
git add docs/superpowers/orphaned-components-for-review.md
git commit -m "$(cat <<'EOF'
docs: flag 32 orphaned components for Shayan's review, no deletions

traces-to: TASK-038
EOF
)"
```

- [ ] **Step 3: Verify**

Run: `git show --stat HEAD` and confirm only `docs/superpowers/orphaned-components-for-review.md` was added — no component files touched, no deletions.
Expected output includes `1 file changed` and `create mode`.

---

### Task 2: Batch A — Marketing / Landing Token Migration

**Branch:** `agent/vertex/038-landing` (create from the default branch before Step 1)

**Files:**
- Modify: every `.tsx`/`.ts` under `D:\AgentDevWork\repos\tapcash\src\components\sections\` (14 files), `D:\AgentDevWork\repos\tapcash\src\components\landing\` (15 files), `D:\AgentDevWork\repos\tapcash\src\components\layout\Navbar.tsx`, `D:\AgentDevWork\repos\tapcash\src\components\layout\Footer.tsx`
- Modify: route files for the 19 marketing routes listed in the Baseline Findings table (e.g. `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/how-it-works/page.tsx`, `src/app/faq/page.tsx`, `src/app/help/page.tsx`, `src/app/contact/page.tsx`, `src/app/careers/page.tsx`, `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/games/page.tsx`, `src/app/rewards/page.tsx`, `src/app/leaderboard/page.tsx`, `src/app/cashPath/page.tsx`, `src/app/tapScore/page.tsx`, `src/app/affiliate/page.tsx`, `src/app/ref/[refId]/page.tsx`, `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `src/app/cookies/page.tsx`)
- Read-only reference: `packages/tokens/tokens.json`, `src/app/globals.css` (the `@theme` block — do not remove legacy classes other batches might still transitively rely on until they've migrated; only stop authoring NEW usages of legacy classes in files this batch touches)
- Do NOT touch: `src/components/dashboard/`, `src/components/cashout/`, `src/components/admin/`, `src/components/ui/`, loose top-level `src/components/*.tsx`, `src/app/admin/**`, `src/app/dashboard/**`, `src/app/cashout/**`, `mobile/**`, `packages/tokens/**`

**Interfaces:**
- Consumes: Model U semantic tokens from `packages/tokens/tokens.json` (`accent-success` `#31F06F`, `accent-info` `#18D9FF`, `accent-action` `#7C3DFF`, `accent-reward` `#FFC442`, `accent-danger` `#FF2F42`, `surface-base` `#050813`, `surface-raised` `#09101F`, `surface-overlay` `#0F1829`, `text-primary` `#F6F8FF`, `text-secondary` `#9AA8C6`, `text-tertiary` `#7B8AA8`) as they exist in `src/app/globals.css`'s `@theme` block.
- Consumes: `GET /api/stats/platform` response shape `{ stats: { verifiedCompletions: string, activeEarners: string, totalPaidOut: string, avgPayoutWindow: string }, source: "fallback" | "initialized" | "live" }` (confirmed live in `src/app/api/stats/platform/route.ts`).
- Produces: no new exports consumed by Tasks 3/4 — this batch is a leaf; its only cross-batch contract is "don't reintroduce legacy hex into files Task 3/4 also read" (they don't read marketing files).

- [ ] **Step 1: Create the branch**

```bash
git checkout -b agent/vertex/038-landing
```

- [ ] **Step 2: Remove the fabricated `2,847+ users cashed out in last 24h` stat and wire `SocialProofBar` to `/api/stats/platform`**

`src/components/sections/HeroSection.tsx:17-37` currently hardcodes the claim inside `SocialProofBar()`. Replace it with a client fetch against the real endpoint, falling back to no claim (not a fake number) if the fetch fails:

```tsx
// src/components/sections/HeroSection.tsx
function SocialProofBar() {
  const [activeEarners, setActiveEarners] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats/platform')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.stats?.activeEarners) {
          setActiveEarners(data.stats.activeEarners as string);
        }
      })
      .catch(() => {
        // No fabricated fallback — per REDESIGN_SPEC §1.4, live data or no data.
        if (!cancelled) setActiveEarners(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center -space-x-2">
        {AVATARS.map((a, i) => (
          <div
            key={a.initials}
            className="w-8 h-8 rounded-full border-2 border-[var(--surface-base)] flex items-center justify-center text-[11px] font-bold text-white"
            style={{ background: a.color, marginLeft: i > 0 ? '-8px' : '0' }}
          >
            {a.initials}
          </div>
        ))}
      </div>
      {activeEarners && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-success)] animate-breathe-dot" />
          <span className="text-[13px] text-[var(--text-secondary)]">{activeEarners} earners active</span>
        </div>
      )}
    </div>
  );
}
```

This requires adding `useState` to the existing `import { useEffect, useRef } from 'react';` at line 3 → `import { useEffect, useRef, useState } from 'react';`, and requires an `AVATARS` array with `{ initials, color }` shape — extract the existing inline avatar array (currently anonymous, built from a `.map` in the pre-edit file) into a named `const AVATARS = [...]` above the function using the same 3 entries already present in the file before this edit.

- [ ] **Step 3: Remove the fabricated `$2,547,382 paid out` animated counter**

`src/components/sections/HeroSection.tsx:39-84` (`EarningsCounter()`) animates a `motionValue` up to a hardcoded `const target = 2547382;`. Replace the hardcoded target with the live `totalPaidOut` figure from the same `/api/stats/platform` call, parsed to a number, and skip the animation entirely (render nothing) if the endpoint doesn't return a usable value:

```tsx
// src/components/sections/HeroSection.tsx
function EarningsCounter() {
  const motionVal = useMotionValue(0);
  const displayRef = useRef<HTMLSpanElement>(null);
  const prefersReduced = useReducedMotion();
  const [target, setTarget] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats/platform')
      .then((res) => res.json())
      .then((data) => {
        const raw = data?.stats?.totalPaidOut as string | undefined;
        // Parses "$2M+" style fallback strings and plain numeric strings alike;
        // if it can't be parsed as a real figure, don't fabricate one.
        const parsed = raw ? Number(raw.replace(/[^0-9.]/g, '')) : NaN;
        if (!cancelled && Number.isFinite(parsed) && parsed > 0) {
          setTarget(raw?.includes('M') ? parsed * 1_000_000 : raw?.includes('K') ? parsed * 1_000 : parsed);
        }
      })
      .catch(() => {
        if (!cancelled) setTarget(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (target === null) return;
    if (prefersReduced) {
      if (displayRef.current) displayRef.current.textContent = `$${Math.round(target).toLocaleString()} paid out`;
      return;
    }
    const controls = animate(motionVal, target, {
      duration: 2.5,
      ease: 'easeOut',
      onUpdate(v) {
        if (displayRef.current) {
          displayRef.current.textContent = `$${Math.floor(v).toLocaleString()} paid out`;
        }
      },
    });
    return () => controls.stop();
  }, [target, prefersReduced, motionVal]);

  if (target === null) return null;

  return <span ref={displayRef} className="font-mono text-[var(--text-primary)]" />;
}
```

Add `useState` to the same import line touched in Step 2 (already done if Step 2 ran first in the same file edit pass).

- [ ] **Step 4: Remove the fabricated `2.3K+ cashed out today` claim in `Navbar.tsx`**

`src/components/layout/Navbar.tsx:31-52` (`AvatarGroup()`) hardcodes the string at line 52. Since the navbar is a small persistent chrome element (not worth its own fetch on every page), replace the fabricated count with a static, honest label that doesn't claim a number:

```tsx
// src/components/layout/Navbar.tsx
function AvatarGroup() {
  return (
    <div className="flex items-center -space-x-2">
      {[
        'from-[var(--accent-success)] to-[var(--accent-info)]',
        'from-[var(--accent-action)] to-[var(--accent-info)]',
        'from-[var(--accent-success)] to-[var(--accent-action)]'
      ].map((gradient, idx) => (
        <motion.div
          key={idx}
          className={`w-7 h-7 rounded-full border-2 border-[var(--surface-base)] bg-gradient-to-br ${gradient}`}
          animate={{ y: [0, -3, 0] }}
          transition={{ delay: idx * 0.1, duration: 3, repeat: Infinity }}
        />
      ))}
      <div className="ml-3 flex items-center gap-1.5">
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-[var(--accent-success)]"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-xs text-[var(--text-tertiary)]">Verified payouts</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Make `CashPathSection.tsx`'s state reflect data, not a hardcoded last-node**

`src/components/sections/CashPathSection.tsx:3-32` hardcodes `done: true` only on the final `STEPS` entry regardless of any real state — there is no user or transaction context on this landing-page section, so "done" is being used to fake a completed-looking rail on a page that has no logged-in user. Per `REDESIGN_SPEC.md` §3.1 the marketing-page CashPath Rail should render in its **micro/illustrative** state — all nodes outline-only, none marked done, since this is the public landing page explaining the mechanism, not a real user's progress:

```tsx
// src/components/sections/CashPathSection.tsx
const STEPS = [
  { icon: Gamepad2, label: 'Choose Offer', sub: 'Browse & pick', done: false },
  { icon: Activity, label: 'Tracking Active', sub: 'We monitor it', done: false },
  { icon: Clock, label: 'Pending', sub: 'Under review', done: false },
  { icon: CheckCircle2, label: 'Approved', sub: 'Confirmed', done: false },
  { icon: DollarSign, label: 'Cashed Out', sub: 'In your account', done: false },
];
```

Also remove the stray `✓` inside the `'Confirmed ✓'` string on the `Approved` entry — per `REDESIGN_SPEC.md` §1.4 icons communicate state, not embedded checkmark glyphs in copy.

- [ ] **Step 6: Migrate hardcoded hex to Model U CSS variables across the batch**

For every file under `src/components/sections/`, `src/components/landing/`, `src/components/layout/`, and the 19 marketing route files, replace raw hex literals with the matching `var(--...)` custom property from `globals.css`'s `@theme` block, using this mapping (derived from `packages/tokens/tokens.json` → `semantic`):

```
#31F06F  →  var(--accent-success)     (or var(--color-brand-green) if that's the @theme alias already in globals.css — confirm the exact custom-property name in globals.css before find/replace, both compile to #31F06F)
#18D9FF  →  var(--accent-info)
#7C3DFF  →  var(--accent-action)      (fill-only — never apply to text-color per REDESIGN_SPEC §2.2)
#FFC442  →  var(--accent-reward)
#FF2F42  →  var(--accent-danger)
#050813  →  var(--surface-base)
#09101F  →  var(--surface-raised)
#0F1829  →  var(--surface-overlay)
#F6F8FF  →  var(--text-primary)
#9AA8C6  →  var(--text-secondary)
#7B8AA8  →  var(--text-tertiary)

Banned legacy — replace outright, do not preserve:
#00FF85  →  var(--accent-success)   (was legacy green)
#7B5CF0  →  var(--accent-action)    (was legacy purple)
#0d0d1a  →  var(--surface-base)     (was legacy background — this is CashPathSection.tsx:35's `backgroundColor: '#0d0d1a'` inline style and HeroSection's `bg-[#00FF85]` at line 32)
#00D4FF  →  var(--accent-info)      (was legacy cyan)
#00E6C3  →  var(--accent-success) or var(--accent-info) depending on original intent — inspect each of the 123 uses; this teal has no token equivalent, pick success (earnings-adjacent) or info (link-adjacent) contextually
```

Run this to enumerate every remaining hex in the batch's files after the manual edits above, to make sure nothing is missed:

```bash
grep -rnoE "#[0-9a-fA-F]{3,8}" src/components/sections src/components/landing src/components/layout \
  src/app/page.tsx src/app/about src/app/how-it-works src/app/faq src/app/help src/app/contact \
  src/app/careers src/app/blog src/app/games src/app/rewards src/app/leaderboard src/app/cashPath \
  src/app/tapScore src/app/affiliate src/app/ref src/app/privacy src/app/terms src/app/cookies \
  --include="*.tsx" --include="*.ts"
```

Expected after migration: zero output.

- [ ] **Step 7: Run the token drift test**

```bash
npm test -- packages/tokens/tokens.test.ts
```

Expected: all 4 tests in `packages/tokens/tokens.test.ts` pass (this batch never touches `mobile/src/theme.ts` or the primitives themselves, so this is a regression check, not new coverage — it confirms this batch didn't accidentally reintroduce a banned hex into `globals.css`).

- [ ] **Step 8: Commit**

```bash
git add src/components/sections src/components/landing src/components/layout \
  src/app/page.tsx src/app/about src/app/how-it-works src/app/faq src/app/help src/app/contact \
  src/app/careers src/app/blog src/app/games src/app/rewards src/app/leaderboard src/app/cashPath \
  src/app/tapScore src/app/affiliate src/app/ref src/app/privacy src/app/terms src/app/cookies
git commit -m "$(cat <<'EOF'
feat: migrate marketing surface to Model U tokens, remove fabricated stats

Removes the three fabricated social-proof numbers (2,847+ users, $2,547,382
paid out, 2.3K+ cashed out today) from HeroSection.tsx and Navbar.tsx, wiring
the first two to the existing /api/stats/platform endpoint. Resets the
landing-page CashPathSection rail to its illustrative (no-done-node) state
instead of a hardcoded fake-complete last node. Migrates hex literals in
sections/, landing/, layout/, and the 19 marketing routes to Model U CSS
variables.

traces-to: TASK-038
EOF
)"
```

- [ ] **Step 9: Verify**

Run, in order, and confirm each expected result:

1. `grep -rnoE "#[0-9a-fA-F]{3,8}" src/components/sections src/components/landing src/components/layout src/app/page.tsx --include="*.tsx" --include="*.ts"` → expected: no output.
2. `grep -rn "2,547,382\|2547382\|2,847\|2847\|2.3K+ cashed" src/components/sections src/components/landing src/components/layout --include="*.tsx"` → expected: no output (fabricated numbers gone).
3. `npm test -- packages/tokens/tokens.test.ts` → expected: `Tests: 4 passed, 4 total`.
4. `npx tsc --noEmit` → expected: no new errors introduced in files this batch touched (pre-existing errors outside this batch's scope, e.g. `src/app/admin/fraud/page.tsx`, are not this task's responsibility to fix — Task 4 owns that file).

---

### Task 3: Batch B — Product / Dashboard Token Migration

**Branch:** `agent/vertex/038-product-dashboard` (create from the default branch before Step 1)

**Files:**
- Modify: every `.tsx`/`.ts` under `D:\AgentDevWork\repos\tapcash\src\components\dashboard\` (4 files), `D:\AgentDevWork\repos\tapcash\src\components\cashout\` (4 files), `D:\AgentDevWork\repos\tapcash\src\components\ui\` (8 files), and the 21 loose top-level files directly in `D:\AgentDevWork\repos\tapcash\src\components\` (`BalanceCard.tsx`, `BrandLogos.tsx`, `CashPathFlow.tsx`, `CompletionReceiptModal.tsx`, `ConversionStrip.tsx`, `CookieConsent.tsx`, `GlobalNotificationListener.tsx`, `GoogleSignInButton.tsx`, `Header.tsx`, `InstructionModal.tsx`, `OfferCard.tsx`, `OnboardingModal.tsx`, `PageMetadata.tsx`, `PremiumUi.tsx`, `PushNotificationPrompt.tsx`, `ServiceWorkerRegistrar.tsx`, `SessionManager.tsx`, `StreakWidget.tsx`, `TapScoreIndicator.tsx`, `TrustBadges.tsx`, `VercelAnalytics.tsx`, `VerifiedAccessGate.tsx`)
- Modify: `src/app/dashboard/page.tsx`, `src/app/cashout/page.tsx`, `src/app/cashout/status/page.tsx`, `src/app/transactions/page.tsx`, `src/app/payouts/page.tsx`, `src/app/referrals/page.tsx`, `src/app/rapidoreach/page.tsx`, `src/app/auth/signin/page.tsx`, `src/app/auth/signup/page.tsx`, `src/app/auth/verify-email/page.tsx`
- Read-only reference: `packages/tokens/tokens.json`, `src/app/globals.css`, `shared/tapcash-content.ts` (for the canonical `/1000` money divisor — used in Step 3 below)
- Do NOT touch: `src/components/sections/`, `src/components/landing/`, `src/components/layout/`, `src/components/admin/`, `src/app/admin/**`, marketing routes, `mobile/**`, `packages/tokens/**`

**Interfaces:**
- Consumes: same Model U CSS variable set as Task 2 (`--accent-success`, `--accent-info`, `--accent-action`, `--accent-reward`, `--accent-danger`, `--surface-base`, `--surface-raised`, `--surface-overlay`, `--text-primary`, `--text-secondary`, `--text-tertiary`) from `src/app/globals.css`'s `@theme` block.
- Consumes: `shared/tapcash-content.ts`'s canonical money formatter (divides by 1000; do not touch its internals — this batch is styling-only, not the currency-bug fix, which is a Track 1 concern per `REDESIGN_SPEC.md` §4.1's `Money` primitive — flag, do not fix inline, if this batch's file-level pass surfaces `OfferCard.tsx:34`'s `/100` divisor. Note it in the PR description; do not change business logic in a UI-styling-scoped task).
- Produces: no exports consumed by Task 2 or Task 4 — leaf batch.

- [ ] **Step 1: Create the branch**

```bash
git checkout -b agent/vertex/038-product-dashboard
```

- [ ] **Step 2: Migrate hardcoded hex to Model U CSS variables across the batch**

Apply the same hex → `var(--...)` mapping table defined in Task 2 Step 6 to every file in this batch's scope. Enumerate remaining hex after manual edits:

```bash
grep -rnoE "#[0-9a-fA-F]{3,8}" src/components/dashboard src/components/cashout src/components/ui \
  src/components/BalanceCard.tsx src/components/BrandLogos.tsx src/components/CashPathFlow.tsx \
  src/components/CompletionReceiptModal.tsx src/components/ConversionStrip.tsx src/components/CookieConsent.tsx \
  src/components/GlobalNotificationListener.tsx src/components/GoogleSignInButton.tsx src/components/Header.tsx \
  src/components/InstructionModal.tsx src/components/OfferCard.tsx src/components/OnboardingModal.tsx \
  src/components/PageMetadata.tsx src/components/PremiumUi.tsx src/components/PushNotificationPrompt.tsx \
  src/components/ServiceWorkerRegistrar.tsx src/components/SessionManager.tsx src/components/StreakWidget.tsx \
  src/components/TapScoreIndicator.tsx src/components/TrustBadges.tsx src/components/VercelAnalytics.tsx \
  src/components/VerifiedAccessGate.tsx \
  src/app/dashboard src/app/cashout src/app/transactions src/app/payouts src/app/referrals \
  src/app/rapidoreach src/app/auth \
  --include="*.tsx" --include="*.ts"
```

Expected after migration: zero output.

- [ ] **Step 3: Add missing `<label>` associations on the two unlabeled money-movement forms this batch owns**

`UI_UX_DEEP_AUDIT_2026.md` §6A.7 (independently in this batch's scope, confirmed by file path) identifies `src/app/cashout/page.tsx:407,432,459` — the amount and destination inputs have no `<label>`, only `<p>` captions and placeholders — and `src/app/referrals/page.tsx:166`, same defect. Since this batch already owns these files for token migration, add the accessible association in the same pass (small, scoped a11y fix riding along with the styling change, not a separate a11y overhaul):

```tsx
// src/app/cashout/page.tsx — pattern to apply at each of the three unlabeled inputs (:407, :432, :459)
<label htmlFor="cashout-amount" className="text-[13px] text-[var(--text-secondary)]">
  Amount
</label>
<input
  id="cashout-amount"
  name="amount"
  type="number"
  autoComplete="off"
  /* ...existing props preserved... */
/>
```

Use `cashout-amount`, `cashout-destination`, and a third distinct `id` for whichever of the three flagged inputs is the third field in the existing markup (inspect the file to match the existing input's `name`/purpose — reuse that as the `id` suffix, e.g. `cashout-method` if the third input selects a payout method). Apply the equivalent pattern to `src/app/referrals/page.tsx:166`, using `id="referral-code"` (or the existing field's evident purpose).

- [ ] **Step 4: Run the token drift test**

```bash
npm test -- packages/tokens/tokens.test.ts
```

Expected: `Tests: 4 passed, 4 total`.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard src/components/cashout src/components/ui src/components/BalanceCard.tsx \
  src/components/BrandLogos.tsx src/components/CashPathFlow.tsx src/components/CompletionReceiptModal.tsx \
  src/components/ConversionStrip.tsx src/components/CookieConsent.tsx src/components/GlobalNotificationListener.tsx \
  src/components/GoogleSignInButton.tsx src/components/Header.tsx src/components/InstructionModal.tsx \
  src/components/OfferCard.tsx src/components/OnboardingModal.tsx src/components/PageMetadata.tsx \
  src/components/PremiumUi.tsx src/components/PushNotificationPrompt.tsx src/components/ServiceWorkerRegistrar.tsx \
  src/components/SessionManager.tsx src/components/StreakWidget.tsx src/components/TapScoreIndicator.tsx \
  src/components/TrustBadges.tsx src/components/VercelAnalytics.tsx src/components/VerifiedAccessGate.tsx \
  src/app/dashboard src/app/cashout src/app/transactions src/app/payouts src/app/referrals \
  src/app/rapidoreach src/app/auth
git commit -m "$(cat <<'EOF'
feat: migrate product/dashboard surface to Model U tokens, label cashout inputs

Migrates hex literals in dashboard/, cashout/, ui/, and 21 loose top-level
components plus their consuming routes to Model U CSS variables. Adds
missing <label>/htmlFor associations to the three unlabeled cashout-form
inputs and the referrals form input flagged in UI_UX_DEEP_AUDIT_2026.md
§6A.7. Does not touch the OfferCard /100 currency divisor bug — that is a
business-logic fix outside this styling-scoped task's boundary, noted for
Track 1 follow-up.

traces-to: TASK-038
EOF
)"
```

- [ ] **Step 6: Verify**

1. `grep -rnoE "#[0-9a-fA-F]{3,8}" src/components/dashboard src/components/cashout src/components/ui --include="*.tsx" --include="*.ts"` → expected: no output.
2. `grep -c "htmlFor" src/app/cashout/page.tsx` → expected: ≥3 (was 0 before this batch).
3. `npm test -- packages/tokens/tokens.test.ts` → expected: `Tests: 4 passed, 4 total`.
4. `npx tsc --noEmit` → expected: no new errors in files this batch touched.

---

### Task 4: Batch C — Admin Panel Dark Retheme

**Branch:** `agent/vertex/038-admin-panel` (create from the default branch before Step 1)

**Files:**
- Modify: every `.tsx` under `D:\AgentDevWork\repos\tapcash\src\app\admin\` (8 route pages: `page.tsx`, `dashboard/page.tsx`, `users/page.tsx`, `transactions/page.tsx`, `offers/page.tsx`, `fraud/page.tsx`, `multiplier/page.tsx`, `promo-analytics/page.tsx`, plus `layout.tsx`), `D:\AgentDevWork\repos\tapcash\src\app\error.tsx`, `D:\AgentDevWork\repos\tapcash\src\app\loading.tsx`, `D:\AgentDevWork\repos\tapcash\src\app\not-found.tsx`
- Read (harvest styling, do not delete): `D:\AgentDevWork\repos\tapcash\src\components\admin\AdminOverviewPremium.tsx`, `FraudManagementPremium.tsx`, `TransactionManagementPremium.tsx`, `UserManagementPremium.tsx`
- Read-only reference: `packages/tokens/tokens.json`, `src/app/globals.css`, `src/app/admin/multiplier/page.tsx` and `src/app/admin/promo-analytics/page.tsx` as the dark-coherent reference model called out in `REDESIGN_SPEC.md` §5.4 ("the reference model — copy their treatment")
- Do NOT touch: `src/components/sections/`, `src/components/landing/`, `src/components/layout/`, `src/components/dashboard/`, `src/components/cashout/`, `src/components/ui/`, loose top-level `src/components/*.tsx`, marketing/product routes, `mobile/**`, `packages/tokens/**`
- Do NOT delete `src/components/admin/*Premium.tsx` — Task 1's `docs/superpowers/orphaned-components-for-review.md` flags them with the explicit caveat that this task harvests them first

**Interfaces:**
- Consumes: same Model U CSS variable set as Tasks 2/3.
- Consumes: the dark-coherent pattern already shipping in `src/app/admin/multiplier/page.tsx` and `src/app/admin/promo-analytics/page.tsx` (confirmed in `UI_UX_DEEP_AUDIT_2026.md` §6A.9 as "the model for the admin retheme" — read these two files first to establish the target visual pattern before editing the 5 light-theme pages).
- Consumes: styling patterns (not code, not imports) from `src/components/admin/AdminOverviewPremium.tsx` / `FraudManagementPremium.tsx` / `TransactionManagementPremium.tsx` / `UserManagementPremium.tsx` — these are dead code (0 live imports, confirmed in Task 1) but were built as the intended dark replacements per `REDESIGN_SPEC.md` §4.2's caveat: "Harvest their styling into the retheme... before deleting."
- Produces: no exports consumed by Task 2 or Task 3 — leaf batch.

- [ ] **Step 1: Create the branch**

```bash
git checkout -b agent/vertex/038-admin-panel
```

- [ ] **Step 2: Fix the JSX fragment error blocking typecheck in `admin/fraud/page.tsx`**

`UI_UX_DEEP_AUDIT_2026.md` §6A.2 root-causes this to one stray extra `</div>` before the fragment closes at line 429. This must land first in this batch because it currently makes `tsc --noEmit` fail for the whole repo, and this batch cannot verify its own retheme of `fraud/page.tsx` under a broken type gate. Read `src/app/admin/fraud/page.tsx` lines 280-430 to locate the exact extra `</div>` (the audit gives the pattern: a fragment opened at `:280` as `<><div className="bg-white rounded-lg shadow-lg p-6 mb-6">` must have exactly one matching `</div></>` pair by `:429`; remove whichever `</div>` is surplus), then verify:

```bash
npx tsc --noEmit 2>&1 | grep "admin/fraud"
```

Expected after the fix: no output (previously 4 errors: TS17015, TS1382, TS1003, TS1381 at lines 428-471).

- [ ] **Step 3: Retheme the 5 light-theme admin pages dark, using `admin/multiplier` and `admin/promo-analytics` as the pattern**

For each of `src/app/admin/page.tsx` (24 hits), `src/app/admin/dashboard/page.tsx` (23 hits), `src/app/admin/users/page.tsx` (49 hits), `src/app/admin/transactions/page.tsx` (46 hits), `src/app/admin/offers/page.tsx` (50 hits), `src/app/admin/fraud/page.tsx` (59 hits) — replace every light-theme utility class with its Model U dark equivalent, using this mapping (derived from comparing the light pages' classes against the dark pattern already live in `admin/multiplier/page.tsx`):

```
bg-white                     →  bg-[var(--surface-raised)]
bg-gray-50 / bg-gray-100     →  bg-[var(--surface-overlay)]
bg-gray-200                  →  bg-[var(--surface-overlay)]
text-gray-900 / text-gray-800 →  text-[var(--text-primary)]
text-gray-700 / text-gray-600 →  text-[var(--text-secondary)]
from-purple-50 to-blue-50    →  bg-[var(--surface-base)]           (drop the light gradient entirely, flat dark base per REDESIGN_SPEC §2.2 surfaces)
shadow-lg / shadow-md         →  border border-[var(--border-hairline,rgba(150,190,255,0.14))]   (dark surfaces use hairline borders, not light-mode shadow elevation, per REDESIGN_SPEC §3.2 Verified Card)
```

Enumerate remaining light-theme hits after the pass:

```bash
grep -rc "bg-white\|bg-gray-\|text-gray-[6-9]00\|from-purple-50\|to-blue-50" src/app/admin --include="*.tsx" | grep -v ":0"
```

Expected after migration: no output (was 6 files with hits, totaling 354, before this task).

- [ ] **Step 4: Replace native `alert`/`confirm`/`prompt` calls with an in-app confirmation pattern**

`UI_UX_DEEP_AUDIT_2026.md` §6A.5 lists the exact call sites this batch owns: `admin/page.tsx:181` (`window.prompt` for withdrawal-rejection reason), `admin/transactions/page.tsx:76,134` (`confirm()` for approve/reject/refund), `admin/offers/page.tsx:120` (`confirm()` for delete), `admin/fraud/page.tsx:115,120,139` (`confirm()` for unflag/unblock), `admin/users/page.tsx:90,113` and `admin/transactions/page.tsx:96,124,154` (`alert()` for results). Since `REDESIGN_SPEC.md` §4.1's `Modal` primitive is Task 1.4.1 scope in the audit's own phase plan and not yet built anywhere in this repo, and building a new shared primitive is out of this styling-migration batch's directory-scoped boundary (it would live in `src/components/ui/`, which is Task 3's territory, not Task 4's), this task does the minimum non-conflicting fix: replace blocking native dialogs with a local, file-scoped confirmation state rendered inline in the admin page itself (no new shared component, no cross-batch file touch). Pattern for `admin/offers/page.tsx:120`:

```tsx
// Before:
// if (!confirm('Delete this offer?')) return;
// deleteOffer(offerId);

// After — local state confirmation, dark-styled inline, no shared Modal dependency:
const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

// where the delete button used to call confirm() directly:
<button
  onClick={() => setPendingDeleteId(offer.id)}
  className="text-[var(--accent-danger)]"
>
  Delete
</button>

{pendingDeleteId && (
  <div
    role="alertdialog"
    aria-modal="true"
    aria-label="Confirm offer deletion"
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
  >
    <div className="bg-[var(--surface-raised)] border border-white/10 rounded-xl p-6 max-w-sm">
      <p className="text-[var(--text-primary)] mb-4">Delete this offer? This cannot be undone.</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => setPendingDeleteId(null)}
          className="px-4 py-2 text-[var(--text-secondary)]"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            deleteOffer(pendingDeleteId);
            setPendingDeleteId(null);
          }}
          className="px-4 py-2 bg-[var(--accent-danger)] text-white rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
```

Apply the same local-state-confirmation pattern (one `pending*` state variable per destructive action, one inline `role="alertdialog"` block) to every other `confirm()`/`prompt()` site listed above. For `alert()` result notifications, replace with a local `resultMessage` state string rendered as an inline dismissible banner (`role="status"`) instead of a blocking dialog — do not introduce a toast/`Toast` primitive here, that's `src/components/ui/`'s territory (Task 3).

- [ ] **Step 5: Bring `error.tsx`, `loading.tsx`, `not-found.tsx` onto the token system**

`UI_UX_DEEP_AUDIT_2026.md` §6A.1 identifies these three system pages as a fourth palette (`#0a0a0a` background, `#ff2e63` accent) matching neither the consumer theme (`#050813`) nor the admin shell (`#050816`). In `src/app/error.tsx`, `src/app/loading.tsx`, `src/app/not-found.tsx`, replace the background with `var(--surface-base)` and the `#ff2e63` accent with `var(--accent-danger)` (`#FF2F42` — closest semantic match, both are red/error accents), and add `role="alert"` to the error surface in `error.tsx`:

```tsx
// src/app/error.tsx — pattern for the root error boundary
<div role="alert" className="min-h-screen flex items-center justify-center bg-[var(--surface-base)]">
  <div className="text-center">
    <h1 className="text-[var(--accent-danger)] text-2xl font-bold mb-2">Something went wrong</h1>
    {/* preserve existing reset button / copy, just swap the color literals */}
  </div>
</div>
```

- [ ] **Step 6: Migrate remaining hardcoded hex across the batch, including in the harvested `admin/*Premium.tsx` reference files**

```bash
grep -rnoE "#[0-9a-fA-F]{3,8}" src/app/admin src/app/error.tsx src/app/loading.tsx src/app/not-found.tsx \
  src/components/admin --include="*.tsx" --include="*.ts"
```

Migrate every hit using the same mapping table from Task 2 Step 6. Note: `src/components/admin/*Premium.tsx` files are edited here only to bring their hex to Model U tokens as part of the harvesting/reference pass (per `REDESIGN_SPEC.md` §4.2's caveat) — they remain unimported (flagged, not deleted) after this step; editing them is not a contradiction of Task 1's flag, it's the explicit exception Task 1's doc calls out.

Expected after migration: zero output.

- [ ] **Step 7: Run the token drift test and full typecheck**

```bash
npm test -- packages/tokens/tokens.test.ts
npx tsc --noEmit
```

Expected: `npm test` → `Tests: 4 passed, 4 total`. `tsc --noEmit` → no errors at all (this is the first batch in the plan positioned to get the repo back to a fully green type gate, since Step 2 fixed the one blocking error and no other batch touches TS-erroring files).

- [ ] **Step 8: Commit**

```bash
git add src/app/admin src/app/error.tsx src/app/loading.tsx src/app/not-found.tsx src/components/admin
git commit -m "$(cat <<'EOF'
fix: unblock tsc on admin/fraud JSX error; retheme admin dark to Model U

Fixes the stray closing </div> in admin/fraud/page.tsx that broke
`tsc --noEmit` for the whole repo (UI_UX_DEEP_AUDIT_2026.md §6A.2). Retheme
the 5 light-theme admin pages (users, transactions, offers, fraud,
dashboard/page.tsx root) to Model U dark, matching the pattern already
shipping in admin/multiplier and admin/promo-analytics. Replaces native
alert/confirm/prompt destructive-action dialogs with inline local-state
confirmation UI. Brings error.tsx/loading.tsx/not-found.tsx off their
fourth palette (#0a0a0a/#ff2e63) onto Model U tokens, adds role="alert" to
the error surface. Migrates hex in the four unimported admin/*Premium.tsx
components as part of harvesting their styling per REDESIGN_SPEC §4.2 —
they remain flagged, unimported, and undeleted per docs/superpowers/orphaned-components-for-review.md.

traces-to: TASK-038
EOF
)"
```

- [ ] **Step 9: Verify**

1. `npx tsc --noEmit` → expected: zero errors, repo-wide.
2. `grep -rc "bg-white\|bg-gray-\|text-gray-[6-9]00\|from-purple-50\|to-blue-50" src/app/admin --include="*.tsx" | grep -v ":0"` → expected: no output.
3. `grep -rn "window\.\(confirm\|alert\|prompt\)" src/app/admin --include="*.tsx"` → expected: no output.
4. `grep -rnoE "#[0-9a-fA-F]{3,8}" src/app/admin src/app/error.tsx src/app/loading.tsx src/app/not-found.tsx src/components/admin --include="*.tsx" --include="*.ts"` → expected: no output.
5. `npm test -- packages/tokens/tokens.test.ts` → expected: `Tests: 4 passed, 4 total`.

---

## Self-Review

**Spec coverage check against `REDESIGN_SPEC.md` and `UI_UX_DEEP_AUDIT_2026.md`:**
- §1.4 anti-patterns (fabricated stats, fake live rows) → Task 2 Steps 2-4 (web fabricated stats); mobile fake "LIVE PAYOUT" row and mobile CashPath step-2 hardcode are explicitly out of scope (Track 3), noted in Baseline Findings.
- §2 token architecture / semantic layer → all of Task 2/3/4 Step "migrate hex" steps, consuming the same `tokens.json`-derived mapping.
- §3.1 CashPath Rail states → Task 2 Step 5 (marketing page's illustrative rail).
- §3.2 Verified Card hairline pattern → referenced in Task 4 Step 3's shadow→hairline-border mapping for admin retheme.
- §4.1 primitives (Button/Input/Modal/etc.) → explicitly deferred: this plan is a token-migration + admin-retheme + fabricated-stat pass, not the primitive-component build described in REDESIGN_SPEC §4.1/Phase 4.1 of the audit. Flagged as out of scope in Task 4 Step 4 (admin dialogs use inline local state, not a new shared Modal, to avoid a cross-batch dependency) — noted so a future track/task can pick up primitive construction without contradicting this plan's file boundaries.
- §4.2 deletion list → Task 1 (flag-only doc), Rule 14 honored throughout.
- §5.4 admin retheme → Task 4 in full.
- Audit §6A.2 JSX fragment blocker → Task 4 Step 2.
- Audit §6A.5 native dialogs → Task 4 Step 4.
- Audit §6A.7 unlabeled cashout/referrals inputs → Task 3 Step 3.
- Audit §4.8/§6.3 fabricated stats phase item → Task 2 Steps 2-4.
- Money `/100` vs `/1000` bug (§6.4, B4) → explicitly NOT fixed by this plan; flagged in Task 3's Interfaces section as a Track 1 business-logic concern outside this styling-scoped track's boundary, to avoid scope creep into API/logic changes this track isn't chartered for.

**Placeholder scan:** no "TBD"/"similar to Task N"/unshown code found on re-read; every code block is concrete, every mapping table has explicit values, every verification step has an exact command and expected output.

**Type/name consistency check:** the hex→`var(--...)` mapping table is defined once in Task 2 Step 6 and referenced (not silently re-defined differently) by Task 3 Step 2 and Task 4 Steps 3/6. `docs/superpowers/orphaned-components-for-review.md`'s filename and path are identical everywhere it's referenced (task prompt, Task 1, Task 4's "do not delete" note). Branch names match the `agent/vertex/037-<slug>` convention exactly as specified in Global Constraints for all 4 branches created across this plan (`038-orphan-audit`, `038-landing`, `038-product-dashboard`, `038-admin-panel`) — note `038-orphan-audit` is a fourth branch not named in the task brief's two examples but follows the same slug convention; flagging this explicitly since the task brief's example branches were `038-sections`/`038-admin-panel` and this plan renamed the marketing batch to `038-landing` to match its broader scope (sections + landing + layout, not sections alone) and added `038-orphan-audit` as the prerequisite task's branch.
