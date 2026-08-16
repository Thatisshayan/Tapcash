# Track 2 Mockup

**Status: v6 built 2026-08-06, awaiting Shayan's yes/no/fix-X.** v1-v5 below
are the paused, rejected history. v6 is a different approach: instead of
generating a fresh image, Shayan provided a working reference app
(`tapcash-frontend-design-request/`, a small Vite/React build of the real
target look) and asked for a mockup confirming it, not guessing at it.

## v6 (2026-08-06) — built from Shayan's own reference app, not a guess

- Source: literal transcription of `Home.tsx` / `Sidebar.tsx` / `Topbar.tsx`
  from the reference app Shayan supplied, palette-for-palette, asset-for-asset
  (real hero/wallet/offer art from that folder, downscaled to WebP for a
  lightweight static preview).
- Static HTML mockup: `docs/superpowers/mockups/tapcash-mockup-v6-home.html`,
  published as a Claude Artifact for Shayan to view live.
- Confirmed direction: dark `#080C14`/neon `#14F195`/purple `#6D28D9`/cyan
  `#00B4D8` palette, glassmorphism panels, glow on interactive/hero elements,
  floating 3D hero art, Outfit + Plus Jakarta Sans type (system-fallback in
  the static preview; real fonts load via `next/font` in the actual app).
- **Explicitly reconciled against `REDESIGN_SPEC.md`'s anti-patterns**
  (2026-08-06 decision, see `packages/tokens/tokens.json` meta.decisionLog):
  glow is now approved for interactive/hero elements (overrides the spec's
  blanket "no ambient glow"), but "no fabricated statistics" and "no fake
  live-activity rows" STAY IN FORCE — the mockup's stats strip ("500K+
  Active Users" etc.) and live-user pill ("2.3k+ cashed out") must be wired
  to real `/api/stats/platform` data or restyled/removed before this ships
  to real pages, not shipped as round placeholder numbers.
- Palette is now locked as the new token source of truth
  (`packages/tokens/tokens.json` v2.0.0, "TapCash Neon", supersedes Model U)
  — see `agent/claude/038-track2-palette-foundation`.

---

# v1-v5 history — NOT approved, paused

**Status: paused by Shayan on 2026-08-06.** Nothing here is approved. Do
not resume this task or treat any image in this directory as a go-ahead
without Shayan's explicit sign-off first.

## Attempts so far (all in `docs/superpowers/mockups/`, none approved)

- **v1** (`nano_banana_2`, gitignored, deleted): literal flat UI-screenshot
  collage, boxy cards, generic placeholder icons. Rejected: "generic,
  template like, with boxes and edges, ugly font and typography, there is
  emoji, there is no image asset."
- **v2** (`recraft_v4_1` standard, gitignored, deleted): pure abstract
  cinematic light art, no product/content shown. Rejected: "better
  direction but this image is not showing anything."
- **v3** (`recraft_v4_1` utility): premium 3D phone product shot, real
  glass/metal material, neon rim lighting — style well received ("this
  last photo is much better") but content was still invented placeholder.
- **v4** (`recraft_v4_1` utility): same style as v3, real copy pulled from
  `HeroSection.tsx`/`OffersSection.tsx`. Rejected: "Not approved" (no
  further detail given before being told to stop).
- **v5** (`recraft_v4_1` utility): pivoted to an actual desktop browser-
  window mockup (nav bar, hero, offer-card row) instead of a phone product
  photo, still with real copy. Rejected: "You are very far from what i had
  in mind."

## What's still unknown

Shayan said to leave this task for now rather than clarify further. Before
picking this back up, get explicit direction on what "a mockup of the
actual website" should look like — none of the 5 attempts landed, and the
gap between v5 (a literal desktop browser screenshot with real copy) and
what he had in mind is not yet understood. Do not guess again without
asking first.

traces-to: TASK-038
