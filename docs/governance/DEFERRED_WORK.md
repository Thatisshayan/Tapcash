# Deferred Work Register

Rule 12 / Rule 11. This register survives the session. Future agents resume from here.

## Format
- `[DATE] <scope>: <what> — <why deferred> — <resume hint> — <status>`

## Items
- [2026-08-04] typecheck: `tsc --noEmit` reports 109 pre-existing type errors across ~18 files (api/payout*, api/admin/withdrawals, api/postback*, api/tasks/*, api/promo/redeem, api/streak, lib/firebaseAdmin, lib/audit, lib/ledger, lib/idempotency, scripts/seed-firestore, instrumentation) — why deferred: were masked by a JSX syntax error in admin/fraud/page.tsx that made tsc bail before parsing the repo; fixed in PR #49 but the underlying firebase-admin typing debt (namespace imports `admin.firestore()`/`admin.auth()` not resolving against installed types) remains — resume hint: root-cause is one firebase-admin import-style issue; likely fixable with a single types/resolution change; add a `typecheck` CI gate after — status: OPEN
- [2026-08-04] lint: `npx eslint src` reports 11 errors + 185 warnings (pre-existing, unrelated to PR #49) — e.g. 6× `Function` type usage, render-during-render bug, TDZ access — why deferred: out of Phase 0 scope (Phase 0 only repaired the ESLint *crash* by pinning eslint@^9.39.5) — resume hint: triage the 11 errors first, then batch-fix warnings — status: OPEN
