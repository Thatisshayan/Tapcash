# tapcash — REPO_DIRECTIVE

> Goal-layer constitution. `REPO_RULES.md` is the law (how to work); this is the
> mission. Every task MUST carry `traces-to:` to a Phase/Sprint/Epic below. Orphan
> tasks are rejected by CI (scripts/verify.sh → directive-lint) and by Sentinel.

## Vision

TapCash is a premium offers-and-rewards platform: users complete verified offerwall
tasks, are protected by a multi-layer fraud system, and cash out via PayPal / Interac
/ Tremendous. North-star: zero payout fraud, high offer completion integrity, and a
polished cross-web+mobile experience that feels trustworthy enough to hand real money.

## Non-Goals

- NOT a crypto / casino / sweepstakes platform.
- NOT adding new offerwall providers beyond RapidoReach without Shayan approval.
- NOT relaxing fraud gates (VPN/bot/IP/engagement/destination locks) for conversion.
- NOT storing raw payout credentials; payouts are admin-only, processor-handled.
- NOT a general-purpose admin framework — the 8-section panel serves TapCash only.

## Phases

### P1 — Production-Hardening (CURRENT)
  exit criteria: GROUNDTRUTH.md accurate; 93 Jest tests green on CI; fraud gates on.
### P2 — Mobile Parity
  exit criteria: /mobile (Expo) feature-complete vs web (push, balance, account).
### P3 — Offerwall Expansion
  exit criteria: second offer source integrated behind same fraud pipeline.

## Sprints

### S1 (maps to P1) — lock the source of truth
  goal: GROUNDTRUTH.md + API_DOCUMENTATION reflect real routes; no doc drift.
### S2 (maps to P2) — Expo parity
  goal: mobile matches web cashout + fraud UX.

## Epics / Chapters

### E1 — Fraud Integrity (maps to P1)
  VPN/bot/IP/rate/engagement/destination locks stay airtight; postback IP-whitelisted.
### E2 — Payout Trust (maps to P1)
  admin-only payout, anti-fraud gating, processor_webhooks verified.
### E3 — Mobile (maps to P2)
  React Native/Expo feature parity with web.

## Tasks

- [ ] T1 — Reconcile GROUNDTRUTH.md with actual API routes (fix drift) | traces-to: P1/S1/E1 | acceptance: every route in GROUNDTRUTH exists; none missing
- [ ] T2 — Add integration test for signed offerwall iframe + IP-whitelisted postback | traces-to: P1/S1/E1 | acceptance: test fails if postback from non-whitelisted IP accepted
- [ ] T3 — Verify Firestore 5-min cache + seed-data fallback path under outage | traces-to: P1/S1/E2 | acceptance: seed fallback serves content when Firestore down
- [ ] T4 — Close mobile/web cashout parity gap (push + balance animation) | traces-to: P2/S2/E3 | acceptance: mobile cashout matches web flow end-to-end
- [ ] T5 — Add rate-limit e2e for /api/cashout (anti-fraud) | traces-to: P1/S1/E2 | acceptance: >N req/min from one user blocked + flagged

## Sentinel Constraints

- auto-approve: docs/tests/typing tasks tracing to P1/E1 with acceptance met.
- review-required: anything touching fraud gates, payout, auth, middleware.ts, webhooks.
- locked: `main`; `docs/GROUNDTRUTH.md` edits need Shayan sign-off; secrets never.
