# TapCash TODO / Audit Findings

Generated: 2026-06-15

## High priority issues

### 1. Signup is blocked by Firebase Identity Toolkit API

The signup API was reproduced locally and fails because Firebase Identity Toolkit API is disabled or not enabled for project `538090776118`.

Current API behavior:

```json
{
  "error": "Firebase Admin Auth is not configured. Enable Firebase Admin credentials or the Identity Toolkit API before signup can work.",
  "mode": "fallback"
}
```

Fix:

- Enable Identity Toolkit API for Firebase project `tapcash-16238` / Google Cloud project `538090776118`.
- Confirm Firebase Admin credentials are configured in production:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`
- Restart/redeploy after enabling the API.

Relevant files:

- `src/app/api/auth/signup/route.ts`
- `src/lib/firebaseAdmin.ts`
- `src/app/auth/signup/page.tsx`

---

### 2. Admin protection is not active

There is a protection helper in `src/proxy.ts`, but no `middleware.ts` file exists. Next.js will not use `src/proxy.ts` automatically.

Fix:

- Move the middleware logic into `middleware.ts` at the project root, or configure the middleware export correctly.
- Ensure `/admin/*` routes redirect unauthenticated users.
- Ensure only users with `admin: true` in Firestore can access admin pages.

Relevant files:

- `src/proxy.ts`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/fraud/page.tsx`
- `src/app/admin/offers/page.tsx`
- `src/app/admin/transactions/page.tsx`
- `src/app/admin/users/page.tsx`
- `src/app/api/auth/session/route.ts`

---

### 3. Normal user routes are not server-protected

Routes like `/dashboard`, `/cashout`, and `/rapidoreach` check auth on the client, but they still render public fallback pages instead of redirecting to sign-in.

Fix:

- Add server-side redirects for authenticated-only routes.
- Keep the client fallback as a secondary guard.
- Consider redirecting `/dashboard`, `/cashout`, `/cashout/status`, `/rapidoreach`, `/transactions`, `/referrals`, and `/payouts` when no user is signed in.

Relevant files:

- `src/app/dashboard/page.tsx`
- `src/app/cashout/page.tsx`
- `src/app/rapidoreach/page.tsx`
- `src/app/transactions/page.tsx`
- `src/app/referrals/page.tsx`
- `src/app/payouts/page.tsx`

---

### 4. Type-check is failing

`npm run type-check` fails because `server/` contains stale/incomplete tRPC and Drizzle files.

Known failures include:

- Missing `drizzle-orm`
- Missing `@trpc/server`
- Missing `server/_core/trpc`
- Missing `vitest`
- Missing `bcrypt`
- Multiple undefined router/table references

Build passes only because `next.config.ts` has:

```ts
typescript: {
  ignoreBuildErrors: true,
}
```

Fix:

- Remove stale `server/` files if they are not used.
- Or fully wire tRPC and Drizzle properly.
- Remove `ignoreBuildErrors` once type-check passes.

Relevant files:

- `server/routers/auth.ts`
- `server/routers/admin.ts`
- `server/routers/offers.ts`
- `server/routers/payouts.ts`
- `server/routers/wallet.ts`
- `drizzle/schema_tapcash.ts`
- `next.config.ts`

---

### 5. Jest test suite is failing

`npm test -- --runInBand` fails because `server/routers/__tests__/integration.test.ts` imports Vitest and MSW while the project uses Jest.

The test file is also placeholder-only:

```ts
expect(true).toBe(true)
```

Fix:

- Delete or ignore `server/routers/__tests__/integration.test.ts`.
- Or rewrite it as real Jest tests.
- Run `npm test -- --runInBand` after cleanup.

Relevant files:

- `server/routers/__tests__/integration.test.ts`
- `jest.config.js`

---

## Security and configuration issues

### 6. Hardcoded Firebase config in mobile app

Found in:

- `mobile/src/lib/firebase.ts:6`

The Firebase web API key is hardcoded. Firebase web keys are not secrets, but this should still be moved to environment variables for consistency with the web app.

Fix:

- Move mobile Firebase config to env vars.
- Add mobile env files to `.gitignore`.
- Avoid committing local mobile config.

---

### 7. npm audit reports 10 moderate vulnerabilities

`npm audit --audit-level=moderate` reports:

- `postcss <8.5.10` through `next`
- `uuid <11.1.1` through Google/Firebase dependencies

`npm audit fix --force` suggests breaking changes, including:

- `next@9.3.3`
- `firebase-admin@14.0.0`

Fix:

- Do not run `npm audit fix --force` blindly.
- Review advisories.
- Upgrade dependencies carefully.
- Re-run build, lint, type-check, and tests after upgrades.

---

### 8. Missing production environment variables

The app depends on many env vars. Missing values make offerwall, email, admin session, and payout flows unavailable.

Important envs:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

SESSION_SECRET=

RESEND_API_KEY=

RAPIDOREACH_APP_ID=
RAPIDOREACH_APP_KEY=
RAPIDOREACH_APP_SECRET=
RAPIDOREACH_TRANSACTION_KEY=
RAPIDOREACH_CALLBACK_URL=https://tapcash.online/api/postback/rapidoreach

PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

INTERAC_ENVIRONMENT=sandbox
INTERAC_API_KEY=
INTERAC_API_SECRET=

TREMENDOUS_ENVIRONMENT=sandbox
TREMENDOUS_API_KEY=
TREMENDOUS_CAMPAIGN_ID=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

Fix:

- Add these to the deployment environment.
- Keep only `NEXT_PUBLIC_*` values in client bundles.
- Never commit real secrets.

---

## Product and backend wiring issues

### 9. Offers API requires `userId`, but dashboard does not pass it

`src/app/api/offers/route.ts` requires:

```ts
const userId = searchParams.get('userId');
```

But dashboard calls:

```ts
fetch("/api/offers")
```

So the dashboard falls back to seeded offers.

Fix:

- Pass `user.uid` from dashboard:

```ts
fetch(`/api/offers?userId=${encodeURIComponent(user.uid)}`)
```

- Or make `/api/offers` derive `userId` from a verified Firebase ID token.

Relevant files:

- `src/app/api/offers/route.ts`
- `src/app/dashboard/page.tsx`

---

### 10. Ledger summary depends on Firestore `ledger_transactions`

`src/app/api/debug/ledger-summary/route.ts` reads ledger transactions from Firestore:

```ts
adminDb.collection("ledger_transactions")
```

If offer/postback flows do not write to `ledger_transactions`, users see empty/default balances.

Fix:

- Confirm all offer completions, postbacks, adjustments, and payout requests write ledger entries.
- Add tests for ledger balance calculation.
- Add admin tooling to inspect ledger entries.

Relevant files:

- `src/app/api/debug/ledger-summary/route.ts`
- `src/app/api/postback/route.ts`
- `src/app/api/postback/rapidoreach/route.ts`
- `src/app/api/postbacks/offerwall/route.ts`
- `src/app/api/payouts/request/route.ts`

---

### 11. Cashout page is mostly informational

`src/app/cashout/page.tsx` does not call the real payout request API.

Real payout request route exists:

- `src/app/api/payouts/request/route.ts`

Fix:

- Connect the cashout form to `/api/payouts/request`.
- Display payout request status after submission.
- Validate minimum payout, duplicate destination, engagement lock, and insufficient balance on the client as UX only, not security.
- Keep all real validation server-side.

Relevant files:

- `src/app/cashout/page.tsx`
- `src/app/api/payouts/request/route.ts`

---

### 12. Mobile folder is not fully ignored

`.gitignore` now includes:

```gitignore
/mobile/node_modules
```

But `mobile/src/lib/firebase.ts` is still tracked and contains hardcoded Firebase config.

Fix:

- Decide whether the mobile app is part of this repo.
- If yes, move config to env vars.
- If no, remove or ignore the mobile app folder.

---

## Validation results

Run from project root:

```bash
npm run build
npm run lint
npm run type-check
npm test -- --runInBand
npm audit --audit-level=moderate
```

Current results:

- `npm run build`: passes
- `npm run lint`: passes with existing warnings only
- `npm run type-check`: fails due to stale `server/` files
- `npm test -- --runInBand`: fails because `server/routers/__tests__/integration.test.ts` imports Vitest/MSW
- `npm audit --audit-level=moderate`: reports 10 moderate vulnerabilities
- `git status --short --branch`: clean after this file is committed

---

## Recommended next steps

1. Enable Firebase Identity Toolkit API and verify admin credentials.
2. Add proper `middleware.ts` for admin/user route protection.
3. Remove or rewrite stale `server/` files.
4. Fix or remove the stale Jest/Vitest test file.
5. Connect dashboard offers API to authenticated user ID.
6. Connect cashout UI to the real payout request API.
7. Review npm audit advisories before upgrading dependencies.
8. Move mobile Firebase config into env vars or remove the mobile app from this repo.
