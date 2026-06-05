# TapCash Model U Developer Handoff

## Main files

- `src/App.jsx` — React component structure
- `src/styles.css` — full visual styling
- `public/logos/tapcash-logo-horizontal.svg` — main header logo
- `public/logos/tapcash-icon-final.svg` — favicon/app icon
- `brand/` — final and alternative logo SVG files
- `docs/DESIGN_SPEC.md` — brand and UI rules

## Implementation priorities

1. Keep the page clean. Do not add extra proof cards above the fold.
2. Keep only three top offers in the hero area.
3. Do not lead with casino-looking offers in production.
4. Use real statistics only. Replace placeholder ratings/counts before launch.
5. Make CashPath and TapScore the signature product mechanics.
6. Preserve mobile responsiveness.

## Suggested production improvements

- Replace emoji offer art with final game/app thumbnails.
- Replace illustrated hero person with final branded 3D/illustration asset.
- Connect Top Offers to backend data.
- Add real authentication flow to CTA buttons.
- Add actual offer-detail page for TapScore and Truth Mode.

## Accessibility checklist

- Maintain contrast for text on dark panels.
- Add alt text to final imagery.
- Ensure keyboard focus states for all buttons/links.
- Do not use color alone to communicate offer status.
