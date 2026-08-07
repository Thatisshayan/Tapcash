# Track 1 Phase 2 — Hardening (Dependabot, Admin Auth, Test Coverage, Functions v2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close TASK-034 (Dependabot/npm-audit remediation), move the 8 `/api/admin/*` routes off ad-hoc Bearer-token checks onto a shared cookie-session admin guard (since `middleware.ts`'s matcher does not cover `/api/admin/*`), add real Jest coverage for the two cashout-adjacent routes' untested branches, and migrate `functions/src/index.ts` from `firebase-functions/v1` to `firebase-functions/v2`.

**Architecture:** Admin API routes currently each hand-roll `Authorization: Bearer <idToken>` verification with three different admin-determination strategies (`userData.isAdmin` Firestore field, `userData.admin` field via a different route, and an `ADMIN_UIDS` env allowlist) — none of them consult the `admin_session` cookie that `src/app/api/auth/session/route.ts` already mints via `jose` `SignJWT({ uid, admin: true })`. This plan adds one shared helper, `requireAdminSession()` in `src/lib/admin-session.ts`, that verifies that same `admin_session` cookie (mirroring `middleware.ts`'s `verifySession`) and replaces every route's Bearer check with it. `functions/src/index.ts` moves from the `firebase-functions/v1` namespace import to the modular `firebase-functions/v2/https`, `firebase-functions/v2/firestore`, and `firebase-functions/v2/identity` entry points (`firebase-functions` is already `^7.2.5` in `functions/package.json`, which ships v2 — no dependency bump needed, only code migration).

**Tech Stack:** Next.js 16, TypeScript, `firebase-admin` ^14.0.0, `firebase-functions` ^7.2.5, `jose` ^6.2.3, Jest.

## Global Constraints

- Do not delete any file or component without Shayan's explicit sign-off (boardroom Rule 14) — this plan only edits and adds files, never deletes.
- Branch: `agent/claude/037-track1-phase2-hardening`. Never commit to `main`.
- Every task's commit message includes `traces-to: TASK-037`, **except Task 1 (Dependabot remediation)**, whose commits trace to `traces-to: TASK-034` per the boardroom ledger (`D:\AgentDevWork\repos\OBSIDIAN-TEAM-BOARDROOM\ledger\tasks\034-tapcash-dependabot-remediation.md`, status `proposed`, priority `critical`).
- Manual remediation only — never approve or merge a Dependabot-authored PR (boardroom convention: dependency PRs from the Dependabot bot are not to be merged directly; fix the underlying package versions by hand in `package.json`/`package-lock.json` instead).
- **Baseline caveat — read before starting:** at the time this plan was written, `git log` on this repo showed only `docs(track1): add Phase 1 build-fix implementation plan` — Track 1 Phase 1's actual code changes (modular `firebase-admin` imports, Interac freeze, dummy-key removal, domain fix) have **not** been committed yet, only planned. `src/lib/firebaseAdmin.ts`, `src/app/api/admin/withdrawals/route.ts`, `src/app/api/payout/route.ts`, and `src/app/api/payouts/request/route.ts` are all still on the pre-Phase-1 `import * as admin from "firebase-admin"` namespace API as of this writing, and Interac is not yet frozen (still selectable in `payout/route.ts`'s `manualProviders` and `payouts/request/route.ts`'s `allowedMethods`). This means `npx tsc --noEmit` will **not** be globally clean when this plan starts. Every verification step in this plan is scoped with `grep` to only the files each task touches — do not treat a non-zero global `npx tsc --noEmit` exit code as this plan's failure; that global-zero gate belongs to Phase 1. If Phase 1's branch (`agent/claude/036-track1-phase1-build-fix`) has landed by the time you execute this plan, the grep-scoped checks still work unchanged.
- Every task ends with a concrete, runnable verification command and its expected output.
- Commit after each task (Shayan's standing instruction for this push) — never push/merge to `main`.

---

### Task 1: Dependabot / `npm audit` remediation (TASK-034)

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json` (via `npm install`/`npm audit fix`, not hand-edited)
- Modify: `.github/workflows/deploy.yml`

**Context:** `npm audit --json` run against the current `package-lock.json` (1463 total resolved packages) reports 17 vulnerabilities: 2 critical, 7 high, 8 moderate. The critical/high findings:

| Package | Severity | Direct? | Advisory | Fix |
|---|---|---|---|---|
| `next` | high | yes (`package.json` pins `16.2.9`) | GHSA-6gpp-xcg3-4w24 (middleware/proxy bypass), GHSA-m99w-x7hq-7vfj (DoS in Server Actions), GHSA-89xv-2m56-2m9x (SSRF in Server Actions), GHSA-68g3-v927-f742 / GHSA-4633-3j49-mh5q (cache confusion), GHSA-4c39-4ccg-62r3 (unbounded Server Action payload), GHSA-p9j2-gv94-2wf4 (SSRF via rewrites), GHSA-q8wf-6r8g-63ch (SVG image-opt DoS), GHSA-955p-x3mx-jcvp (unauthenticated Server Function disclosure) | upgrade to `next@16.3.0` |
| `tar` | critical | transitive (via `electron-builder`) | GHSA-w8wr-v893-vjvp, GHSA-23hp-3jrh-7fpw, GHSA-8x88-c5mf-7j5w, GHSA-gvwx-54wh-qm9j, GHSA-r292-9mhp-454m | `npm audit fix` resolves via parent bump |
| `websocket-driver` | critical | transitive (via `electron`/dev tooling) | GHSA-mp7j-qc5w-4988, GHSA-xv26-6w52-cph6 | `npm audit fix` resolves via parent bump |
| `undici` | high | transitive | GHSA-8xcm-r25x-g524, GHSA-4cwx-7wf7-3272, GHSA-m8rv-5g2x-5cg5, GHSA-jr45-8vmc-qm54, GHSA-v3r7-h72x-cjcm | `npm audit fix` resolves via parent bump |
| `js-yaml` | high | transitive | GHSA-52cp-r559-cp3m (quadratic CPU via merge-key chains) | `npm audit fix` resolves via parent bump |
| `fast-uri` | high | transitive | GHSA-v2hh-gcrm-f6hx, GHSA-7p8r-x3mc-p8w7, GHSA-4c8g-83qw-93j6 (host confusion) | `npm audit fix` resolves via parent bump |
| `brace-expansion` | high | transitive | GHSA-3jxr-9vmj-r5cp, GHSA-mh99-v99m-4gvg (ReDoS/OOM) | `npm audit fix` resolves via parent bump |

`firebase-admin` itself is not in the high/critical list this run (only the moderate, non-blocking `@google-cloud/storage` advisory whose only listed fix is a Firebase Admin v10 downgrade — do not take that downgrade; it would reintroduce Phase 1's modular-API work. Accept this one as residual risk per the note in Step 4).

- [ ] **Step 1: Capture the current audit baseline**

Run: `npm audit --json > /tmp/audit-before.json 2>&1 || true` (Windows/PowerShell equivalent: `npm audit --json | Out-File audit-before.json`)
Expected: file written; `npm audit` (non-JSON) shows `17 vulnerabilities (8 moderate, 7 high, 2 critical)`.

- [ ] **Step 2: Upgrade `next` directly to clear the direct/high advisories**

In `package.json`, change:
```json
    "next": "16.2.9",
```
to:
```json
    "next": "^16.3.0",
```

Then run:
```bash
npm install
```

- [ ] **Step 3: Resolve the transitive critical/high findings via `npm audit fix`**

Run:
```bash
npm audit fix
```

This resolves `tar`, `websocket-driver`, `undici`, `js-yaml`, `fast-uri`, and `brace-expansion` by bumping their parent packages (`electron-builder` and dev-tooling chains) within semver — none of these are `isSemVerMajor: true` blockers per the audit JSON's `fixAvailable` field, so no `--force` flag is needed. Do **not** pass `--force`: that flag can pull in semver-major bumps for packages this plan hasn't reviewed (e.g. `electron-builder`), which is out of scope.

- [ ] **Step 4: Re-check the audit and record residual risk**

Run: `npm audit --json`
Expected: critical count is `0` and high count is `0` (or, if `next@16.3.0` still shows any residual `high` entries tied to `postcss`/`sharp` sub-dependencies that don't have an available fix yet, that is acceptable residual risk — record it in Step 6's remediation note, do not chase a semver-major `postcss`/`sharp` bump in this task).

If any critical/high vulnerability remains with `fixAvailable: false` or `isSemVerMajor: true`, do not force-upgrade past what's needed — note it as accepted residual risk instead (Step 6).

- [ ] **Step 5: Full verification — build, lint, type-check, test (per TASK-034's acceptance criteria)**

Run: `npm run type-check`
Expected: same file set of pre-existing errors as before this task (Phase 1's baseline, per the Global Constraints caveat) — no *new* errors attributable to the `next` bump. Filter with: `npx tsc --noEmit 2>&1 | grep -i "next/"` should be empty (no Next.js-API-shape errors introduced by the version bump).

Run: `npm run lint`
Expected: exits with the same pass/fail status as on `main` before this task (no new lint errors from the dependency bump).

Run: `npx jest`
Expected: no new test failures compared to the pre-task baseline (record baseline first with `npx jest 2>&1 | tail -20` before Step 2 if you want a clean diff).

Run: `npm run build`
Expected: build completes (or fails with the same pre-existing Phase-1-scoped errors only — do not treat unrelated Phase 1 build failures as this task's regression; if the build fails specifically at a `next`-API call site that changed in 16.3.0, fix that call site here since it is a direct consequence of Step 2's upgrade).

- [ ] **Step 6: Remove `continue-on-error: true` from the security-scan steps now that they're expected to pass clean**

Read `.github/workflows/deploy.yml`. The `security` job (lines 124-140) currently has:
```yaml
      - name: Run npm audit
        run: npm audit --audit-level=high
        continue-on-error: true

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

Change the `npm audit` step to drop `continue-on-error` now that Steps 2-4 have brought the repo to zero critical/high:
```yaml
      - name: Run npm audit
        run: npm audit --audit-level=high
```

Leave the Snyk step's `continue-on-error: true` in place — Snyk requires `SNYK_TOKEN` to be configured as a repo secret, which this plan cannot verify or provision (no live secret access, per this plan's read-only-to-secrets scope), so gating the whole job on an unconfigured external scanner would break CI for reasons unrelated to this task. Add a comment above it explaining why:
```yaml
      # Snyk requires SNYK_TOKEN to be configured as a repo secret before this
      # can be a hard gate — left soft (continue-on-error) until that's confirmed.
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

- [ ] **Step 7: Write the remediation note (TASK-034 acceptance criterion: "leave behind a concise remediation note with any residual accepted risk")**

Add a new file `docs/superpowers/notes/2026-08-06-dependabot-remediation.md`:
```markdown
# TASK-034 Dependabot Remediation Note — 2026-08-06

## What was fixed
- `next`: 16.2.9 -> ^16.3.0 (direct dependency; clears 9 high-severity Next.js
  advisories: GHSA-6gpp-xcg3-4w24, GHSA-m99w-x7hq-7vfj, GHSA-89xv-2m56-2m9x,
  GHSA-68g3-v927-f742, GHSA-4633-3j49-mh5q, GHSA-4c39-4ccg-62r3,
  GHSA-p9j2-gv94-2wf4, GHSA-q8wf-6r8g-63ch, GHSA-955p-x3mx-jcvp)
- `tar`, `websocket-driver` (critical), `undici`, `js-yaml`, `fast-uri`,
  `brace-expansion` (high): resolved transitively via `npm audit fix`
  (parent-package bumps, no semver-major changes, no `--force` used).

## Residual accepted risk
- `@google-cloud/storage` (moderate, transitive via `firebase-admin`):
  the only available fix per `npm audit` is a `firebase-admin` v10 downgrade,
  which would revert Track 1 Phase 1's modular-API migration. Accepted as
  residual risk — moderate severity, not user-facing (server-side storage
  client), tracked for a future `firebase-admin` v15+ upgrade once one ships
  a patched `@google-cloud/storage` range.
- Any remaining moderate-severity findings from `npm audit fix`'s scope not
  explicitly upgraded above (e.g. `@tailwindcss/postcss`) are dev-tooling-only
  and do not ship to the production bundle; deferred to a routine dependency
  sweep.

## Verification performed
- `npm audit --json`: 0 critical, 0 high remaining (moderate count may be
  nonzero per the residual risk above — record the actual post-fix count here
  when you run it).
- `npm run type-check`, `npm run lint`, `npx jest`, `npm run build`: no new
  failures introduced by the dependency bumps (Phase 1's pre-existing
  typecheck baseline is out of this task's scope).

## Governance
- Never merge a Dependabot-authored PR directly — this remediation was done
  by hand-editing `package.json`/`package-lock.json` on this branch instead,
  per boardroom convention.

traces-to: TASK-034
```

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json .github/workflows/deploy.yml docs/superpowers/notes/2026-08-06-dependabot-remediation.md
git commit -m "fix(security): remediate npm audit critical/high findings

Upgrades next to ^16.3.0 (9 high-severity advisories) and resolves
tar/websocket-driver (critical) plus undici/js-yaml/fast-uri/brace-expansion
(high) via npm audit fix. Removes continue-on-error from the npm audit CI
step now that the repo audits clean at high+. Snyk step stays soft-gated
pending SNYK_TOKEN provisioning.

traces-to: TASK-034"
```

---

### Task 2: `src/lib/admin-session.ts` — shared cookie-session admin guard

**Files:**
- Create: `src/lib/admin-session.ts`
- Test: `src/lib/__tests__/admin-session.test.ts`

**Interfaces:**
- Consumes: `SESSION_SECRET` env var, `jwtVerify` from `jose` (same pattern as `middleware.ts`'s `verifySession`).
- Produces: `requireAdminSession(request: NextRequest): Promise<AdminSessionResult>` where `AdminSessionResult = { uid: string; email: string } | { response: NextResponse }` — every route in Task 3 imports and calls this.

**Context:** `middleware.ts`'s `config.matcher` (lines 92-101) lists `/dashboard/:path*`, `/cashout/:path*`, `/rapidoreach/:path*`, `/transactions/:path*`, `/referrals/:path*`, `/payouts/:path*`, and `/admin/:path*` — it does **not** include `/api/admin/:path*` or any `/api/*` path, confirming the prompt's premise: `/api/admin/*` routes are not protected by `middleware.ts` today. `src/app/api/auth/session/route.ts` (lines 30-35) already mints an `admin_session` cookie via `SignJWT({ uid, admin: true }).setProtectedHeader({ alg: 'HS256' })...sign(secret)` using `process.env.SESSION_SECRET`, checking `userDoc.data()?.admin !== true` before minting. This task builds the corresponding verifier.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/__tests__/admin-session.test.ts
import { NextRequest } from "next/server";
import { SignJWT } from "jose";

const SECRET = "test-admin-session-secret";

async function makeRequestWithCookie(cookieValue: string | undefined): Promise<NextRequest> {
  const headers = new Headers();
  if (cookieValue !== undefined) {
    headers.set("cookie", `admin_session=${cookieValue}`);
  }
  return new NextRequest("http://localhost/api/admin/stats", { headers });
}

async function signAdminJwt(payload: Record<string, unknown>, secret = SECRET): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode(secret));
}

describe("requireAdminSession", () => {
  const originalSecret = process.env.SESSION_SECRET;

  beforeEach(() => {
    process.env.SESSION_SECRET = SECRET;
  });

  afterEach(() => {
    process.env.SESSION_SECRET = originalSecret;
    jest.resetModules();
  });

  it("returns uid and email for a valid admin session cookie", async () => {
    const { requireAdminSession } = await import("../admin-session");
    const jwt = await signAdminJwt({ uid: "admin-uid-1", email: "admin@tapcash.online", admin: true });
    const request = await makeRequestWithCookie(jwt);

    const result = await requireAdminSession(request);

    expect("uid" in result).toBe(true);
    if ("uid" in result) {
      expect(result.uid).toBe("admin-uid-1");
      expect(result.email).toBe("admin@tapcash.online");
    }
  });

  it("rejects with 401 when no admin_session cookie is present", async () => {
    const { requireAdminSession } = await import("../admin-session");
    const request = await makeRequestWithCookie(undefined);

    const result = await requireAdminSession(request);

    expect("response" in result).toBe(true);
    if ("response" in result) {
      expect(result.response.status).toBe(401);
    }
  });

  it("rejects with 403 when the session is valid but admin claim is false", async () => {
    const { requireAdminSession } = await import("../admin-session");
    const jwt = await signAdminJwt({ uid: "user-uid-1", email: "user@tapcash.online", admin: false });
    const request = await makeRequestWithCookie(jwt);

    const result = await requireAdminSession(request);

    expect("response" in result).toBe(true);
    if ("response" in result) {
      expect(result.response.status).toBe(403);
    }
  });

  it("rejects with 401 when the JWT is signed with the wrong secret", async () => {
    const { requireAdminSession } = await import("../admin-session");
    const jwt = await signAdminJwt({ uid: "admin-uid-1", email: "a@b.com", admin: true }, "wrong-secret");
    const request = await makeRequestWithCookie(jwt);

    const result = await requireAdminSession(request);

    expect("response" in result).toBe(true);
    if ("response" in result) {
      expect(result.response.status).toBe(401);
    }
  });

  it("rejects with 500 when SESSION_SECRET is not configured", async () => {
    delete process.env.SESSION_SECRET;
    const { requireAdminSession } = await import("../admin-session");
    const request = await makeRequestWithCookie("irrelevant-value");

    const result = await requireAdminSession(request);

    expect("response" in result).toBe(true);
    if ("response" in result) {
      expect(result.response.status).toBe(500);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/__tests__/admin-session.test.ts`
Expected: FAIL — `Cannot find module '../admin-session'`.

- [ ] **Step 3: Write `src/lib/admin-session.ts`**

```typescript
// src/lib/admin-session.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

interface AdminSessionPayload {
  uid: string;
  email: string;
}

type AdminSessionResult =
  | AdminSessionPayload
  | {
      response: NextResponse;
    };

/**
 * Verifies the `admin_session` cookie minted by POST /api/auth/session.
 * This is the API-route equivalent of middleware.ts's verifySession() —
 * middleware.ts only protects page routes (its config.matcher does not
 * include /api/admin/:path*), so every /api/admin/* route must call this
 * directly instead of relying on middleware to have already checked.
 */
export async function requireAdminSession(request: NextRequest): Promise<AdminSessionResult> {
  const SESSION_SECRET = process.env.SESSION_SECRET;

  if (!SESSION_SECRET) {
    return {
      response: NextResponse.json({ error: "Server misconfigured: SESSION_SECRET not set" }, { status: 500 }),
    };
  }

  const cookieValue = request.cookies.get("admin_session")?.value;
  if (!cookieValue) {
    return {
      response: NextResponse.json({ error: "Unauthorized: Missing admin session" }, { status: 401 }),
    };
  }

  try {
    const secret = new TextEncoder().encode(SESSION_SECRET);
    const { payload } = await jwtVerify(cookieValue, secret);

    if (typeof payload.uid !== "string") {
      return {
        response: NextResponse.json({ error: "Unauthorized: Invalid admin session" }, { status: 401 }),
      };
    }

    if (payload.admin !== true) {
      return {
        response: NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 }),
      };
    }

    return {
      uid: payload.uid,
      email: typeof payload.email === "string" ? payload.email : "",
    };
  } catch {
    return {
      response: NextResponse.json({ error: "Unauthorized: Invalid or expired admin session" }, { status: 401 }),
    };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/lib/__tests__/admin-session.test.ts`
Expected: PASS, 5/5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin-session.ts src/lib/__tests__/admin-session.test.ts
git commit -m "feat(admin-auth): add cookie-session admin guard for API routes

middleware.ts's matcher does not cover /api/admin/:path*, so this adds
requireAdminSession() as the API-route equivalent, verifying the same
admin_session cookie minted by POST /api/auth/session.

traces-to: TASK-037"
```

---

### Task 3: Migrate `admin/multiplier`, `admin/fraud`, `admin/promo-analytics` from `ADMIN_UIDS` Bearer to cookie session

**Files:**
- Modify: `src/app/api/admin/multiplier/route.ts`
- Modify: `src/app/api/admin/fraud/route.ts`
- Modify: `src/app/api/admin/promo-analytics/route.ts`

**Interfaces:**
- Consumes: `requireAdminSession` from `@/lib/admin-session` (Task 2).

**Context:** These three routes share an identical local `isAdmin(request)` helper that checks `ADMIN_UIDS` (an env-var allowlist of UIDs), diverging from the five routes in Task 4 which check a Firestore `isAdmin`/`admin` field. Both mechanisms are being replaced by the same cookie-session check so there is one source of truth (`admin_session` cookie, minted only after `/api/auth/session` confirms `userDoc.data()?.admin === true`).

- [ ] **Step 1: `admin/multiplier/route.ts` — replace the `isAdmin` helper and its 3 call sites**

Replace:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

const ADMIN_UIDS = (process.env.ADMIN_UIDS || "").split(",").map((u) => u.trim()).filter(Boolean);

async function isAdmin(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.slice(7));
    return ADMIN_UIDS.includes(decoded.uid);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```
with:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { requireAdminSession } from "@/lib/admin-session";

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) return auth.response;
```

Then for the `POST` and `PATCH` handlers (lines 25-26 and 43-44 of the original file), replace:
```typescript
export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```
with:
```typescript
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) return auth.response;
```
and:
```typescript
export async function PATCH(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```
with:
```typescript
export async function PATCH(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) return auth.response;
```

(`adminAuth` import is dropped since nothing else in the file uses it — confirm with `grep -n "adminAuth" src/app/api/admin/multiplier/route.ts` returning no matches after the edit.)

- [ ] **Step 2: `admin/fraud/route.ts` — same pattern, 2 call sites (GET, POST), plus swap `decodedToken.uid`/`decodedToken.email` references to `auth.uid`/inline email**

Replace the shared Bearer block at the top of `GET` (lines 5-19 of the original):
```typescript
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (!userData?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    await adminDb.collection('admin_logs').add({
      adminId: decodedToken.uid,
      adminEmail: decodedToken.email,
```
with:
```typescript
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminSession(request);
    if ("response" in auth) return auth.response;

    await adminDb.collection('admin_logs').add({
      adminId: auth.uid,
      adminEmail: auth.email,
```

Apply the identical transformation to `POST` (original lines 99-113), and replace every remaining `decodedToken.uid` in the body of both handlers with `auth.uid`, and `decodedToken.email` with `auth.email` (grep confirms these appear at the `unflag_user`, `unblock_ip`, and standard-review branches — lines 131, 141, 146, 151, 166, 192, 201, 208, 215, 231 of the original file).

Update the import line:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
```
to:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdminSession } from '@/lib/admin-session';
```

- [ ] **Step 3: `admin/promo-analytics/route.ts` — same pattern, single GET handler**

Replace:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

const ADMIN_UIDS = (process.env.ADMIN_UIDS || "").split(",").map((u) => u.trim()).filter(Boolean);

async function isAdmin(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  try {
    const decoded = await adminAuth.verifyIdToken(auth.slice(7));
    return ADMIN_UIDS.includes(decoded.uid);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```
with:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdminSession } from "@/lib/admin-session";

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) return auth.response;
```

- [ ] **Step 4: Verify**

Run: `grep -rn "ADMIN_UIDS\|isAdmin(request)\|adminAuth.verifyIdToken" src/app/api/admin/multiplier/route.ts src/app/api/admin/fraud/route.ts src/app/api/admin/promo-analytics/route.ts`
Expected: no output (all three Bearer/ADMIN_UIDS mechanisms removed).

Run: `npx tsc --noEmit 2>&1 | grep -E "admin/multiplier|admin/fraud|admin/promo-analytics"`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/multiplier/route.ts src/app/api/admin/fraud/route.ts src/app/api/admin/promo-analytics/route.ts
git commit -m "fix(admin-auth): migrate ADMIN_UIDS Bearer routes to cookie session

multiplier, fraud, and promo-analytics used an env-var UID allowlist over
Bearer tokens; middleware.ts's matcher doesn't cover /api/admin/*, so
these now call requireAdminSession() the same as the other admin routes.

traces-to: TASK-037"
```

---

### Task 4: Migrate `admin/offers`, `admin/stats`, `admin/transactions`, `admin/users` from Firestore-field Bearer to cookie session

**Files:**
- Modify: `src/app/api/admin/offers/route.ts`
- Modify: `src/app/api/admin/stats/route.ts`
- Modify: `src/app/api/admin/transactions/route.ts`
- Modify: `src/app/api/admin/users/route.ts`

**Interfaces:**
- Consumes: `requireAdminSession` from `@/lib/admin-session` (Task 2).

**Context:** These four routes each repeat the same block per HTTP method (`stats` has 1, `offers`/`transactions` have 3, `users` has 3 — 10 call sites total) checking `Authorization: Bearer` then `adminDb.collection('users').doc(decodedToken.uid).get()` then `userData?.isAdmin`. That Firestore-field check duplicates what `POST /api/auth/session` already verifies once (`userDoc.data()?.admin !== true`) before minting the cookie — this task removes the per-request Firestore round-trip in favor of the cookie already carrying the verified claim.

- [ ] **Step 1: `admin/stats/route.ts` — single GET handler**

Replace (original lines 1-31, keeping everything from `// Log admin action` onward as-is except renaming variables):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check if user is admin
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (!userData?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Log admin action
    await adminDb.collection('admin_logs').add({
      adminId: decodedToken.uid,
      adminEmail: decodedToken.email,
      action: 'view_stats',
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
```
with:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdminSession } from '@/lib/admin-session';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminSession(request);
    if ("response" in auth) return auth.response;

    // Log admin action
    await adminDb.collection('admin_logs').add({
      adminId: auth.uid,
      adminEmail: auth.email,
      action: 'view_stats',
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
```

- [ ] **Step 2: `admin/offers/route.ts` — apply the same block replacement to GET, POST, PATCH, and DELETE**

Each of the 4 handlers starts with the identical Bearer-check block (original lines 6-20, 63-77, 125-139, 190-204). Replace each occurrence of:
```typescript
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (!userData?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
```
with:
```typescript
    const auth = await requireAdminSession(request);
    if ("response" in auth) return auth.response;
```
Then replace every remaining `decodedToken.uid` in that handler's body with `auth.uid`, and `decodedToken.email` with `auth.email` (each handler references `decodedToken.uid` in its `admin_logs` write and, for POST, in `createdBy: decodedToken.uid`; for PATCH, `updatedBy: decodedToken.uid`).

Update the import line:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
```
to:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { requireAdminSession } from '@/lib/admin-session';
```

- [ ] **Step 3: `admin/transactions/route.ts` — same pattern, GET and POST (original lines 5-20, 71-86)**

Apply the identical block replacement as Step 2, then replace remaining `decodedToken.uid`/`decodedToken.email` references (in `admin_logs` writes and `approvedBy`/`rejectedBy`/`refundedBy` fields) with `auth.uid`/`auth.email`. Same import-line change as Step 2.

- [ ] **Step 4: `admin/users/route.ts` — same pattern, GET, PATCH, and POST (original lines 5-20, 60-74, 109-123)**

Apply the identical block replacement, then replace remaining `decodedToken.uid`/`decodedToken.email` references (in `admin_logs` writes and `actionBy`/`adjustedBy` fields) with `auth.uid`/`auth.email`. Same import-line change as Step 2.

- [ ] **Step 5: Verify**

Run: `grep -rn "authHeader\|adminAuth.verifyIdToken\|decodedToken" src/app/api/admin/offers/route.ts src/app/api/admin/stats/route.ts src/app/api/admin/transactions/route.ts src/app/api/admin/users/route.ts`
Expected: no output (all Bearer-token and `decodedToken` references removed).

Run: `npx tsc --noEmit 2>&1 | grep -E "admin/offers|admin/stats|admin/transactions|admin/users"`
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/offers/route.ts src/app/api/admin/stats/route.ts src/app/api/admin/transactions/route.ts src/app/api/admin/users/route.ts
git commit -m "fix(admin-auth): migrate Firestore-field Bearer routes to cookie session

offers, stats, transactions, and users each re-verified a Bearer ID token
and re-read the caller's isAdmin Firestore field on every request; now
they call requireAdminSession() once, consistent with the other admin
routes and with what POST /api/auth/session already verified when it
minted the cookie.

traces-to: TASK-037"
```

---

### Task 5: Migrate `admin/withdrawals/route.ts` from Bearer to cookie session (distinct pattern — has a shared `requireAdmin` wrapper)

**Files:**
- Modify: `src/app/api/admin/withdrawals/route.ts`

**Interfaces:**
- Consumes: `requireAdminSession` from `@/lib/admin-session` (Task 2).

**Context:** Unlike the other 7 routes, `admin/withdrawals/route.ts` already factors its Bearer check into a local `requireAdmin(request)` helper (original lines 7-22) that returns `{ error: NextResponse } | { uid, email }` — the same discriminated-union shape `requireAdminSession` uses, just Bearer-token-sourced instead of cookie-sourced. This file also still uses the pre-modular `import * as admin from "firebase-admin"` (per this plan's Global Constraints baseline caveat, Phase 1 has not landed yet) — this task only touches the auth mechanism, not the `admin.firestore.Timestamp`/`admin.firestore.FieldValue` call sites; those remain Phase 1's scope.

- [ ] **Step 1: Replace the `requireAdmin` helper**

Replace:
```typescript
import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { sendPayoutApprovedEmail, sendPayoutRejectedEmail, sendPayoutSentEmail } from "@/lib/email";
import { logAdminAction } from "@/lib/audit";

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 }) } as const;
  }

  const idToken = authHeader.split("Bearer ")[1];
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();

  if (!userDoc.exists || !userDoc.data()?.isAdmin) {
    return { error: NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 }) } as const;
  }

  return { uid: decodedToken.uid, email: decodedToken.email || userDoc.data()?.email || null } as const;
}
```
with:
```typescript
import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { sendPayoutApprovedEmail, sendPayoutRejectedEmail, sendPayoutSentEmail } from "@/lib/email";
import { logAdminAction } from "@/lib/audit";
import { requireAdminSession } from "@/lib/admin-session";

async function requireAdmin(request: NextRequest) {
  const auth = await requireAdminSession(request);
  if ("response" in auth) {
    return { error: auth.response } as const;
  }
  return { uid: auth.uid, email: auth.email || null } as const;
}
```

(The two call sites — `GET`'s `const auth = await requireAdmin(request); if ("error" in auth) return auth.error;` at original line 26, and `POST`'s equivalent at original line 69 — need no change, since `requireAdmin`'s return shape (`{ error } | { uid, email }`) is preserved. Leave the `admin.firestore.Timestamp`/`admin.firestore.FieldValue` call sites and the `import * as admin from "firebase-admin";` line exactly as they are — that migration is Phase 1's scope, not this task's.)

- [ ] **Step 2: Verify**

Run: `grep -n "authHeader\|Authorization\|admin.auth().verifyIdToken" src/app/api/admin/withdrawals/route.ts`
Expected: no output (the only remaining `admin.` references are `admin.firestore.Timestamp`/`admin.firestore.FieldValue`, which are Phase 1's scope).

Run: `npx tsc --noEmit 2>&1 | grep "admin/withdrawals" | grep -v "admin.firestore"`
Expected: no output (any remaining errors in this file should only be the pre-existing `admin.firestore.*` namespace-API errors Phase 1 owns — if you see a *new* error unrelated to `admin.firestore`, fix it; it's a regression from this task's edit).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/withdrawals/route.ts
git commit -m "fix(admin-auth): migrate withdrawals route to cookie session

requireAdmin() now delegates to requireAdminSession() instead of doing its
own Bearer-token verifyIdToken + Firestore isAdmin lookup. The
admin.firestore.* namespace-API call sites in this file are untouched —
that migration belongs to Track 1 Phase 1.

traces-to: TASK-037"
```

---

### Task 6: Cashout route test coverage — `payout/route.ts`

**Files:**
- Modify: `src/app/api/payout/__tests__/route.test.ts`

**Context:** The existing test file only tests two hand-copied pure functions (`coinsToDollars`, `validateProvider`) that are re-declared inline in the test file rather than imported from the route — it does not exercise `POST /api/payout` itself at all, so there is zero coverage of auth, rate limiting, idempotency, or the (currently unimplemented — Phase 1's scope) Interac-frozen 400 path. This task adds real route-level tests by importing the actual handler and mocking its dependencies, following the mocking style already used in `src/lib/__tests__/payout-flow.test.ts` (check that file's `jest.mock('@/lib/firebaseAdmin', ...)` pattern before writing these — reuse the same mock shape for `adminDb`/`adminAuth` so both test files stay consistent). The new tests target genuine gaps: missing/invalid Bearer token, non-admin caller, malformed body, and an unknown `provider` value being rejected before any Firestore write is attempted.

- [ ] **Step 1: Add route-level tests to the existing file**

Append to `src/app/api/payout/__tests__/route.test.ts` (keep the existing `coinsToDollars`/`validateProvider` describe blocks above this addition unchanged):

```typescript
describe("POST /api/payout — request validation", () => {
  const verifyIdToken = jest.fn();
  const docGet = jest.fn();
  const docUpdate = jest.fn();
  const collectionAdd = jest.fn();
  const runTransaction = jest.fn();

  jest.mock("@/lib/firebaseAdmin", () => ({
    adminDb: {
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({ get: docGet, update: docUpdate })),
        add: collectionAdd,
      })),
      runTransaction: (fn: (t: unknown) => unknown) => runTransaction(fn),
    },
    adminAuth: {
      verifyIdToken,
    },
  }));

  jest.mock("@/lib/audit", () => ({
    logAdminAction: jest.fn(),
  }));

  jest.mock("@/lib/interac", () => ({
    createInteracTransfer: jest.fn(),
  }));

  jest.mock("@/lib/paypal", () => ({
    createPayPalPayout: jest.fn(),
  }));

  jest.mock("@/lib/tremendous", () => ({
    createTremendousOrder: jest.fn(),
  }));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects a request with no Authorization header with 401", async () => {
    const { POST } = await import("../route");
    const request = new Request("http://localhost/api/payout", {
      method: "POST",
      body: JSON.stringify({ cashoutRequestId: "abc" }),
    });

    const response = await POST(request as unknown as import("next/server").NextRequest);

    expect(response.status).toBe(401);
  });

  it("rejects a request with a malformed Authorization header with 401", async () => {
    const { POST } = await import("../route");
    const request = new Request("http://localhost/api/payout", {
      method: "POST",
      headers: { Authorization: "NotBearer sometoken" },
      body: JSON.stringify({ cashoutRequestId: "abc" }),
    });

    const response = await POST(request as unknown as import("next/server").NextRequest);

    expect(response.status).toBe(401);
  });

  it("rejects a request with an invalid/expired ID token with 401", async () => {
    verifyIdToken.mockRejectedValue(new Error("Firebase ID token has expired"));
    const { POST } = await import("../route");
    const request = new Request("http://localhost/api/payout", {
      method: "POST",
      headers: { Authorization: "Bearer expired-token" },
      body: JSON.stringify({ cashoutRequestId: "abc" }),
    });

    const response = await POST(request as unknown as import("next/server").NextRequest);

    expect(response.status).toBe(401);
  });

  it("rejects a caller whose Firestore user doc is not an admin with 403", async () => {
    verifyIdToken.mockResolvedValue({ uid: "regular-user-uid", email: "user@tapcash.online" });
    docGet.mockResolvedValue({ exists: true, data: () => ({ isAdmin: false }) });
    const { POST } = await import("../route");
    const request = new Request("http://localhost/api/payout", {
      method: "POST",
      headers: { Authorization: "Bearer valid-non-admin-token" },
      body: JSON.stringify({ cashoutRequestId: "abc" }),
    });

    const response = await POST(request as unknown as import("next/server").NextRequest);

    expect(response.status).toBe(403);
  });

  it("rejects a request missing cashoutRequestId with 400", async () => {
    verifyIdToken.mockResolvedValue({ uid: "admin-uid", email: "admin@tapcash.online" });
    docGet.mockResolvedValue({ exists: true, data: () => ({ isAdmin: true }) });
    const { POST } = await import("../route");
    const request = new Request("http://localhost/api/payout", {
      method: "POST",
      headers: { Authorization: "Bearer valid-admin-token" },
      body: JSON.stringify({}),
    });

    const response = await POST(request as unknown as import("next/server").NextRequest);

    expect(response.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails or passes against current behavior, and record which**

Run: `npx jest src/app/api/payout/__tests__/route.test.ts`
Expected: the pre-existing `coinsToDollars`/`validateProvider` tests still pass. The new `describe("POST /api/payout — request validation")` block's outcome depends on the route's actual current implementation — run it and read the output. If any of the 5 new tests fail because the route's actual status codes differ from what's asserted (e.g. it returns 500 instead of 400 for a missing field, because the route hasn't null-checked that field), that is a genuine gap this task surfaces — do not weaken the assertion to match a bug. Instead, fix the specific status-code mismatch in `src/app/api/payout/route.ts` to return the correct code (400 for validation, 401 for auth, 403 for authorization), matching the pattern already used elsewhere in the same file for its other validation branches.

- [ ] **Step 3: Re-run until green**

Run: `npx jest src/app/api/payout/__tests__/route.test.ts`
Expected: PASS, all tests (pre-existing 11 + new 5 = 16).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/payout/__tests__/route.test.ts src/app/api/payout/route.ts
git commit -m "test(payout): add route-level auth and validation coverage

Previous test file only covered two hand-copied pure functions and never
exercised POST handler. Adds auth-header, invalid-token, non-admin, and
missing-field coverage; fixes any status-code mismatches surfaced.

traces-to: TASK-037"
```

---

### Task 7: Cashout route test coverage — `payouts/request/route.ts`

**Files:**
- Modify: `src/app/api/payouts/request/__tests__/route.test.ts`

**Context:** Same gap as Task 6 — the existing file only tests hand-copied pure helpers (`getDestinationLockId`, `validateCashoutAmount`, `validateMethod`), never the actual `POST` handler. This route is the user-facing cashout request path, so its untested surface (rate limiting, idempotency-key interaction via `src/lib/idempotency.ts`, and the daily-cashout-count `Timestamp.fromDate(todayStart)` gate at original line ~124) matters more than `payout/route.ts`'s admin-only path. This task adds coverage for the request-level validation gaps: missing auth, an amount below the 2000-coin minimum, and an unrecognized `method`.

- [ ] **Step 1: Add route-level tests to the existing file**

Append to `src/app/api/payouts/request/__tests__/route.test.ts` (keep the existing pure-helper describe blocks unchanged):

```typescript
describe("POST /api/payouts/request — validation", () => {
  const verifyIdToken = jest.fn();
  const docGet = jest.fn();
  const docUpdate = jest.fn();
  const collectionWhere = jest.fn();
  const collectionAdd = jest.fn();

  jest.mock("@/lib/firebaseAdmin", () => ({
    adminDb: {
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({ get: docGet, update: docUpdate })),
        where: collectionWhere.mockReturnThis
          ? collectionWhere.mockReturnThis()
          : collectionWhere,
        add: collectionAdd,
      })),
    },
    adminAuth: {
      verifyIdToken,
    },
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    collectionWhere.mockReturnValue({
      where: collectionWhere,
      get: jest.fn().mockResolvedValue({ empty: true, docs: [], size: 0 }),
    });
  });

  it("rejects a request with no Authorization header with 401", async () => {
    const { POST } = await import("../route");
    const request = new Request("http://localhost/api/payouts/request", {
      method: "POST",
      body: JSON.stringify({ amountCoins: 2000, method: "paypal", destination: "user@example.com" }),
    });

    const response = await POST(request as unknown as import("next/server").NextRequest);

    expect(response.status).toBe(401);
  });

  it("rejects a request below the 2000-coin minimum with 400", async () => {
    verifyIdToken.mockResolvedValue({ uid: "user-uid-1", email: "user@tapcash.online", email_verified: true });
    docGet.mockResolvedValue({ exists: true, data: () => ({ balance: 5000 }) });
    const { POST } = await import("../route");
    const request = new Request("http://localhost/api/payouts/request", {
      method: "POST",
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ amountCoins: 500, method: "paypal", destination: "user@example.com" }),
    });

    const response = await POST(request as unknown as import("next/server").NextRequest);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("2,000");
  });

  it("rejects an unrecognized payout method with 400", async () => {
    verifyIdToken.mockResolvedValue({ uid: "user-uid-1", email: "user@tapcash.online", email_verified: true });
    docGet.mockResolvedValue({ exists: true, data: () => ({ balance: 50000 }) });
    const { POST } = await import("../route");
    const request = new Request("http://localhost/api/payouts/request", {
      method: "POST",
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ amountCoins: 2000, method: "bank_transfer", destination: "user@example.com" }),
    });

    const response = await POST(request as unknown as import("next/server").NextRequest);

    expect(response.status).toBe(400);
  });

  it("rejects an unverified email with 403", async () => {
    verifyIdToken.mockResolvedValue({ uid: "user-uid-1", email: "user@tapcash.online", email_verified: false });
    const { POST } = await import("../route");
    const request = new Request("http://localhost/api/payouts/request", {
      method: "POST",
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ amountCoins: 2000, method: "paypal", destination: "user@example.com" }),
    });

    const response = await POST(request as unknown as import("next/server").NextRequest);

    expect(response.status).toBe(403);
  });
});
```

- [ ] **Step 2: Run and reconcile against actual behavior**

Run: `npx jest src/app/api/payouts/request/__tests__/route.test.ts`
Expected: the pre-existing pure-helper tests still pass. For the 4 new tests, read the actual output. As in Task 6 Step 2, if the route's real status codes differ (for example if email-verification is checked by a shared `requireVerifiedUser` call from `@/lib/verified-user` that returns a different code, or the route returns 429 instead of 403 for some other reason), do not adjust the assertions to paper over a real inconsistency — either the test's expectation is wrong (fix the test to match documented/intended behavior) or the route has a bug (fix the route). Use `grep -n "email_verified\|status: 4" src/app/api/payouts/request/route.ts` to see the route's actual status codes before deciding which side to fix.

- [ ] **Step 3: Re-run until green**

Run: `npx jest src/app/api/payouts/request/__tests__/route.test.ts`
Expected: PASS, all tests (pre-existing 12 + new 4 = 16).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/payouts/request/__tests__/route.test.ts src/app/api/payouts/request/route.ts
git commit -m "test(payouts-request): add route-level auth and validation coverage

Previous test file only covered three hand-copied pure functions and never
exercised POST handler. Adds auth, below-minimum-amount, unknown-method,
and unverified-email coverage; fixes any status-code mismatches surfaced.

traces-to: TASK-037"
```

---

### Task 8: `src/lib/firebaseAdmin.ts` test coverage

**Files:**
- Test: `src/lib/__tests__/firebaseAdmin.test.ts`

**Context:** No test file exists for `firebaseAdmin.ts` today (confirmed via `find src/lib/__tests__ -type f`). It exports `firebaseAdminReady`, `firebaseAdminMode`, `firebaseAdminError`, `adminDb`, `adminAuth` as module-level state computed at import time based on `FIREBASE_PRIVATE_KEY`/`FIREBASE_CLIENT_EMAIL`/`FIREBASE_PROJECT_ID`/`NODE_ENV`. Because that state is computed once at module load, each scenario needs `jest.resetModules()` + a fresh `import()` inside an isolated env, following the same `jest.resetModules()` pattern this plan already uses in Task 2's `admin-session.test.ts`.

- [ ] **Step 1: Write the test file**

```typescript
// src/lib/__tests__/firebaseAdmin.test.ts

describe("firebaseAdmin module initialization", () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    jest.resetModules();
  });

  it("initializes in fallback mode in a non-production env with no credentials configured", async () => {
    process.env.NODE_ENV = "test";
    delete process.env.FIREBASE_PRIVATE_KEY;
    delete process.env.FIREBASE_CLIENT_EMAIL;
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    jest.resetModules();
    const mod = await import("../firebaseAdmin");

    expect(mod.firebaseAdminMode).toBe("fallback");
    expect(mod.firebaseAdminReady).toBe(false);
    expect(mod.firebaseAdminError).toContain("Missing");
  });

  it("exposes adminDb and adminAuth even in fallback mode (module stays importable)", async () => {
    process.env.NODE_ENV = "test";
    delete process.env.FIREBASE_PRIVATE_KEY;
    delete process.env.FIREBASE_CLIENT_EMAIL;
    delete process.env.FIREBASE_PROJECT_ID;

    jest.resetModules();
    const mod = await import("../firebaseAdmin");

    expect(mod.adminDb).toBeDefined();
    expect(mod.adminAuth).toBeDefined();
  });

  it("sets firebaseAdminError with a descriptive message when credentials are partially configured", async () => {
    process.env.NODE_ENV = "test";
    process.env.FIREBASE_CLIENT_EMAIL = "test@example.iam.gserviceaccount.com";
    delete process.env.FIREBASE_PRIVATE_KEY;
    delete process.env.FIREBASE_PROJECT_ID;

    jest.resetModules();
    const mod = await import("../firebaseAdmin");

    expect(mod.firebaseAdminMode).toBe("fallback");
    expect(mod.firebaseAdminError).toMatch(/FIREBASE_PRIVATE_KEY|FIREBASE_PROJECT_ID/);
  });
});
```

- [ ] **Step 2: Run test**

Run: `npx jest src/lib/__tests__/firebaseAdmin.test.ts`
Expected: PASS, 3/3 tests. If a test fails because the current pre-Phase-1 namespace-API version of `firebaseAdmin.ts` (`admin.apps.length` / `admin.initializeApp` — see this plan's Global Constraints baseline caveat) behaves slightly differently than the modular version the assertions above assume, adjust the assertion to match the file as it currently exists on this branch, not the Phase-1-modularized version — this task tests current behavior, it does not perform the Phase 1 migration.

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/firebaseAdmin.test.ts
git commit -m "test(firebaseAdmin): add module-init coverage for credential fallback

No test file existed for firebaseAdmin.ts. Covers the no-credentials
fallback path, adminDb/adminAuth staying importable, and the
partial-credentials error message.

traces-to: TASK-037"
```

---

### Task 9: `middleware.ts` test coverage

**Files:**
- Test: `src/__tests__/middleware.test.ts`

**Context:** No test file exists for `middleware.ts` today. `jest.config.js`'s `testEnvironment` is `jest-environment-jsdom` and there is no coverage-threshold config in `jest.config.js` (confirmed by reading the file — no `collectCoverage`/`coverageThreshold` keys), so this task is pure gap-filling, not chasing a coverage percentage. Cover the branches that matter for security: unauthenticated access to an `AUTH_ROUTES` path redirects to `/auth/signin`, unauthenticated access to an `ADMIN_ROUTES` path also redirects, a non-admin session on an admin path redirects to `/dashboard`, and a route outside both lists passes through untouched.

- [ ] **Step 1: Write the test file**

```typescript
// src/__tests__/middleware.test.ts
import { NextRequest } from "next/server";
import { SignJWT } from "jose";

const SECRET = "test-middleware-secret";

async function signSessionJwt(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(new TextEncoder().encode(SECRET));
}

function requestFor(path: string, cookieValue?: string): NextRequest {
  const headers = new Headers();
  if (cookieValue) headers.set("cookie", `session=${cookieValue}`);
  return new NextRequest(`http://localhost${path}`, { headers });
}

describe("middleware", () => {
  const ORIGINAL_SECRET = process.env.SESSION_SECRET;
  const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.SESSION_SECRET = SECRET;
    process.env.NODE_ENV = "production";
    jest.resetModules();
  });

  afterEach(() => {
    process.env.SESSION_SECRET = ORIGINAL_SECRET;
    process.env.NODE_ENV = ORIGINAL_NODE_ENV;
  });

  it("passes through a public route with no session cookie", async () => {
    const { middleware } = await import("../../middleware");
    const response = await middleware(requestFor("/"));

    expect(response.status).toBe(200);
  });

  it("redirects to /auth/signin for an AUTH_ROUTES path with no session cookie", async () => {
    const { middleware } = await import("../../middleware");
    const response = await middleware(requestFor("/dashboard"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/auth/signin");
  });

  it("redirects to /auth/signin for an ADMIN_ROUTES path with no session cookie", async () => {
    const { middleware } = await import("../../middleware");
    const response = await middleware(requestFor("/admin"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/auth/signin");
  });

  it("redirects a non-admin session away from an admin path to /dashboard", async () => {
    const jwt = await signSessionJwt({ uid: "user-1", email: "user@tapcash.online", admin: false });
    const { middleware } = await import("../../middleware");
    const response = await middleware(requestFor("/admin", jwt));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/dashboard");
  });

  it("allows an admin session through to an admin path", async () => {
    const jwt = await signSessionJwt({ uid: "admin-1", email: "admin@tapcash.online", admin: true });
    const { middleware } = await import("../../middleware");
    const response = await middleware(requestFor("/admin", jwt));

    expect(response.status).toBe(200);
  });

  it("allows a valid non-admin session through to a non-admin AUTH_ROUTES path", async () => {
    const jwt = await signSessionJwt({ uid: "user-1", email: "user@tapcash.online", admin: false });
    const { middleware } = await import("../../middleware");
    const response = await middleware(requestFor("/dashboard", jwt));

    expect(response.status).toBe(200);
  });

  it("rejects an invalid session JWT signed with the wrong secret", async () => {
    const wrongSecretJwt = await new SignJWT({ uid: "user-1", email: "a@b.com" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(new TextEncoder().encode("wrong-secret"));
    const { middleware } = await import("../../middleware");
    const response = await middleware(requestFor("/dashboard", wrongSecretJwt));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/auth/signin");
  });
});
```

- [ ] **Step 2: Run test**

Run: `npx jest src/__tests__/middleware.test.ts`
Expected: PASS, 7/7 tests.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/middleware.test.ts
git commit -m "test(middleware): add session-verification and route-matching coverage

No test file existed for middleware.ts. Covers public passthrough, auth
and admin route redirects, admin-claim enforcement, and JWT signature
rejection.

traces-to: TASK-037"
```

---

### Task 10: Firebase Functions v1 -> v2 migration

**Files:**
- Modify: `functions/src/index.ts`

**Context:** `functions/package.json` already declares `"firebase-functions": "^7.2.5"`, which ships both the v1 namespace (`firebase-functions/v1`, currently imported) and the v2 modular API — no dependency version bump is needed, only the code migration. The file currently exports 6 functions: 1 auth `onCreate` trigger (`functions.auth.user().onCreate`), 2 `onCall` functions (`completeTask`, `requestPayout`), and 3 Firestore triggers (`onOfferApproved` via `.onCreate`, `onCashoutSent` and `onCashoutRejected` via `.onUpdate`). The v1 `functions.auth.user().onCreate` trigger has **no direct v2 replacement** — Firebase's v2 SDK replaces it with `firebase-functions/v2/identity`'s `beforeUserCreated` (a blocking function that runs *before* the user is created and can reject signup, not an async post-creation trigger) since the async post-creation Auth trigger was deprecated in v2 in favor of that blocking-function model. Since `onUserCreated` here only writes a Firestore profile document (non-blocking, side-effect-only), the correct v2-equivalent pattern is to switch this specific trigger to a Firestore-based approach is out of scope for a 1:1 API swap — instead, this task uses `beforeUserCreated` from `firebase-functions/v2/identity`, which does run at signup time and can perform the same Firestore write, with the difference that it runs synchronously in the signup flow (documented in Step 1 below) rather than as a fire-and-forget trigger. This is the closest verified v2 primitive for "run code when a new Auth user is created" — there is no v2 non-blocking `onCreate`-equivalent for Auth users as of `firebase-functions` v7.

- [ ] **Step 1: Replace imports and the auth trigger**

Replace the top of the file:
```typescript
import * as functions from "firebase-functions/v1";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp();

const db = getFirestore();
```
with:
```typescript
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { beforeUserCreated } from "firebase-functions/v2/identity";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

initializeApp();

const db = getFirestore();
```

Replace the auth trigger (original lines 47-60):
```typescript
// 1. Auth Hook: Initialize user profile on new signup
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const userRef = db.collection("users").doc(user.uid);
  const batch = db.batch();

  batch.set(userRef, {
      email: user.email,
      createdAt: FieldValue.serverTimestamp(),
      lastLogin: FieldValue.serverTimestamp(),
    });

  await batch.commit();
  console.log(`User ${user.uid} created.`);
});
```
with:
```typescript
// 1. Auth Hook: Initialize user profile on new signup.
// v2 has no direct non-blocking onCreate-equivalent for Auth users — the
// closest v2 primitive is beforeUserCreated (firebase-functions/v2/identity),
// a blocking function that runs synchronously during signup and can reject
// it by throwing. It runs before the Auth user record is fully committed,
// so this write happens inline with the signup flow rather than as an
// async fire-and-forget trigger the way the v1 version did — that is an
// intentional, documented behavior change of this migration, not a bug.
export const onUserCreated = beforeUserCreated(async (event) => {
  const user = event.data;
  if (!user) return;

  const userRef = db.collection("users").doc(user.uid);
  const batch = db.batch();

  batch.set(userRef, {
    email: user.email,
    createdAt: FieldValue.serverTimestamp(),
    lastLogin: FieldValue.serverTimestamp(),
  });

  await batch.commit();
  console.log(`User ${user.uid} created.`);
});
```

- [ ] **Step 2: Migrate `completeTask` to `onCall` from `firebase-functions/v2/https`**

Replace:
```typescript
// 2. Task Completion (Callable from client for MVP, eventually from Webhook)
export const completeTask = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  const { taskId, offerId, rewardCents } = data;
  if (!taskId || !offerId || !rewardCents || rewardCents <= 0) {
    throw new functions.https.HttpsError("invalid-argument", "Missing task data.");
  }

  const uid = context.auth.uid;
```
with:
```typescript
// 2. Task Completion (Callable from client for MVP, eventually from Webhook)
export const completeTask = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  const { taskId, offerId, rewardCents } = request.data as {
    taskId?: string;
    offerId?: string;
    rewardCents?: number;
  };
  if (!taskId || !offerId || !rewardCents || rewardCents <= 0) {
    throw new HttpsError("invalid-argument", "Missing task data.");
  }

  const uid = request.auth.uid;
```

Then in the body, replace the two remaining `functions.https.HttpsError` references (in the transaction's `already-exists` throw, and the `catch` block's `instanceof`/rethrow):
```typescript
      if (taskDoc.exists && taskDoc.data()?.status === "completed") {
        throw new functions.https.HttpsError("already-exists", "Task already completed.");
      }
```
becomes:
```typescript
      if (taskDoc.exists && taskDoc.data()?.status === "completed") {
        throw new HttpsError("already-exists", "Task already completed.");
      }
```
and:
```typescript
  } catch (error: any) {
    console.error("Error in completeTask:", error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", error.message || "Failed to complete task");
  }
});
```
becomes:
```typescript
  } catch (error: any) {
    console.error("Error in completeTask:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", error.message || "Failed to complete task");
  }
});
```

- [ ] **Step 3: Migrate `requestPayout` to `onCall`, same pattern**

Replace:
```typescript
// 3. Request Payout (Callable)
export const requestPayout = functions.https.onCall(async (data: any, context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  }

  const { amountCents, method, payoutAddress } = data;
  if (!amountCents || amountCents <= 0 || !payoutAddress) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid payout request.");
  }

  const uid = context.auth.uid;
```
with:
```typescript
// 3. Request Payout (Callable)
export const requestPayout = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  const { amountCents, method, payoutAddress } = request.data as {
    amountCents?: number;
    method?: string;
    payoutAddress?: string;
  };
  if (!amountCents || amountCents <= 0 || !payoutAddress) {
    throw new HttpsError("invalid-argument", "Invalid payout request.");
  }

  const uid = request.auth.uid;
```

Then replace the two remaining `functions.https.HttpsError` references in this function's body (the `failed-precondition` throw inside the transaction, and the `catch` block):
```typescript
      if (currentBalance < amountCents) {
        throw new functions.https.HttpsError("failed-precondition", "Insufficient funds.");
      }
```
becomes:
```typescript
      if (currentBalance < amountCents) {
        throw new HttpsError("failed-precondition", "Insufficient funds.");
      }
```
and:
```typescript
  } catch (error: any) {
    console.error("Error in requestPayout:", error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", error.message || "Failed to process payout");
  }
});
```
becomes:
```typescript
  } catch (error: any) {
    console.error("Error in requestPayout:", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", error.message || "Failed to process payout");
  }
});
```

- [ ] **Step 4: Migrate the 3 Firestore triggers to `onDocumentCreated`/`onDocumentUpdated` from `firebase-functions/v2/firestore`**

Replace `onOfferApproved`:
```typescript
// 4. Push notification on offer approval (ledger transaction status change to approved)
export const onOfferApproved = functions.firestore
  .document("ledger_transactions/{transactionId}")
  .onCreate(async (snap) => {
    const data = snap.data();
    if (!data || data.type !== "approved_credit" || data.status !== "approved") return;
```
with:
```typescript
// 4. Push notification on offer approval (ledger transaction status change to approved)
export const onOfferApproved = onDocumentCreated("ledger_transactions/{transactionId}", async (event) => {
  const snap = event.data;
  const data = snap?.data();
  if (!data || data.type !== "approved_credit" || data.status !== "approved") return;
```
and close the function's braces to match the new arrow-function-argument form (the v1 version closed with `});` after `.onCreate(async (snap) => { ... });`; the v2 version closes with a single `});` after `onDocumentCreated(..., async (event) => { ... });` — the body in between, from `const uid = data.userId;` through the final `);` of `Promise.all(...)`, is unchanged).

Replace `onCashoutSent`:
```typescript
// 5. Push notification on cashout sent
export const onCashoutSent = functions.firestore
  .document("cashout_requests/{requestId}")
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();
    if (!before || !after) return;
```
with:
```typescript
// 5. Push notification on cashout sent
export const onCashoutSent = onDocumentUpdated("cashout_requests/{requestId}", async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after) return;
```
(the rest of the body — from `if (before.status !== "pending_review" ...` through the closing `Promise.all(...)` — is unchanged; close with a single `});`).

Replace `onCashoutRejected`, same pattern:
```typescript
// 6. Push notification on cashout rejected
export const onCashoutRejected = functions.firestore
  .document("cashout_requests/{requestId}")
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();
    if (!before || !after) return;
```
with:
```typescript
// 6. Push notification on cashout rejected
export const onCashoutRejected = onDocumentUpdated("cashout_requests/{requestId}", async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after) return;
```

- [ ] **Step 5: Type-check the functions package**

Run: `cd functions && npx tsc --noEmit`
Expected: no output / exit 0. If v2 event typing surfaces a strict-null error on `event.data` (since `event.data` is typed optional for `onDocumentCreated`/`onDocumentUpdated` in v2, unlike v1's `snap`/`change` which were always present), add the minimal null-guard TypeScript flags — for example if `onOfferApproved`'s `data.userId`/`data.amountCoins` access needs `data` to be definitely non-null past the early `if (!data ...) return;` check, that guard already narrows it; if the compiler still complains inside a nested closure, hoist the narrowed value to a local `const` before the closure (e.g. `const uid = data.userId;` is already doing this in the existing body — no change needed there).

- [ ] **Step 6: Verify with the local emulator build**

Run: `cd functions && npm run build`
Expected: `tsc` compiles cleanly into `functions/lib/`, no errors.

- [ ] **Step 7: Commit**

```bash
git add functions/src/index.ts
git commit -m "feat(functions): migrate v1 to v2 API

completeTask and requestPayout move to onCall from firebase-functions/v2/https.
onOfferApproved, onCashoutSent, onCashoutRejected move to
onDocumentCreated/onDocumentUpdated from firebase-functions/v2/firestore.
onUserCreated moves to beforeUserCreated from firebase-functions/v2/identity
(v2's closest primitive to v1's non-blocking auth onCreate trigger — this
one runs synchronously during signup instead of as a fire-and-forget
trigger, a documented behavior change). firebase-functions was already
^7.2.5, which ships v2 — no dependency bump needed.

traces-to: TASK-037"
```

---

### Task 11: Final verification and phase close-out

**Files:** none (verification only)

- [ ] **Step 1: Confirm no Bearer-token admin auth remains**

Run: `grep -rln "authHeader?.startsWith('Bearer" src/app/api/admin/`
Expected: no output (all 8 admin routes migrated to `requireAdminSession`).

- [ ] **Step 2: Confirm the Dependabot remediation holds**

Run: `npm audit --json`
Expected: `metadata.vulnerabilities.critical` is `0` and `metadata.vulnerabilities.high` is `0` (moderate residual risk documented in `docs/superpowers/notes/2026-08-06-dependabot-remediation.md` is acceptable).

- [ ] **Step 3: Run the full test suite for every file this plan touched or added**

Run:
```bash
npx jest src/lib/__tests__/admin-session.test.ts src/lib/__tests__/firebaseAdmin.test.ts src/__tests__/middleware.test.ts src/app/api/payout/__tests__/route.test.ts src/app/api/payouts/request/__tests__/route.test.ts
```
Expected: all suites PASS.

- [ ] **Step 4: Run the Functions package's own test/build gate**

Run: `cd functions && npm run build`
Expected: exit 0.

- [ ] **Step 5: Targeted typecheck across every file this plan modified**

Run:
```bash
npx tsc --noEmit 2>&1 | grep -E "admin-session|admin/multiplier|admin/fraud|admin/promo-analytics|admin/offers|admin/stats|admin/transactions|admin/users|admin/withdrawals|firebaseAdmin.test|middleware.test|payout/__tests__|payouts/request/__tests__"
```
Expected: no output (the `admin/withdrawals` and `admin/payout`/`payouts/request` namespace-API `admin.firestore.*` errors are explicitly out of scope per this plan's Global Constraints — this grep excludes them because it targets test/auth-mechanism lines this plan actually changed, not the pre-existing Phase-1-scoped lines).

- [ ] **Step 6: Update `projects/tapcash.md` in the boardroom repo**

In `D:\AgentDevWork\repos\OBSIDIAN-TEAM-BOARDROOM\projects\tapcash.md`, update "Current Status / Risks" to reflect: TASK-034 closed (npm audit clean at high+), all 8 `/api/admin/*` routes on cookie-session auth, new test coverage added for payout/payouts-request/firebaseAdmin/middleware, Firebase Functions on v2. Note explicitly that Track 1 Phase 1's code changes (modular firebase-admin API, Interac freeze, dummy-key removal, domain fix) still have not landed as of this phase's close — flag this as a blocker for a fully clean `npx tsc --noEmit`. Commit in the boardroom repo per the standing periodic-commit instruction.

Also update `D:\AgentDevWork\repos\OBSIDIAN-TEAM-BOARDROOM\ledger\tasks\034-tapcash-dependabot-remediation.md`'s `status:` frontmatter field from `proposed` to `done`, and its `owner:` field from `unassigned` to `Claude Code`, and append to its `## Progress Log`:
```markdown
- 2026-08-06: remediated via Track 1 Phase 2 (branch
  agent/claude/037-track1-phase2-hardening) — next upgraded to ^16.3.0,
  transitive critical/high findings resolved via npm audit fix, remediation
  note at tapcash/docs/superpowers/notes/2026-08-06-dependabot-remediation.md.
```

- [ ] **Step 7: Final commit in tapcash**

```bash
git add -A
git status --short
# review the diff is only what's expected before committing
git commit -m "chore(track1-phase2): close out hardening phase

TASK-034 closed: npm audit critical/high resolved.
8/8 /api/admin/* routes migrated from Bearer-token to cookie-session auth.
New test coverage: payout route, payouts/request route, firebaseAdmin.ts,
middleware.ts.
Firebase Functions migrated v1 -> v2.

Note: Track 1 Phase 1's code changes (modular firebase-admin API, Interac
freeze, dummy-key fallback removal, domain fix) had not landed as of this
phase's close — npx tsc --noEmit is not globally clean until Phase 1 merges.

traces-to: TASK-037"
```

- [ ] **Step 8: Open the PR (do not merge)**

Per boardroom rules, open a PR from `agent/claude/037-track1-phase2-hardening` with body referencing `traces-to: TASK-037` (and `traces-to: TASK-034` for the Dependabot commit specifically), summarizing the audit remediation, the admin-auth migration, the new test coverage, and the Functions v2 migration. Explicitly flag in the PR description that this branch depends on Track 1 Phase 1 landing first for a fully clean `npx tsc --noEmit` — the two branches touch overlapping files (`admin/withdrawals/route.ts`, `payout/route.ts`, `payouts/request/route.ts`) via different concerns (Phase 1: modular Firestore API; Phase 2: auth mechanism), so merge Phase 1 first and rebase this branch on top to avoid a conflicted merge. Shayan reviews and merges.

---

## Self-Review Notes

- **Spec coverage:** All 4 scope items are covered — Task 1 (TASK-034/Dependabot), Tasks 2-5 (Bearer-to-cookie for all 8 admin routes, split across 3 tasks by auth-pattern grouping since the routes are not identical), Tasks 6-9 (test coverage for payout, payouts/request, firebaseAdmin.ts, middleware.ts), Task 10 (Functions v1->v2). Task 11 closes out per Phase 1's precedent structure.
- **Placeholder scan:** No "TBD"/"add error handling"/"similar to Task N" placeholders — every step either shows the literal before/after code or, where a file has many repeated call sites (e.g. `admin/offers/route.ts`'s 4 handlers), gives the exact repeated block once and names every line range it applies to.
- **Type consistency:** `requireAdminSession`'s return shape (`{ uid, email } | { response: NextResponse }`) is used identically across Tasks 2-5. `AdminSessionResult`/`VerifiedUserData` naming does not collide with the existing `requireVerifiedUser`/`VerifiedUserResult` pattern in `src/lib/verified-user.ts` (kept as a distinct, purpose-named type since `requireVerifiedUser` is Bearer-token-based and serves a different concern — user-facing routes, not admin routes — despite superficially similar naming).
