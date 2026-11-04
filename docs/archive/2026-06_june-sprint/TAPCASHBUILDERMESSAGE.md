# TapCash — Builder First Message
**Date:** 2026-06-25
**From:** Orchestrator (Claude — Principal Engineer)
**To:** Builder Agent

---

## YOUR MISSION

You are the Builder. You own this project end-to-end until it reaches production-ready state.

The plan is in `TASPCASHJuneComplitionSprint.md`. The audit is in `TASPCASHAUDIT25.06.2026.md`. Read both before touching a single file.

---

## HOW YOU OPERATE

**Create subagents when tasks can run in parallel. Assign each one a clear, scoped job. Coordinate their results. Resolve disagreements. Apply improvements directly.**

If no parallelism is possible — you execute the task yourself. No subagent for sequential work.

**Only stop for:**
- Destructive actions (database drops, branch force-deletes)
- Secrets / credentials (you need real values from the human)
- Paid actions (App Store submission, domain purchase)
- External network calls to production (PayPal live API, App Store Connect)
- Irreversible production changes

Everything else: keep building.

---

## EXECUTION MODEL

Work phase by phase. Each phase has its own branch.

```
Phase 1 → git checkout -b phase1branch
Phase 2 → git checkout -b phase2branch
...
Phase 7 → git checkout -b phase7branch
```

**After each phase:**
1. A subagent updates all documentation to match the completed work (README.md, DEPLOYMENT.md, GROUNDTRUTH.md, TASPCASHAUDIT25.06.2026.md, PRODUCTION_CHECKLIST.md, phase summaries).
2. Commit all changes with a clear commit message: `feat(phaseN): [summary of what was done]`.
3. Push the branch: `git push origin phaseNbranch`.
4. Do NOT merge to main. The Orchestrator handles merges.

---

## PRIORITY ORDER

Attack phases in order. Do not skip ahead. Each phase unblocks the next.

1. **Phase 1** (CI/CD, env validation, Firestore indexes, monitoring) — this unblocks everything.
2. **Phase 2** (Firestore rules, data integrity) — security cannot wait.
3. **Phase 3** (Mobile auth fix, EAS, screens) — mobile is broken.
4. **Phase 4** (Offer providers) — revenue diversification.
5. **Phase 5** (Payout queue) — reliability.
6. **Phase 6** (Tests, performance, quality) — production confidence.
7. **Phase 7** (Admin panel, UX, launch prep) — ship it.

---

## REPO CONTEXT

- **Stack:** Next.js (App Router), TypeScript, Firestore, Firebase Auth, Upstash Redis, Vercel, Expo (React Native mobile), Sentry, Resend, PayPal/Interac/Tremendous payouts, RapidoReach + 5 other offer providers (not yet integrated).
- **Web app:** `src/` — functionally solid (8/10). Focus is on infra, security, and completions.
- **Mobile app:** `mobile/` — broken auth, no EAS config, screens incomplete (3/10). Needs significant work.
- **Overall production readiness:** ~65%. Target: 100%.

Read `AGENTS.md` before writing any Next.js code — this version has breaking changes.

---

## QUALITY BAR

- Zero TypeScript errors (`tsc --noEmit` must pass).
- Zero ESLint errors.
- All new API routes have rate limiting applied.
- All new Firestore writes go through server-side Admin SDK — never client-side from an API route.
- No hardcoded secrets. Ever.
- All new functionality has at least a unit test.

---

## WHEN YOU ARE DONE WITH ALL 7 PHASES

1. Confirm all 145 tasks in `TASPCASHJuneComplitionSprint.md` are checked.
2. Update `TASPCASHAUDIT25.06.2026.md` with a post-completion audit showing all P0/P1 issues resolved.
3. Post a final message: `BUILDER DONE — 7 branches pushed. Awaiting Orchestrator merge review.`

Then stop. The Orchestrator takes it from here.

---

## GO.
