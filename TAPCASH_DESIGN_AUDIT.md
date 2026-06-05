# TapCash Next.js — Premium Dark Fintech Design System Audit & Implementation Plan
# Base: commit aa74e85 | Design reference: tapcash-ui-ux-front-end/tapcash-model-u/src/sections & src/pages
#
# SCOPE: All non-auth user-facing pages under src/app/
#   INCLUDED:  page, landing, dashboard, cashPath, tapScore, rapidoreach,
#              cashout, cashout/status, payouts, transactions, referrals,
#              ref/[refId], admin, affiliate, privacy, terms, cookies
#   EXCLUDED:  auth/signin, auth/signup, auth/verify-email, error.tsx,
#              loading.tsx, not-found.tsx, favicon.ico, robots.ts, sitemap.ts
#
# DESIGN SYSTEM REFERENCE MAPPING (Model-U sections → TapCash page)
#   Model-U Section           Design System Mapping
#   ─────────────────────     ────────────────────────────────────────────────────
#   Hero                      Landing page hero (§1 of page.tsx)
#   Offers                    Dashboard featured offers + Landing Top Offers
#   CashPath                 cashPath/page.tsx (entire page)
#   TapScore Sections         tapScore/page.tsx (entire page)
#   AppPreview                rapidoreach/page.tsx (iframe shell)
#   TrustStrip                Footer CTA / trust grid on landing
#   index (no named section)  Payouts guide page
#   (Pages index)             All standalone pages not covered above

# ══════════════════════════════════════════════════════════════════════════════════
# FILE 1 : src/app/page.tsx  [LANDING — ALIASES src/app/landing/page.tsx]
# ══════════════════════════════════════════════════════════════════════════════════
# Model-U Section:  Hero + Offers + CashPath + AppPreview + TrustStrip + CTA
# Tech Debt:        NONE — this file is fully styled and imports all helpers.
#                   Consistent bg #050813, white/[0.03]–[0.04] glass cards,
#                   #18d9ff primary CTA, accentClass for offer rings,
#                   MotionWrap/PageShell on every section.
# Action:          NO CHANGES NEEDED — page acts as the design-system reference.

# ══════════════════════════════════════════════════════════════════════════════════
# FILE 2 : src/app/landing/page.tsx
# ══════════════════════════════════════════════════════════════════════════════════
# Model-U Section:  (re-exports ../page.tsx)
# Action:          NO CHANGES NEEDED.

# ══════════════════════════════════════════════════════════════════════════════════
# FILE 3 : src/app/dashboard/page.tsx
# ══════════════════════════════════════════════════════════════════════════════════
# Model-U Section:  Offers (featured) + Leaderboard PageShell + Activity PageShell
# Tech Debt:        MINOR — two inline hardcoded stat arrays on lines 196-201,
#                   bg #040913 is one shade darker than the design system base.
#                   Trust strip uses StatCard (premium helper) correctly.
#                   accentClass and CTAButton are both imported.
# Action:          MINOR ONLY.
#   1. Line 128/139: Change `bg-[#040913]` → `bg-[#050816]` (two occurrences)
#   2. Consider extracting the header stat array (lines 196-201) into
#      tapCashStats or accept it as contextual dashboard data. Either is fine.

# ══════════════════════════════════════════════════════════════════════════════════
# FILE 4 : src/app/cashPath/page.tsx
# ══════════════════════════════════════════════════════════════════════════════════
# Model-U Section:  CashPath.jsx (full-page adaptation)
# Tech Debt:        HIGH — significant divergence from design system conventions.
#       • HARDCODED steps array (lines 9-13) — should import tapCashSteps.
#       • bg #050816 is correct, BUT #050813 is the canonical base.
#       • Missing PageShell / MotionWrap wrappers on section title block.
#       • Steps cards lack accentClass badge; step id text uses hardcoded #18D9FF
#         instead of the palette token (#18d9ff / #8cf8e9).
#       • CTA link: bg-[#00e6c3] color mismatch — primary CTA should be
#         bg-[#00e6c3] with text-[#04101d] (these are correct for CTAButton
#         primary, but this page uses a raw <Link>, not CTAButton).
#       • No ambient gradient or glow on the background.
# Action:          REFACTOR to full Model-U spec.
#   1. Replace lines 9-13 with: `import { tapCashSteps } from "@shared/tapcash-content"`
#   2. Line 18/19/77: Change `bg-[#050816]` → `bg-[#050813]` (3 locations)
#   3. Wrap the title block (lines 27-33) in <PageShell> or a MotionWrap with
#      consistent spacing and a ≥clamp text scale (md:text-5xl).
#   4. Step cards (lines 37-46): add accentClass badge for the step number,
#      use `text-[#8cf8e9]` (not `#18D9FF`), and add hover elevation glue.
#   5. CTA (lines 50-57): replace raw <Link> with <CTAButton href=... label=... />
#      from PremiumUi.
#   6. Add a subtle `bg-[radial-gradient(...)]` decorative layer inside <main>.

# ══════════════════════════════════════════════════════════════════════════════════
# FILE 5 : src/app/tapScore/page.tsx
# ══════════════════════════════════════════════════════════════════════════════════
# Model-U Section:  TapScore.jsx (full-page adaptation)
# Tech Debt:        HIGH — underdeveloped page, minimal styling.
#       • Hardcoded all content inline; no tapCashTrustPoints import.
#       • bg #050816 → should be #050813.
#       • Only one MotionWrap at top; nothing else animated/wrapped.
#       • CTA uses raw <Link> with bg-[#00e6c3].
#       • Single panel (lines 28-41) is a bare card — missing PageShell,
#         StatCard grid, or any trust-point list.
#       • "Open Offerwall" link on line 44: /offers does not exist —
#         should be /rapidoreach (broken link).
# Action:          REWRITE to match Model-U AppPreview pattern.
#   1. Import MotionWrap, PageShell, StatCard, CTAButton from "@/components/PremiumUi"
#   2. Import tapCashTrustPoints from "@shared/tapcash-content"
#   3. Change `bg-[#050816]` → `bg-[#050813]` (2 occurrences)
#   4. Wrap title block (lines 21-26) in <PageShell eyebrow="TapScore™"
#      title="Know the safest offers before you start."
#      description="Rank safer offers faster." />
#   5. Add 3-up StatCard grid: Trust signals / Avg payout / Risk score.
#   6. Render tapCashTrustPoints as a 3-column list or badge grid below.
#   7. Fix link `href="/offers"` → `href="/rapidoreach"` (line 44).
#   8. Replace raw CTA Link with <CTAButton href="/rapidoreach" label="Open offerwall" />
#   9. Add background radial gradient decoration within <main>.

# ══════════════════════════════════════════════════════════════════════════════════
# FILE 6 : src/app/rapidoreach/page.tsx
# ══════════════════════════════════════════════════════════════════════════════════
# Model-U Section:  AppPreview + TrustStrip
# Tech Debt:        MEDIUM — mostly styled but diverges in minor ways.
#       • bg #040913 on lines 68 and 176 — should be #050813 (main) or
#         the glass gradient used elsewhere for the shell.
#       • Hardcoded trustPoints array (lines 61-65) — not yet in tapcash-content.
#       • PageShell on line 109 is correct; StatCard grid is correct.
#       • Iframe container (line 118-176) uses one-off gradient class inline;
#         should use .tap-shell glass utility.
#       • Border color on iframe wrapper uses `border-white/8` — correct.
# Action:          MINOR CLEANUP.
#   1. Change line 68 bg `#040913` → `#050813`.
#   2. line 176 iframe bg `bg-[#040913]` → `bg-[#050816]` (iframe interior is OK).
#   3. Change line 118 wrapper class to use `tap-shell` utility class from globals.css.
#   4. Extract trustPoints (lines 61-65) to tapcash-content.ts.

# ══════════════════════════════════════════════════════════════════════════════════
# FILE 7 : src/app/cashout/page.tsx
# ══════════════════════════════════════════════════════════════════════════════════
# Model-U Section:  Payout method grid (mirrors Model-U payout card pattern)
# Tech Debt:        LOW — already well-styled with accentClass and glass cards.
#       • bg #040913 on lines 73 and 102 — should be #050813 for consistency.
#       • Inline radial gradient on hero panel (line 107) — fine, but could
#         leverage `.tap-shell` class.
#       • CTAButton uses transition without duration — fine, functional.
# Action:          TWO-LINE FIX.
#   1. Lines 73 and 102: `bg-[#040913]` → `bg-[#050813]`.

# ══════════════════════════════════════════════════════════════════════════════════
# FILE 8 : src/app/cashout/status/page.tsx
# ══════════════════════════════════════════════════════════════════════════════════
# Model-U Section:  Status timeline (unique — no direct Model-U template)
# Tech Debt:        MEDIUM.
#       • bg #050816 (line 68) — should be #050813.
#       • Inline CSS-in-JS style props for STATUS_META colors — acceptable
#         but formalize into a tapCashStatusMeta export in tapcash-content.ts.
#       • `border-zinc-900` on several elements — should be border-white/6 or
#         border-white/8 for consistency.
#       • Missing PageShell wrapper; heading area (lines 71-79) is bare.
#       • Expand-btn (motion.button) lacks MotionWrap.
#       • Empty state uses bg-white/[0.02] instead of bg-white/[0.03].
# Action:          MEDIUM REFACTOR.
#   1. bg #050816 → bg-#050813.
#   2. Replace any `border-zinc-900` with `border-white/6`.
#   3. Wrap heading (lines 71-79) in <MotionWrap> + PageShell or align with
#      the glass card used elsewhere.
#   4. Extract STATUS_META to tapcash-content.ts as `payoutStatusMeta`.
#   5. Replace bg-white/[0.02] on empty state card with bg-white/[0.03].
#   6. Wrap expandable iframe button in MotionWrap for consistent entrance.

# ══════════════════════════════════════════════════════════════════════════════════
# FILE 9 : src/app/payouts/page.tsx
# ══════════════════════════════════════════════════════════════════════════════════
# Model-U Section:  Payout guide (informational storefront page)
# Tech Debt:        LOW — well-structured with PageShell and accentClass.
#       • bg #040913 on line 23 — should be #050813.
#       • Otherwise aligned with design system.
# Action:          ONE-LINE FIX.
#   1. Line 23: `bg-[#040913]` → `bg-[#050813]`.

# ══════════════════════════════════════════════════════════════════════════════════
# FILE 10 : src/app/transactions/page.tsx
# ══════════════════════════════════════════════════════════════════════════════════
# Model-U Section:  Ledger timeline (similar to Dashboard transaction list)
# Tech Debt:        LOW — already uses PageShell, CTAButton, StatCard, MotionWrap.
#       • bg #040913 on lines 62 and 72 — should be #050813.
#       • Otherwise consistent.
# Action:          TWO-LINE FIX.
#   1. Lines 62 and 72: `bg-[#040913]` → `bg-[#050813]`.

# ══════════════════════════════════════════════════════════════════════════════════
# FILE 11 : src/app/referrals/page.tsx
# ══════════════════════════════════════════════════════════════════════════════════
# Model-U Section:  Referral growth page (no direct Model-U equivalent)
# Tech Debt:        HIGH — largest color/style outlier.
#       • bg #060606 (lines 69, 77, 107) — entirely wrong shade; use #050813.
#       • ConversionStrip and legal-section style patterns use `bg-zinc-950/30
#         border border-zinc-900 rounded-3xl` — should be glass classes:
#         `bg-white/[0.03] border border-white/6 rounded-[2rem]`.
#       • border-zinc-900 used extensively — all → border-white/6.
#       • Input field uses `border-zinc-800` — → `border-white/8`.
#       • text-zinc-500 used for secondary copy — upgrade to text-zinc-400.
#       • No MotionWrap or PageShell wrappers at all.
#       • Stat cards (lines 242-265) use `bg-zinc-950/60 border-zinc-900` —
#         convert to glass-panel / tap-card class.
#       • Uses inline hover:scale-* transitions that aren't in the design system.
#       • Status badge colors (blue-500/emerald-500) use Tailwind defaults,
#         not the brand tokens.
# Action:          FULL REFACTOR.
#   1. All `#060606` → `#050813`.
#   2. All `border-zinc-900` → `border-white/6`.
#   3. Wrap <main> inner sections with MotionWrap.
#   4. Replace inline card panel styles with .glass-panel / .tap-card utilities.
#   5. Replace `border-zinc-800` input with `border-white/8`.
#   6. Use .tap-shell utility for any gradient hero panels.
#   7. Replace blue-500/emerald-500 with #3a7bff / #00e6c3 brand colors.
#   8. Remove hover:scale-* (not in Model-U); substitute with border-color rise.

# ══════════════════════════════════════════════════════════════════════════════════
# FILE 12 : src/app/ref/[refId]/page.tsx
# ══════════════════════════════════════════════════════════════════════════════════
# Model-U Section:  Referral landing (unique)
# Tech Debt:        MEDIUM-HIGH — many inline styles and hardcoded colors.
#       • bg #050816 → should be #050813.
#       • Inline style={{ background, borderColor }} on invite card (lines 76-78)
#         — should use accentClass utility or a reusable vip-*-tier class.
#       • Inline background accent (line 56-59) for ambient glow — OK but
#         should use a framework-supplied decorative gradient layer.
#       • Hardcoded tier COLORS in getTierColor() — move to tapcash-content.ts.
#       • Card uses glass-like values but hardcoded: `#080c1a` and `#070c1a`
#         — replace with white/[0.03] and white/[0.035].
# Action:          REFACTOR.
#   1. `bg-[#050816]` → `bg-[#050813]` (line 54).
#   2. Move getTierColor() to tapcash-content.ts as `vipTierColor(tier)`.
#   3. Replace inline accent-card styles with `.vip-gold`, `.vip-diamond`, etc.
#   4. Replace `#080c1a` background on invite card with `bg-white/[0.035]`.
#   5. Standardize text colors: any `text-zinc-5xx` → nearest Model-U equivalent.

# ══════════════════════════════════════════════════════════════════════════════════
# FILE 13 : src/app/admin/page.tsx
# ══════════════════════════════════════════════════════════════════════════════════
# Model-U Section:  Admin command center (unique)
# Tech Debt:        HIGH — biggest style outlier, uses admin-only palette.
#       • bg #0a0a0a on root — use #050813 for full consistency.
#       • bg #060606 not present; uses `#07101b`, `#080808` — unify to glass.
#       • border-zinc-900 used in tables/cards — → border-white/6.
#       • border-emerald-500/20 on badge — ✓ acceptable, uses brand tokens.
#       • `animate-in slide-in-from-top-4` classes (lines 319, 327, 406) —
#         not standard CSS; confirm in globals.css or replace with MotionWrap.
#       • Tabs (lines 303-315): bg-zinc-950 border-zinc-900 — → tap-badge classes.
#       • Uses many `inline-flex rounded-2xl border bg-zinc-950` patterns
#         instead of .glass-panel / .tap-card.
#       • Inline gradient button (lines 248-252) — extract to CTAButton with
#         a new `accent` variant or add `gradient` prop to CTAButton.
#       • Date "May 22, 2026" hardcoded — add to tapcash-content.ts.
# Action:          FULL REFACTOR.
#   1. All `#0a0a0a`, `#060606`, `#07101b` → `#050813` + glass overlays.
#   2. All `border-zinc-900` → `border-white/6`, `border-white/8` as appropriate.
#   3. Replace .animate-* usages with MotionWrap or verify they exist in CSS.
#   4. Tab container: replace with MotionWrap perimeter + .tap-badge active state.
#   5. CTAButton → add gradient variant (from-[#00e6c3] to-[#3a7bff]).

# ══════════════════════════════════════════════════════════════════════════════════
# FILE 14 : src/app/admin/layout.tsx
# ══════════════════════════════════════════════════════════════════════════════════
# Model-U Section:  Admin loader guard
# Tech Debt:        LOW-MEDIUM.
#       • Loader uses `border-blue-500` (line 49) — brand token is #3a7bff.
#       • Background has no explicit bg — inherits body #050816; add bg-[#050813].
# Action:          MINOR.
#   1. line 49: `border-blue-500` → `border-[#3a7bff]`.
#   2. Add `min-h-screen bg-[#050813]` to the wrapper div (lines 48, 54).

# ══════════════════════════════════════════════════════════════════════════════════
# FILE 15 : src/app/affiliate/page.tsx
# ══════════════════════════════════════════════════════════════════════════════════
# Model-U Section:  Affiliate policy (unique)
# Tech Debt:        HIGH — uses full legal-section pattern.
#       • Same pattern as privacy/terms — full refactor applies here too.
#       • bg #060606 (line 102) → #050813.
#       • All `border-zinc-900` → `border-white/6`.
#       • Badge (line 181) uses emerald-500/10 + animate-pulse — ✓ fine.
#       • Legal section list uses `bg-zinc-950/30 border border-zinc-900` —
#         replace with glass-panel / tap-card.
#       • Footer `border-zinc-900 bg-[#080808]` → `border-white/6 bg-[#050813]`.
#       • "May 22, 2026" hardcoded again — deduplicate in tapcash-content.ts.
#   1. All `#060606` → `#050813`.
#   2. All `border-zinc-900` → `border-white/6`.
#   3. Section wrapper: `bg-zinc-950/30 border-zinc-900 rounded-3xl` →
#       `glass-panel rounded-[2rem]`.
#   4. Footer: `border-t border-zinc-900 bg-[#080808]` → `border-t border-white/6 bg-[#050816]`.
#   5. Deduplicate `lastUpdated` constant to tapcash-content.ts.
#   6. Outline: Convert section headers (lines 219-237) from amber/emerald
#       to consistent white/[0.06] + #8cf8e9 icon container.

# ══════════════════════════════════════════════════════════════════════════════════
# FILE 16 : src/app/privacy/page.tsx
# ══════════════════════════════════════════════════════════════════════════════════
# Model-U Section:  Legal section (unique)
# Tech Debt:        HIGH — same pattern as terms and affiliate.
#       • bg #060606 (line 144) → #050813.
#       • All `border-zinc-900` → `border-white/6`.
#       • `bg-zinc-950/30` on section containers → `glass-panel rounded-[2rem]`.
#       • `bg-emerald-950/10 border-emerald-500/10` notice banner →
#         consider `bg-[#00e6c3]/[0.03] border-[#00e6c3]/10`.
#       • Footer `border-zinc-900 bg-[#080808]` → `border-white/6 bg-[#050816]`.
#       • Hardcoded lastUpdated string — deduplicate.
# Action:          FULL REFACTOR (same as affiliate/terms).
#   1. All `#060606` → `#050813`.
#   2. All `border-zinc-900` → `border-white/6`.
#   3. Section wrapper refactor.
#   4. Notice banner color normalization.
#   5. Footer color update.
#   6. lastUpdated → tapcash-content.ts.

# ══════════════════════════════════════════════════════════════════════════════════
# FILE 17 : src/app/terms/page.tsx
# ══════════════════════════════════════════════════════════════════════════════════
# Model-U Section:  Legal policy (unique)
# Tech Debt:        SAME as privacy and affiliate.
# Action:          FULL REFACTOR (same set of 6 steps as privacy & affiliate).

# ══════════════════════════════════════════════════════════════════════════════════
# FILE 18 : src/app/cookies/page.tsx
# ══════════════════════════════════════════════════════════════════════════════════
# Model-U Section:  Cookie policy (unique)
# Tech Debt:        SAME blend of high consistency debt.
#       • bg #060606 (line 154) → #050813.
#       • `border-zinc-900` freqently used in cookie tables.
#       • `bg-zinc-950/20 backdrop-blur-sm` table group — fine, but add border.
# Action:          REFACTOR (same 6 steps as affiliate/privacy/terms).

# ══════════════════════════════════════════════════════════════════════════════════
# CROSS-CUTTING: shared/tapcash-content.ts
# ══════════════════════════════════════════════════════════════════════════════════
# ADD / UPDATE EXPORTS:
#   1. Add trust point types that map to TapScore (tapCashTrustPoints ✓ exists).
#   2. Add `payoutStatusMeta` map for cashout/status page STATUS_META constants.
#   3. Add `tapCashAdminStats` placeholder for admin's stats array.
#   4. Add `vipTierColor(tier)` function (currently inline in ref/[refId]).
#   5. Add `legalLastUpdated = "May 22, 2026"` and import from each legal page.
#   6. Add `tapCashTrustPoints` ✓ already exists.
#   7. Add `rapidoReachTrustPoints` for the rapidoreach page.
#   8. Consider adding `tapCashSteps` (✓ already exists).
#   9. Add a type for `TapCashStatusMeta`.

# ══════════════════════════════════════════════════════════════════════════════════
# CROSS-CUTTING: src/components/PremiumUi.tsx
# ══════════════════════════════════════════════════════════════════════════════════
# CONSIDER ADDING:
#   1. Add a `variant="accent"` or `variant="gradient"` for CTAButton that maps
#      to from-[#00e6c3] to-[#3a7bff] (currently linear-gradient is hardcoded
#      in several pages: admin, affiliate, privacy, terms).
#   2. Add a TrustStrip component (inline in landing) for reuse.
#   3. Document that StatCard uses bg-white/[0.035] as the standard glass fill.

# ══════════════════════════════════════════════════════════════════════════════════
# CROSS-CUTTING: src/app/globals.css
# ══════════════════════════════════════════════════════════════════════════════════
# ADD/VERIFY CLASSES:
#   ✓ glass-panel, tap-card, tap-shell already defined.
#   ✓ vip-gold, vip-diamond, etc. already defined.
#   ✓ animate-fade-in-up defined.
#   ✗ animate-in / slide-in-from-top-4 / slide-in-from-bottom-4 — USED IN
#     admin/page.tsx but NOT defined in globals.css. Must add Tailwind-based
#     animations or replace with MotionWrap.
#   ✗ font-display - is this in Tailwind config? Use --font-space-grotesk as
#     the display font. If `font-display` class is not in tailwind.config, add it.

# ══════════════════════════════════════════════════════════════════════════════════
# SUMMARY TABLE — PRIORITY ORDER
# ══════════════════════════════════════════════════════════════════════════════════
# FILE                            | PRIORITY | EFFORT  | KEY CHANGES
# ────────────────────────────────|──────────|─────────|───────────────────────
# src/app/landing/page.tsx        | —        | —       | No changes (reference)
# src/app/page.tsx                | —        | —       | No changes (reference)
# src/app/dashboard/page.tsx      | LOW      | 2 LOC   | bg #040913 → #050816
# src/app/cashout/page.tsx        | LOW      | 2 LOC   | bg #040913 → #050813
# src/app/payouts/page.tsx        | LOW      | 1 LOC   | bg #040913 → #050813
# src/app/transactions/page.tsx   | LOW      | 2 LOC   | bg #040913 → #050813
# src/app/rapidoreach/page.tsx    | MEDIUM   | 3 LOC   | bg, .tap-shell, dedupe data
# src/app/cashout/status/page.tsx | MEDIUM   | ~12 LOC | bg, border-norm, PageShell, dedupe data
# src/app/tapScore/page.tsx       | HIGH     | ~40 LOC | Replace hardcoded content,
#                  |          |         |   import tapCashTrustPoints, fix link /offers→/rapidoreach
# src/app/cashPath/page.tsx       | HIGH     | ~25 LOC | Import tapCashSteps,
#                  |          |         |   fix bg, add PageShell, CTAButton
# src/app/referrals/page.tsx      | HIGH     | ~80 LOC | bg, border normalization,
#                  |          |         |   MotionWrap, glass utilities, Motion fixes
# src/app/ref/[refId]/page.tsx    | HIGH     | ~30 LOC | bg fix, inline style removal,
#                  |          |         |   vip tier class migration
# src/app/admin/page.tsx          | HIGH     | ~60 LOC | bg, border normalization,
#                  |          |         |   glass utilities, CTAButton gradient variant
# src/app/admin/layout.tsx        | MEDIUM   | 3 LOC   | bg, loader color
# src/app/affiliate/page.tsx      | HIGH     | ~50 LOC | bg, border, glass-panel,
#                  |          |         |   footer, dedupe date
# src/app/privacy/page.tsx        | HIGH     | ~50 LOC | same as affiliate
# src/app/terms/page.tsx          | HIGH     | ~50 LOC | same as affiliate
# src/app/cookies/page.tsx        | HIGH     | ~50 LOC | same as affiliate

# ══════════════════════════════════════════════════════════════════════════════════
# TECH DEBT CATEGORIES
# ══════════════════════════════════════════════════════════════════════════════════
# CATEGORY 1 — HARDCODED STRINGS
#   src/app/admin/page.tsx          →  "May 22, 2026"         → tapcash-content.ts
#   src/app/affiliate/page.tsx      →  "May 22, 2026"         → tapcash-content.ts
#   src/app/privacy/page.tsx        →  "May 22, 2026"         → tapcash-content.ts
#   src/app/terms/page.tsx          →  "May 22, 2026"         → tapcash-content.ts
#   src/app/cookies/page.tsx        →  "May 22, 2026"         → tapcash-content.ts
#   src/app/cashPath/page.tsx       →  step data (3 items)    → tapCashSteps ✓
#   src/app/tapScore/page.tsx       →  content inline         → tapCashTrustPoints ✓ avail
#   src/app/rapidoreach/page.tsx    →  trustPoints (3 items)  → new content export
#   src/app/ref/[refId]/page.tsx    →  tier colors inline     → vipTierColor() fn
#   src/app/cashout/status/page.tsx →  STATUS_META object     → new content export
#
# CATEGORY 2 — MISMATCHED TAILWIND / STYLE CLASSES
#   bg-[#040913]  → should be bg-[#050813]  (6 pages: dashboard, cashout,
#                   cashout/status, payouts, transactions, rapidoreach partial)
#   bg-[#050816]  → should be bg-[#050813]  (cashPath, tapScore, ref/refId,
#                   cashout/status partial)
#   bg-[#060606]  → should be bg-[#050813]  (referrals, affiliate, privacy,
#                   terms, cookies, admin/layout)
#   border-zinc-900 → border-white/6        (affiliate, privacy, terms, cookies,
#                   admin, referrals, cashout/status partial)
#   text-zinc-500  → text-zinc-400          (standard secondary copy across
#                   legal/admin pages)
#
# CATEGORY 3 — MISSING PREMIUM HELPERS
#   Not using MotionWrap:         cashPath, tapScore, referrals, cashout/status
#   Not using PageShell:          tapScore, cashout/status
#   Not using CTAButton:          cashPath, tapScore, cashout/status
#   Inline gradient buttons:      admin, affiliate, privacy, terms, cookies
#                                 (should use new CTAButton.variant="gradient")
#   Not using accentClass:        cashPath, tapScore (no accentCard rings)
#
# CATEGORY 4 — BROKEN / MISSING LINKS
#   src/app/tapScore/page.tsx line 44:  href="/offers" → broken; use /rapidoreach
#
# CATEGORY 5 — GLOBALS.CSS GAPS
#   animate-in / slide-in-from-*  — used in admin/page.tsx (lines 319, 327, 406)
#                                  but not defined anywhere; use MotionWrap instead.
#   font-display Tailwind class    — referenced widely; confirm it maps to
#                                   --font-space-grotesk in tailwind.config.

# ══════════════════════════════════════════════════════════════════════════════════
# HIGH-LEVEL IMPLEMENTATION ORDER (recommended execution sequence)
# ══════════════════════════════════════════════════════════════════════════════════
#
# PHASE 0 — Foundation (do first, unblocks all later work)
#   0a. Add missing CSS classes to globals.css:
#         • font-display { font-family: var(--font-space-grotesk); }
#   0b. Add missing tapcash-content.ts exports:
#         • payoutStatusMeta, rapidoReachTrustPoints, vipTierColor(),
#           legalLastUpdated, tapCashAdminStats
#   0c. Add CTAButton "gradient" variant in PremiumUi.tsx.
#
# PHASE 1 — Low-hanging fruit (quick, safe, independent)
#   1a. Fix bg colors: add a scripted find-replace for all 4 color variants
#       → standardized to #050813.
#   1b. Fix border-zinc-900 → border-white/6 (sed-style on 7 page files).
#   1c. Fix broken link: tapScore.tsx href="/offers" → "/rapidoreach".
#
# PHASE 2 — Structural (medium complexity, per-page)
#   2a. cashPath/page.tsx: import tapCashSteps, add PageShell, CTAButton.
#   2b. tapScore/page.tsx: import tapCashTrustPoints, add StatCard grid,
#       replace raw CTA, add PageShell.
#   2c. rapidoreach/page.tsx: extract trustPoints to content module.
#   2d. cashout/status/page.tsx: PageShell heading, status metadata in content,
#       MotionWrap on list items.
#   2e. admin/page.tsx: replace table card styling to glass-panel, CTAButton
#       gradient variant, tab refactor.
#
# PHASE 3 — Full refactor (highest DOM changes, lowest risk of breaking logic)
#   3a. referrals/page.tsx — full glass-panel migration + MotionWrap.
#   3b. ref/[refId]/page.tsx — vip tier class migration + bg fix.
#   3c. affiliate/page.tsx + privacy/page.tsx + terms/page.tsx + cookies/page.tsx —
#       same legal-section refactor pattern.
#
# PHASE 4 — Verify
#   4a. Run `npx tsc --noEmit` and `npm run build`.
#   4b. Spot-check each page in browser: bg uniformity, card borders, CTA
#       elevation, typography scale, reduced-motion fallback.
#   4c. Verify globals.css has no unused classes and all new classes are
#       exercised by at least one component.
