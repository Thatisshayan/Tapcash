# TapCash — Redesign Specification

**Date:** 2026-08-03
**Status:** Proposal — awaiting Shayan's approval before implementation
**Companions:** `UI_UX_DEEP_AUDIT_2026.md` (what's broken) · `ASSETS_REQUIRED.md` (what to make)

---

## 1. DESIGN DIRECTION

### 1.1 What TapCash is

A Canadian rewards platform where users complete verified offers (surveys, game installs,
videos) to earn coins, then cash out via PayPal, Interac e-Transfer, Bitcoin, or gift
cards. Its differentiator is **CashPath** — a transparent 5-stage tracker showing exactly
where an earning is in the pipeline (Choose → Tracking → Pending → Approved → Cashed Out).

### 1.2 The core tension

Reward apps have a credibility problem. Users assume they're scams because most are. The
category's visual language — neon, confetti, coin explosions, fake urgency — actively
signals "scam" to a sceptical user.

TapCash's product answer is transparency (CashPath, ledger-backed balances, TapScore).
**The visual language should reinforce that, not fight it.**

Right now it fights it. The app currently ships three fabricated social-proof numbers on a
single page load (`2,847+ users cashed out in last 24h`, `$2,547,382 paid out`,
`2.3K+ cashed out today`), a permanently fake "LIVE PAYOUT" row on mobile, and a CashPath
tracker hardcoded to step 2 for every user. The honesty feature is wrapped in dishonest
chrome.

### 1.3 Personality: **Verified · Kinetic · Canadian**

- **Verified** — the primary emotional job. Every surface should feel auditable. Real
  numbers, visible state, no mystery. This is the differentiator; lean on it hard.
- **Kinetic** — it's still a rewards product competing for attention. Motion earns
  attention on *state change* (a payout advancing a stage, a balance ticking up), never
  as ambient decoration.
- **Canadian** — an unclaimed positioning advantage. Interac support, CAD-native,
  PIPEDA compliance, Tim Hortons/Canadian Tire gift cards. Most competitors are US-first
  and treat Canada as an afterthought. Say it out loud.

### 1.4 Anti-patterns — explicitly banned

- Fabricated statistics of any kind. Live data or no data.
- Countdown timers that reset on reload.
- Confetti on anything other than a genuinely completed payout.
- Ambient looping glow on static elements.
- Emoji as UI iconography (currently in `src/styles/theme.ts:107,118,127` sample data).
- Fake "live activity" rows.
- The word "Premium" in component names. It described a rewrite generation, not a
  product tier, and it produced 32 orphaned files.

---

## 2. TOKEN ARCHITECTURE

### 2.1 Decision: one palette, Model U, shared across platforms

The audit found four competing palettes. **Keep Model U** (`#050813` / `#31F06F` /
`#7C3DFF` / `#18D9FF`) — it's already tokenized in `globals.css:9-25`, measurably
higher-contrast than the legacy palette, and the deeper `#050813` base reads as more
financial than the legacy `#0d0d1a`.

Retire: the legacy palette (`#00FF85` / `#7B5CF0` / `#0d0d1a`), the `#0a0f0d` inline
override at `layout.tsx:70`, and the undocumented `#00E6C3` teal (123 uses).

### 2.2 Semantic layer

The current tokens are *literal* (`--color-brand-green`). The redesign needs a **semantic**
layer on top, so components never name a colour:

```
PRIMITIVE                     SEMANTIC                        USAGE
--tc-green-500  #31F06F   →   --surface-accent-success        earnings, positive delta
--tc-cyan-500   #18D9FF   →   --surface-accent-info           links, focus, active nav
--tc-purple-500 #7C3DFF   →   --surface-accent-action         primary CTA fill only
--tc-gold-500   #FFC442   →   --surface-accent-reward         streaks, tiers, bonuses
--tc-red-500    #FF2F42   →   --surface-accent-danger         errors, fraud, rejection
--tc-ink-950    #050813   →   --surface-base
--tc-ink-900    #09101F   →   --surface-raised
--tc-ink-800    #0F1829   →   --surface-overlay
--tc-slate-100  #F6F8FF   →   --text-primary
--tc-slate-400  #9AA8C6   →   --text-secondary     (8.37:1 ✅)
--tc-slate-500  #7B8AA8   →   --text-tertiary      (replaces the 2.94:1 failure)
```

**Contrast rules baked into the token names:**

- `--surface-accent-action` (`#7C3DFF`, 3.78:1) is a **fill-only** token. Using it for
  text must fail CI. White-on-purple is 5.29:1 and passes.
- Never white text on `--tc-green-500` (1.52:1). Green fills take black text (13.82:1).
- `--text-tertiary` replaces both `--color-text-dim` (2.94:1) and mobile `dim` (1.74:1).
- Mobile inactive tab must move from `rgba(255,255,255,0.3)` (2.20:1) to `#7B8AA8`.

### 2.3 Cross-platform sharing

The single highest-leverage structural change: **one token source, both platforms.**

```
packages/tokens/
  tokens.json              ← source of truth
  build.ts                 ← generates both outputs
    → src/app/globals.css       (@theme block, web)
    → mobile/src/theme.ts       (typed object, mobile)
```

Web and mobile currently drift because they're maintained by hand in two files. A build
step makes drift structurally impossible.

### 2.4 Type scale

Fluid, `clamp()`-based, replacing the 100+ arbitrary `text-[13px]` values:

```
--text-2xs   11px            micro-labels, legal
--text-xs    12px            captions, metadata
--text-sm    14px            secondary body
--text-base  16px            body
--text-lg    18px            emphasised body
--text-xl    clamp(20,2vw,24)   card titles
--text-2xl   clamp(24,3vw,32)   section headings
--text-3xl   clamp(32,5vw,44)   page titles
--text-4xl   clamp(40,7vw,64)   hero
--text-5xl   clamp(48,9vw,86)   hero display
```

**Font roles — enforce these, currently near-unused:**

| Face | Role | Rule |
|------|------|------|
| Space Grotesk | display | headings ≥ `--text-2xl` only |
| Manrope | body | all prose and UI text |
| JetBrains Mono | **numerals** | **every currency value, coin count, countdown, ID** — non-negotiable |

Currency in the body font is the single clearest "this isn't a real fintech" signal.
Currently mono is used 11 times in 130 files.

### 2.5 Spacing, radius, elevation

```
SPACE   4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96      (4px base)
RADIUS  sm 8 · md 12 · lg 16 · xl 22 · 2xl 28 · pill 999
ELEV    0 flat · 1 inset hairline · 2 card · 3 overlay · 4 modal
```

Radius `lg`=16 / `xl`=22 matches the existing `.model-u-card` (22px) so current cards
survive the migration.

### 2.6 Motion

```
--motion-instant  100ms  cubic-bezier(0.4, 0, 1, 1)     state flips
--motion-fast     160ms  cubic-bezier(0.4, 0, 0.2, 1)   hover, focus
--motion-base     240ms  cubic-bezier(0.4, 0, 0.2, 1)   entrances
--motion-slow     400ms  cubic-bezier(0.34, 1.56, 0.64, 1)  celebration only
```

Animate `transform` and `opacity` only. The existing global `prefers-reduced-motion`
reset (`globals.css:663-669`) stays — it's one of the repo's genuine strengths.

---
## 3. SIGNATURE VISUAL DEVICES

Three reusable patterns so the UI can't be mistaken for a template after a logo swap.
The audit's Layer 4 test: *could this be another app with a different logo and colour?*
Today, yes. These fix that.

### 3.1 The CashPath Rail

The flagship device. A horizontal 5-node progress rail that appears at three scales:

- **Micro** (inline, 120px) — inside an offer card, on a transaction row
- **Standard** (card-width) — dashboard, offer detail
- **Hero** (full-width, animated) — landing page, payout confirmation

Rules: completed nodes filled `--surface-accent-success` with a hairline glow; the active
node pulses **once on state change only**, never ambiently; future nodes are outline-only
in `--text-tertiary`. The connector rail is a gradient that fills left-to-right on
advance.

This is the product's whole thesis rendered as a component. It should be the most
recognisable thing in the app. Currently it's a hardcoded `ACTIVE = 2` on mobile
(`(tabs)/index.tsx:15`) and static markup on web.

### 3.2 The Verified Card

Replaces the current `.model-u-card` / `.glass-card` / `.card-elevated` /
`card-glass` sprawl (four card treatments, inconsistently applied).

One card language: `--surface-raised` fill, hairline `rgba(150,190,255,0.14)` border,
`inset 0 1px rgba(255,255,255,0.04)` top highlight, radius `xl`. Its signature is a
**status hairline** — a 2px top edge coloured by semantic state (success / pending /
info / danger). Scanning a column of cards tells you system state at a glance without
reading a word.

Hover: `translateY(-4px)` + border shifts to `--surface-accent-info` at 30%. No scale,
no shadow bloom.

### 3.3 The Ledger Row

For transactions, payouts, activity, leaderboard — currently four different row
treatments. One pattern: mono numerals right-aligned on a consistent baseline, semantic
status dot at the left edge, timestamp in `--text-tertiary`, the amount as the only
high-contrast element in the row.

Right-aligned monospace numerals that vertically align across rows is *the* visual cue
that a product handles money seriously. It costs nothing and the app currently doesn't
do it.

---

## 4. COMPONENT SYSTEM

### 4.1 Primitives to build (`src/components/ui/`)

| Component | Replaces | Notes |
|-----------|----------|-------|
| `Button` | current `Button.tsx` + 3 CSS button classes | variants: primary/secondary/ghost/danger; sizes sm/md/lg; `loading` and `disabled` states |
| `Input` | 35 raw `<input>` | **`htmlFor`/`id` mandatory in the API** — fixes the 1-of-34 label problem structurally |
| `Card` | 4 competing card treatments | `status` prop drives the hairline |
| `Badge` | inline spans | semantic variants |
| `Modal` | 4 ad-hoc modals | **focus trap + ESC + scroll lock + `aria-modal` built in** |
| `Table` | 11 raw `<table>` | card-collapse below `md:` |
| `Skeleton` | none | `.skeleton` CSS exists with 0 usages |
| `EmptyState` | none | illustration + copy + action |
| `Toast` | 17 scattered refs | `aria-live="polite"` built in |
| `Money` | raw `toFixed()` | **one component, one divisor** — kills the /100 vs /1000 bug class |
| `CashPathRail` | hardcoded markup | §3.1 |
| `StatusDot` | inline spans | semantic state |

`Money` is the important one. The canonical rate is **1000 coins = $1 CAD**
(`shared/tapcash-content.ts:304`), honoured at 18 sites — but both `OfferCard`
components divide by **100**, so every offer in the catalogue advertises **10× the real
payout**. Centralising formatting in one component makes that class of bug impossible to
reintroduce, and it should wrap the shared helper rather than reimplement the divisor.

### 4.2 Deletion list

Remove in Phase 1 — all verified unreferenced:

```
6 dead Hero variants:  landing/Hero, HeroDynamic, HeroPremium,
                       HeroV1Balanced, HeroV2Gaming, HeroV3Offers
26 other orphans:      all *Premium components (admin/, dashboard/, cashout/, landing/),
                       sections/{FinalCTA,HowItWorks,PayoutMethods,PayoutTicker,
                       Stats,Testimonials}, BrandLogos, CashPathFlow,
                       CompletionReceiptModal, OnboardingModal, PushNotificationPrompt,
                       TapScoreIndicator, TrustBadges, ui/DashboardMockup
```

**Caveat before deleting:** the four admin `*Premium` components are dark-themed
replacements for the light-themed admin pages currently shipping. Harvest their styling
into the retheme (Phase 4.2) *before* deleting, or keep those four and delete the light
pages instead.

### 4.3 Mobile parity

`mobile/src/components/` gets the same primitive names backed by the shared tokens:
`Button`, `Input`, `Card`, `Badge`, `Sheet` (native modal), `Skeleton`, `EmptyState`,
`Money`, `CashPathRail`, `StatusDot`.

Plus the platform fixes from the audit:
- `ScrollView` → `FlatList` for all lists
- `KeyboardAvoidingView` on every form screen
- `accessibilityLabel`/`Role`/`Hint` on all 68 touchables
- `hitSlop` on every sub-44pt target
- Adopt `react-native-reanimated` (installed, 0 imports) or drop the dependency
- Load the fonts, or remove the 4 dangling `JetBrainsMono-Regular` references

---

## 5. SCREEN-LEVEL DIRECTION

### 5.1 Landing (`/`)

Keep the 8-section structure. Changes:

1. **Replace all fabricated stats with live `/api/stats/platform` data.** If the endpoint
   can't serve it, remove the claim. Three different fake numbers on one page is the
   single biggest credibility leak in the product.
2. Hero: lead with the CashPath Rail (§3.1) as the primary visual, not a character
   render. Show the actual mechanism — that's the differentiator.
3. Use the real logo SVG in the navbar (currently a `TC` text div, `Navbar.tsx:20-22`).
4. Re-export hero art per `ASSETS_REQUIRED.md` §11 — 4.79 MB → ~200 KB.
5. Add the Canadian positioning above the fold. Interac + CAD + PIPEDA is unclaimed.

### 5.2 Dashboard (`/dashboard`)

Primary job: *how much do I have, and when can I get it?* That's the balance and the
progress-to-minimum-cashout — nothing else deserves top-of-fold.

Balance in `--text-4xl` JetBrains Mono. Progress ring to the $20 minimum. CashPath Rail
showing real in-flight earnings. Ledger Rows below. Skeletons on load, never a blocking
spinner.

### 5.3 Cashout (`/cashout`, `/cashout/status`)

Highest-stakes flow in the product. `/cashout/status` currently has **zero responsive
prefixes** in 10 KB of markup — it's the screen users open on their phone to check if
they got paid, and it has no mobile layout.

Method selection as cards with real payout-rail logos (PayPal/Interac/Bitcoin/gift),
each showing minimum, ETA, and fee. Amount entry in mono with live validation. A
confirmation step that restates method + amount + ETA before submit. Status page driven
by the CashPath Rail.

### 5.4 Admin

Retheme dark using the four existing `*Premium` components. Admin currently renders in
**three** visual styles: the dark shell (`admin/layout.tsx:64`), three coherent dark
pages (Command Center, multiplier, promo-analytics), and five full-bleed **light** pages
(users, transactions, offers, fraud, dashboard) nested inside the dark frame.
`admin/multiplier` and `admin/promo-analytics` are the reference model — copy their
treatment.

Tables → the `Table` primitive with card-collapse below `md:`, plus sorting and
pagination (none of the 11 tables have either). Replace every native
`alert`/`confirm`/`prompt` — used for withdrawal rejection (`admin/page.tsx:181`), offer
delete, transaction refund, and IP unblock — with the accessible `Modal` primitive.

`error.tsx`, `loading.tsx` and `not-found.tsx` use a **fourth** background (`#0a0a0a`)
with an off-brand `#ff2e63` accent. Bring them onto the token system and add
`role="alert"` to the error surface.

### 5.5 Mobile

Fix `(tabs)/index.tsx` first — it's the app's front door and currently ships:
- hardcoded `ACTIVE = 2` CashPath (L15)
- a permanent fake "LIVE PAYOUT" row (L127-129)
- hardcoded `50K+` / `$2.5M+` / `98%` stats (L189-193)
- an avatar that always renders `"U"` (L89)
- the `/1000` divisor bug (L76)

Every one of those is a trust liability in a financial app.

---

## 6. IMPLEMENTATION SEQUENCE

Maps to `UI_UX_DEEP_AUDIT_2026.md` §8.

| Phase | Scope | Days | Gate |
|-------|-------|------|------|
| **0** | Unblock: fix typecheck, ESLint, currency divisor, delete 20 MB dupes | 0.5 | `tsc --noEmit` green, `eslint src` runs |
| **1** | Token foundation: one palette, shared build, contrast fixes, delete orphans | 3–4 | 0 raw hex in `src/**/*.tsx`, all pairs ≥ AA |
| **2** | Accessibility: labels, ARIA, Modal primitive, mobile a11y props | 3–4 | axe clean, VoiceOver/TalkBack pass |
| **3** | Assets: real app icons, AVIF pipeline, fonts | 2 | payload < 5 MB, store icons valid |
| **4** | Components: primitives, admin retheme, responsive, mobile natives | 5–7 | all flows verified at 375/768/1440 |

**Total: 14–18 working days.**

Phase 0 is a prerequisite for everything — the repo currently has neither a working type
gate nor a working lint gate, so no redesign work can be safely verified until it lands.

---

## 7. DEFINITION OF DONE

- [ ] `npm run type-check` passes
- [ ] `npm run lint` runs and passes
- [ ] Zero raw hex in `src/**/*.tsx` (CI-enforced)
- [ ] One palette, generated from `packages/tokens/` for both platforms
- [ ] All text pairs ≥ 4.5:1; UI components ≥ 3:1
- [ ] Every input has an associated label
- [ ] Every modal traps focus, closes on ESC, locks scroll
- [ ] Every mobile touchable has `accessibilityLabel` + ≥44pt target
- [ ] Real app icons for iOS, Android, PWA
- [ ] Image payload < 5 MB; AVIF/WebP with fallback
- [ ] Zero fabricated statistics — live data or removed
- [ ] One `Money` component wrapping `shared/tapcash-content.ts`; **/1000 everywhere**; unit-tested
- [ ] Zero native `alert`/`confirm`/`prompt` in admin
- [ ] No swallowed fetch errors — every failure has a user-facing state
- [ ] `autoComplete` on every auth and cashout field
- [ ] Loading / empty / error states on every data surface
- [ ] Verified at 375 / 768 / 1440 px and on a real device per platform

---

## 8. OPEN DECISIONS FOR SHAYAN

1. **Palette:** confirm Model U (`#31F06F`/`#7C3DFF`/`#050813`) over legacy
   (`#00FF85`/`#7B5CF0`/`#0d0d1a`). Recommendation: Model U.
2. **Admin:** retheme dark to match the product, or keep light and formalise it as a
   deliberately separate internal tool? Recommendation: dark, using the `*Premium`
   components already built.
3. **Motion library:** adopt Lottie (new dep, both platforms) or stay CSS + Reanimated?
   This gates ~10 assets in `ASSETS_REQUIRED.md` §7.
4. **Icons:** standardise on `lucide-react` + `lucide-react-native` for one visual
   language, or keep Lucide/Ionicons split? Recommendation: unify on Lucide.
5. **A/B infrastructure:** `ABTestContext` and 3 Hero variants exist but nothing is
   wired. Revive or delete? Recommendation: delete now, rebuild when actually needed.
6. **Fabricated stats:** confirm authority to remove them and wire to
   `/api/stats/platform`, or delete the claims outright.

---

*No files were modified in producing this spec. Implementation awaits approval.*
