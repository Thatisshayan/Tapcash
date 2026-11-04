# Production Auth Outage Audit

**Date:** 2026-11-04
**Agent:** Claude Code (Opus 5.5)
**Scope:** Why sign-in and every firebase-admin route return HTTP 500 in production, and the fix.

## Symptom

On the live site (`https://tapcash-rose.vercel.app`, project `tapcash`), `/api/auth/session/user` and `/api/health` return `500` with an empty body for every visitor. Since nobody can establish a session, the logged-in pages (dashboard, cashout, offers), which carry most of the Aurora redesign, could not be reached.

## Evidence

Vercel runtime errors for project `prj_wRnhHOYusthpDtMuGSuc5f64Pd65`, one error group, 47 occurrences in the last 24 h, first seen **2026-08-06T23:55Z**, still occurring 2026-11-04:

```
Error: Failed to load external module firebase-admin-<hash>/auth:
Error [ERR_REQUIRE_ESM]: require() of ES Module /var/task/node_modules/jose/dist/webapi/index.js
from /var/task/node_modules/jwks-rsa/src/utils.js not supported.
routes: /api/cron/purge-deleted, /api/auth/session/user, /api/health
```

## Root cause

`firebase-admin` 14.x depends on `jwks-rsa ^4.0.1`. `jwks-rsa` 4.x does `require('jose')` against `jose ^6`, which is ES-module only. That works only where Node supports `require()` of ES modules. The Vercel function runtime evidently does not, though the cause could not be confirmed from the build log: `engines: ">=20.9.0"` plus an unspecified runtime version. Locally on Node 25 the chain loads fine, which is why tests and builds stayed green.

Reproduced locally with jwks-rsa 4.0.1 under `node --no-experimental-require-module`: the exact same `ERR_REQUIRE_ESM` from `jwks-rsa/src/utils.js`.

## Fix

`package.json` `overrides`: `firebase-admin` → `jwks-rsa: 3.2.2`. jwks-rsa 3.2.2 depends on `jose ^4.15.4` (4.15.9 resolved), which ships CommonJS. firebase-admin only uses `jwks({ jwksUri, cache, requestAgent })`, `getSigningKeys()`, `.kid` and `.getPublicKey()` (`lib/utils/jwt.js`), all present in 3.x. The app's own `jose` 6 dependency is unchanged. Lockfile change is limited to the nested jwks-rsa subtree.

Verified locally: jwks-rsa 3.2.2 with require(esm) disabled fetched Google's real securetoken JWKS (2 keys, valid PEM). jwks-rsa 4.0.1 under the same flag crashed.

Regression test: `src/lib/__tests__/firebaseAdminModuleLoad.test.ts` asserts firebase-admin resolves jwks-rsa 3.x and that it loads in a child process with `--no-experimental-require-module`.

## Follow-ups

- Remove the override once jwks-rsa ships a release that loads jose with dynamic `import()` (4.1.0, the latest as of today, still uses `require`). Logged in DEFERRED_WORK.
- Consider pinning `engines.node` to a single major (Vercel warns that `>=20.9.0` auto-upgrades) so the runtime is explicit.
- Add an uptime check on `/api/health`. Better Uptime config exists (`better-uptime.yml`) but evidently isn't alerting; this outage went unnoticed for three months.
