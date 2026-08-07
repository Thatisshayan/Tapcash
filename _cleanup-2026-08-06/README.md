# Staged for deletion — 2026-08-06 orphan cleanup

Shayan gave explicit go-ahead (2026-08-06, TapCash launch-push chat) to move
these files out of the build and into one folder for review, then delete the
folder once confirmed. **Nothing here is deleted yet** — this is the review
step per `REPO_RULES.md` Rule 14 (no file deletion without Shayan's approval).

## What's here and why it's dead

Every file below was verified unreferenced (`grep` across `src/` and tests,
zero import hits outside this set) before being moved — see
`REDESIGN_SPEC.md` §4.2 for the original audit that first flagged them, and
`docs/governance/DEFERRED_WORK.md` for the standing deferred-deletion entry
this cleanup closes out.

- **6 dead Hero variants** (`landing/Hero`, `HeroDynamic`, `HeroPremium`,
  `HeroV1Balanced`, `HeroV2Gaming`, `HeroV3Offers`) — an unwired A/B-test
  scaffold (`HeroDynamic` switches between the V1/V2/V3 variants, but nothing
  renders `HeroDynamic` itself). `landing/index.ts`'s barrel export of `Hero`
  was removed in the same pass since the barrel itself has no importers.
- **`*Premium` components** (`dashboard/`, `cashout/`, `landing/`) — leftover
  from an earlier rewrite generation; superseded by the components actually
  wired into the live pages.
- **Landing sections** (`FinalCTASection`, `HowItWorksSection`,
  `PayoutMethodsSection`, `PayoutTicker`, `TestimonialsSection`) and misc.
  orphans (`BrandLogos`, `CashPathFlow`, `CompletionReceiptModal`,
  `OnboardingModal`, `PushNotificationPrompt`, `TapScoreIndicator`,
  `TrustBadges`, `ui/DashboardMockup`) — none imported anywhere in `src/`.

## What's deliberately NOT here

The 4 admin `*Premium` components (`AdminOverviewPremium`,
`FraudManagementPremium`, `TransactionManagementPremium`,
`UserManagementPremium`) were **kept in place**. `DEFERRED_WORK.md` records
Shayan's explicit 2026-08-06 confirmation that admin retheme goes dark using
these as the reference — they're the plan, not debris.

## Next step

Once Shayan confirms nothing here is needed, delete `_cleanup-2026-08-06/`
outright (it's excluded from `tsconfig.json` and `eslint.config.mjs` so it
carries no build/lint cost while it waits).
