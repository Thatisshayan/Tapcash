# Track 1 Phase 1 — Fix the Build (Regressions & Security) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Get `npx tsc --noEmit` to zero errors, remove the dummy-Firebase-key fallback, fix the domain inconsistency, and freeze Interac everywhere a user or the API can select it — without touching UI/UX styling (that's Track 2) or mobile (Track 3).

**Architecture:** `firebase-admin` v14 no longer type-resolves the legacy namespace API (`admin.firestore()`, `admin.auth()`, `admin.firestore.FieldValue`, `admin.credential.cert`) under this repo's TypeScript/moduleResolution config. One file (`src/app/api/streak/route.ts`) already uses the correct modular pattern (`import { adminDb } from "@/lib/firebaseAdmin"; import { FieldValue } from "firebase-admin/firestore";`) — every other file gets converted to match that established pattern. `firebaseAdmin.ts` itself becomes the single place `initializeApp`/`cert`/`getApps` are called.

**Tech Stack:** Next.js 16, TypeScript, `firebase-admin` ^14.0.0, `firebase` ^12.15.0, Jest.

## Global Constraints

- Do not delete any file or component without Shayan's explicit sign-off (boardroom Rule 14) — this plan only edits, never deletes, existing files.
- Branch: `agent/claude/035-track1-phase1-build-fix`. Never commit to `main`.
- Every commit message should reference `traces-to: TASK-035` (boardroom ledger).
- No live secrets are touched or required for this plan — every task is verifiable with `npx tsc --noEmit` and `npx jest`, no external API calls.
- Interac: freeze only — no deletion of `src/lib/interac.ts` or its types. Disable the path so it cannot be selected or processed; leave the code intact and clearly marked frozen.
- Commit after each task per Shayan's standing instruction for this push (periodic commits, no need to ask first) — still never push/merge to `main` (that stays Shayan-gated).

---

### Task 1: Modularize `firebaseAdmin.ts` and restore `getFirebaseApp`

**Files:**
- Modify: `src/lib/firebaseAdmin.ts`
- Modify: `instrumentation.ts` (no change needed if Task 1's export name matches — verify only)

**Interfaces:**
- Produces: `adminDb: Firestore`, `adminAuth: Auth`, `getFirebaseApp(): App | null`, `firebaseAdminReady: boolean`, `firebaseAdminMode: "real" | "fallback"`, `firebaseAdminError: string | null` — all later tasks import `adminDb`/`adminAuth` from `@/lib/firebaseAdmin`.

- [ ] **Step 1: Rewrite `src/lib/firebaseAdmin.ts` to use the modular API**

```typescript
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

type FirebaseAdminMode = "real" | "fallback";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatPrivateKey(key: string): string {
  let cleaned = key;
  try {
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      const parsed: unknown = JSON.parse(cleaned);
      if (typeof parsed === "string") cleaned = parsed;
    }
  } catch { /* keep original */ }

  cleaned = cleaned.replace(/^['"]|['"]$/g, "");
  cleaned = cleaned.replace(/\\\\n/g, "\n").replace(/\\n/g, "\n");
  cleaned = cleaned.trim();

  if (!cleaned.includes("-----BEGIN PRIVATE KEY-----")) {
    const raw = cleaned.replace(/\s+/g, "");
    const lines = raw.match(/.{1,64}/g)?.join("\n") || raw;
    cleaned = `-----BEGIN PRIVATE KEY-----\n${lines}\n-----END PRIVATE KEY-----\n`;
  }
  return cleaned;
}

export let firebaseAdminReady = false;
export let firebaseAdminMode: FirebaseAdminMode = "fallback";
export let firebaseAdminError: string | null = null;

let app: App | null = null;

function log(level: "error" | "warn", message: string) {
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build" || process.env.NODE_ENV === "test";
  if (!isBuildPhase) {
    console[level](`[FirebaseAdmin] ${message}`);
  }
}

if (!getApps().length) {
  const isProduction = process.env.NODE_ENV === "production";
  const privateKey = process.env.FIREBASE_PRIVATE_KEY ? formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY) : null;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    try {
      app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
      firebaseAdminReady = true;
      firebaseAdminMode = "real";
    } catch (error) {
      firebaseAdminError = `Initialization failed: ${getErrorMessage(error, "Unknown error")}`;
      log("error", firebaseAdminError);
    }
  } else {
    firebaseAdminError = "Missing FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, or FIREBASE_PROJECT_ID.";
    log(isProduction ? "error" : "warn", firebaseAdminError);
  }

  // In production, never fall back — fail loudly if Firebase Admin isn't configured.
  // In dev/test, initialize a minimal app so the module is importable.
  if (!getApps().length) {
    if (isProduction) {
      log("error", "Firebase Admin unavailable in production — credentials are required.");
    } else {
      app = initializeApp({ projectId: projectId || "tapcash-dev" });
      firebaseAdminMode = "fallback";
      log("warn", "Using fallback Firebase app. Real credentials required for production.");
    }
  }
} else {
  app = getApps()[0] ?? null;
}

export function getFirebaseApp(): App | null {
  return app;
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
```

- [ ] **Step 2: Verify `instrumentation.ts` needs no change**

`instrumentation.ts:10` already does `const { getFirebaseApp } = await import("./src/lib/firebaseAdmin");` — Step 1 now exports that function, so this file needs no edit. Confirm with:

Run: `npx tsc --noEmit 2>&1 | grep instrumentation`
Expected: no output (error gone).

- [ ] **Step 3: Commit**

```bash
git add src/lib/firebaseAdmin.ts
git commit -m "fix(firebase-admin): modularize admin SDK init, restore getFirebaseApp

traces-to: TASK-035"
```

---

### Task 2: Fix core lib files — `idempotency.ts`, `audit.ts`, `ledger.ts`

**Files:**
- Modify: `src/lib/idempotency.ts`
- Modify: `src/lib/audit.ts`
- Modify: `src/lib/ledger.ts` (only the `admin` import line — grep first to confirm no other `admin.` usage beyond the header import before editing; if `ledger.ts` uses `admin.firestore.FieldValue`/`Timestamp` elsewhere, apply the same swap as below)

**Interfaces:**
- Consumes: `adminDb` from `@/lib/firebaseAdmin` (Task 1), `FieldValue` from `firebase-admin/firestore`.

- [ ] **Step 1: `src/lib/idempotency.ts` — swap the import and both `admin.firestore.FieldValue` call sites**

Replace:
```typescript
import { adminDb } from "@/lib/firebaseAdmin";
```
with:
```typescript
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
```
Remove the line `import * as admin from "firebase-admin";`.

Replace both occurrences of `admin.firestore.FieldValue.serverTimestamp()` with `FieldValue.serverTimestamp()` (line 54 and line 67).

- [ ] **Step 2: `src/lib/audit.ts` — same swap, both call sites**

Replace:
```typescript
import * as admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
```
with:
```typescript
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
```
Replace both `admin.firestore.FieldValue.serverTimestamp()` (lines 7, 8, 15, 16) with `FieldValue.serverTimestamp()`.

- [ ] **Step 3: `src/lib/ledger.ts` — same import swap**

Replace:
```typescript
import * as admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
```
with:
```typescript
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
```
Then run `grep -n "admin\." src/lib/ledger.ts` and replace any remaining `admin.firestore.X` call sites with the modular equivalent (`FieldValue.X` or, if `Timestamp` is used, add `Timestamp` to the same import line and drop the `admin.firestore.` prefix).

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -E "idempotency|audit\.ts|ledger\.ts"`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/lib/idempotency.ts src/lib/audit.ts src/lib/ledger.ts
git commit -m "fix(firebase-admin): migrate core lib files to modular firestore API

traces-to: TASK-035"
```

---

### Task 3: Fix `src/app/api/admin/withdrawals/route.ts`

**Files:**
- Modify: `src/app/api/admin/withdrawals/route.ts`

**Interfaces:**
- Consumes: `adminDb`, `adminAuth` from `@/lib/firebaseAdmin`; `FieldValue`, `Timestamp` from `firebase-admin/firestore`; `DecodedIdToken` type from `firebase-admin/auth`.

- [ ] **Step 1: Replace the import and every call site**

Replace:
```typescript
import * as admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
```
with:
```typescript
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
```

Then:
- Line 14: `const decodedToken = await admin.auth().verifyIdToken(idToken);` -> `const decodedToken = await adminAuth.verifyIdToken(idToken);`
- Line 29: `admin.firestore.Timestamp.fromDate(...)` -> `Timestamp.fromDate(...)`
- All 12 `admin.firestore.FieldValue.serverTimestamp()` occurrences (lines 113, 114, 132, 133, 159, 161, 178, 179, 204, 206, 223, 224) -> `FieldValue.serverTimestamp()`

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit 2>&1 | grep withdrawals`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/withdrawals/route.ts
git commit -m "fix(firebase-admin): migrate admin withdrawals route to modular API

traces-to: TASK-035"
```

---

### Task 4: Fix `src/app/api/payout/route.ts` (admin calls only — Interac freeze is Task 9)

**Files:**
- Modify: `src/app/api/payout/route.ts`

- [ ] **Step 1: Replace the import**

Replace `import * as admin from "firebase-admin";` (and keep `import { adminDb } from "@/lib/firebaseAdmin";`) with:
```typescript
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import type { DecodedIdToken } from "firebase-admin/auth";
```

- [ ] **Step 2: Fix both auth blocks (lines ~82-84 and ~272-274)**

Replace:
```typescript
let decodedToken: admin.auth.DecodedIdToken;
```
with:
```typescript
let decodedToken: DecodedIdToken;
```
Replace both `await admin.auth().verifyIdToken(token)` with `await adminAuth.verifyIdToken(token)`.

- [ ] **Step 3: Fix all 9 `admin.firestore.FieldValue.serverTimestamp()` occurrences**

Lines 131, 148, 178, 180, 214, 216, 235 -> `FieldValue.serverTimestamp()`.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit 2>&1 | grep "api/payout/route"`
Expected: no output (Interac-related errors, if any, are out of scope for this task — handled in Task 9).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/payout/route.ts
git commit -m "fix(firebase-admin): migrate payout route to modular API

traces-to: TASK-035"
```

---

### Task 5: Fix `src/app/api/payouts/request/route.ts` (admin calls only)

**Files:**
- Modify: `src/app/api/payouts/request/route.ts`

- [ ] **Step 1: Replace the import**

Replace `import * as admin from "firebase-admin";` with (keep existing `adminDb` import):
```typescript
import { FieldValue, Timestamp } from "firebase-admin/firestore";
```

- [ ] **Step 2: Fix the Timestamp call (line 124)**

`admin.firestore.Timestamp.fromDate(todayStart)` -> `Timestamp.fromDate(todayStart)`.

- [ ] **Step 3: Fix all 12 `admin.firestore.FieldValue.serverTimestamp()` occurrences**

Lines 243, 251, 275, 283, 295, 296, 319, 320, 332, 333, 341, 354, 355 -> `FieldValue.serverTimestamp()`.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit 2>&1 | grep "payouts/request"`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/payouts/request/route.ts
git commit -m "fix(firebase-admin): migrate payouts/request route to modular API

traces-to: TASK-035"
```

---

### Task 6: Fix `src/app/api/postback/route.ts` and `src/app/api/postback/rapidoreach/route.ts`

**Files:**
- Modify: `src/app/api/postback/route.ts`
- Modify: `src/app/api/postback/rapidoreach/route.ts`

Both already import `Timestamp` from `firebase-admin/firestore` correctly — only the redundant `import * as admin from "firebase-admin";` line and its `FieldValue` call sites need fixing.

- [ ] **Step 1: `postback/route.ts`**

Replace:
```typescript
import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
```
with:
```typescript
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
```
Replace all 5 pairs of `admin.firestore.FieldValue.serverTimestamp()` (lines 110, 111, 128, 129, 143, 144, 156, 157, 174, 175) -> `FieldValue.serverTimestamp()`.

- [ ] **Step 2: `postback/rapidoreach/route.ts`**

Replace:
```typescript
import { Timestamp } from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
```
with:
```typescript
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
```
Replace all `admin.firestore.FieldValue.serverTimestamp()` occurrences (lines 140, 141, 155, 156, 170, 171, 262) -> `FieldValue.serverTimestamp()`.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit 2>&1 | grep postback`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/postback/route.ts src/app/api/postback/rapidoreach/route.ts
git commit -m "fix(firebase-admin): migrate postback routes to modular API

traces-to: TASK-035"
```

---

### Task 7: Fix `promo/redeem`, `tasks/claim-mission`, `tasks/complete`, `tasks/daily-spin`

**Files:**
- Modify: `src/app/api/promo/redeem/route.ts`
- Modify: `src/app/api/tasks/claim-mission/route.ts`
- Modify: `src/app/api/tasks/complete/route.ts`
- Modify: `src/app/api/tasks/daily-spin/route.ts`

All four follow the identical pattern: `import { adminDb } from "@/lib/firebaseAdmin"; import * as admin from "firebase-admin";` followed only by `admin.firestore.FieldValue.serverTimestamp()` calls (and `claim-mission` also has one `admin.firestore.Timestamp.fromDate()` at line 80).

- [ ] **Step 1: Apply to all four files**

Replace `import * as admin from "firebase-admin";` with `import { FieldValue } from "firebase-admin/firestore";` (in `claim-mission/route.ts`, import `{ FieldValue, Timestamp }` since it also uses `Timestamp.fromDate`).

Then replace every `admin.firestore.FieldValue.serverTimestamp()` -> `FieldValue.serverTimestamp()`, and in `claim-mission/route.ts` line 80, `admin.firestore.Timestamp.fromDate(todayStart)` -> `Timestamp.fromDate(todayStart)`.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -E "promo/redeem|tasks/claim-mission|tasks/complete|tasks/daily-spin"`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/promo/redeem/route.ts src/app/api/tasks/claim-mission/route.ts src/app/api/tasks/complete/route.ts src/app/api/tasks/daily-spin/route.ts
git commit -m "fix(firebase-admin): migrate promo/tasks routes to modular API

traces-to: TASK-035"
```

---

### Task 8: Fix `scripts/seed-firestore.ts`

**Files:**
- Modify: `scripts/seed-firestore.ts`

This is a standalone script that initializes its own Firebase Admin app rather than importing `firebaseAdmin.ts` — it needs the same namespace -> modular conversion applied directly.

- [ ] **Step 1: Replace the import and init block**

Replace:
```typescript
import * as admin from "firebase-admin";
```
with:
```typescript
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
```

Replace (around line 23):
```typescript
const app = admin.initializeApp({
  credential: admin.credential.cert({
```
with:
```typescript
const app = initializeApp({
  credential: cert({
```
(keep the rest of the `cert({...})` argument object as-is — only the outer function names change).

Replace line 31:
```typescript
const db = admin.firestore(app);
```
with:
```typescript
const db = getFirestore(app);
```
Replace line 87:
```typescript
batch.set(ref, { ...data, createdAt: admin.firestore.FieldValue.serverTimestamp() });
```
with:
```typescript
batch.set(ref, { ...data, createdAt: FieldValue.serverTimestamp() });
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit 2>&1 | grep seed-firestore`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-firestore.ts
git commit -m "fix(firebase-admin): migrate seed script to modular API

traces-to: TASK-035"
```

---

### Task 9: Freeze Interac — disable the path, don't delete the code

**Scope note:** `grep -rniI interac src --include="*.ts" --include="*.tsx"` returns 27 files. This task freezes the two places a user or the API can actually select/process Interac today (`payout/route.ts` admin processing, `payouts/request/route.ts` user-facing request validation, and the two marketing/landing components that advertise it). It does **not** delete `src/lib/interac.ts`, its types, or its tests — those stay as dormant, clearly-marked code per the no-deletion-without-approval rule. Remaining incidental mentions (blog copy, FAQ, terms, brand-logo lists) are tracked as a follow-up sweep, not blocking this phase's typecheck/build goal.

**Files:**
- Modify: `src/app/api/payout/route.ts`
- Modify: `src/app/api/payouts/request/route.ts`
- Modify: `src/components/sections/CashoutMethodsSection.tsx`
- Modify: `src/components/sections/PayoutMethodsSection.tsx`
- Modify: `scripts/seed-firestore.ts`
- Modify: `src/lib/interac.ts` (add a frozen-guard, do not delete)

- [ ] **Step 1: Guard `src/lib/interac.ts` so it throws instead of silently attempting a call**

At the top of the file, after the existing constants, add:

```typescript
/**
 * FROZEN 2026-08-06: Interac e-Transfer payouts are disabled for launch.
 * Do not remove this file — kept intact for a future re-enable, per
 * boardroom Rule 14 (no deletion without Shayan's sign-off).
 */
export const INTERAC_FROZEN = true;
```

- [ ] **Step 2: `payout/route.ts` — reject the `interac` provider before any processing**

Immediately after the `manualProviders` array declaration, add:
```typescript
const FROZEN_PROVIDERS = ["interac"];
```
In the request handler, right after `provider` is parsed from the body (same place the existing `provider === "interac"` validation block lives, around line 121), add a guard before it:
```typescript
if (FROZEN_PROVIDERS.includes(provider)) {
  return NextResponse.json({
    error: "This payout method is temporarily unavailable.",
  }, { status: 400 });
}
```

- [ ] **Step 3: `payouts/request/route.ts` — remove `"interac"` from `allowedMethods`**

Line 137:
```typescript
const allowedMethods = ["paypal", "litecoin", "bitcoin", "visa", "steam", "roblox", "interac", "tim_hortons", "canadian_tire", "cineplex", "shoppers"];
```
becomes:
```typescript
const allowedMethods = ["paypal", "litecoin", "bitcoin", "visa", "steam", "roblox", "tim_hortons", "canadian_tire", "cineplex", "shoppers"];
```

- [ ] **Step 4: `CashoutMethodsSection.tsx` — remove the Interac entry from the displayed methods list**

Line 5:
```typescript
{ name: "Interac e-Transfer", icon: "🏦", detail: "Canadian banks", badge: "Canada" },
```
Delete this line from the array (the array literal itself is not user-facing config, just UI copy — removing one entry is not a "component deletion" under Rule 14, it's content removal within an existing component).

- [ ] **Step 5: `PayoutMethodsSection.tsx` — remove the Interac entry and its note**

Delete line 8:
```typescript
{ icon: Building2, name: 'Interac e-Transfer', interac: true },
```
Remove the now-unused `Building2` import if it's not used elsewhere in the file (check with `grep -n "Building2" src/components/sections/PayoutMethodsSection.tsx`).
Delete the "Interac note" paragraph block (lines 52-55):
```typescript
{/* Interac note */}
<p className="text-center text-[13px] text-white/50 max-w-lg mx-auto mb-12">
  Canadian users: Interac e-Transfer deposits directly to your bank — no middleman.
</p>
```

- [ ] **Step 6: `scripts/seed-firestore.ts` — comment out the Interac seed row**

Line 64:
```typescript
{ id: "interac", label: "Interac e-Transfer", subtitle: "Canada-first withdrawal path", minCoins: 5000, eta: "Manual review window", accent: "blue", audience: "Canadian users", order: 2 },
```
becomes:
```typescript
// FROZEN 2026-08-06: Interac disabled for launch, do not seed. Re-enable when un-frozen.
// { id: "interac", label: "Interac e-Transfer", subtitle: "Canada-first withdrawal path", minCoins: 5000, eta: "Manual review window", accent: "blue", audience: "Canadian users", order: 2 },
```

- [ ] **Step 7: Run existing Interac tests to confirm they still pass (they test the lib directly, which is untouched behaviorally)**

Run: `npx jest src/lib/__tests__/interac.test.ts src/app/api/payout/__tests__/route.test.ts src/app/api/payouts/request/__tests__/route.test.ts`
Expected: all passing tests still pass. If `payout/__tests__/route.test.ts` or `payouts/request/__tests__/route.test.ts` had a test asserting Interac succeeds end-to-end, it will now fail against the new guard — update that specific test's expectation to assert a 400 rejection instead, following the existing test file's style (do not delete the test, change its assertion).

- [ ] **Step 8: Commit**

```bash
git add src/lib/interac.ts src/app/api/payout/route.ts src/app/api/payouts/request/route.ts src/components/sections/CashoutMethodsSection.tsx src/components/sections/PayoutMethodsSection.tsx scripts/seed-firestore.ts src/app/api/payout/__tests__/route.test.ts src/app/api/payouts/request/__tests__/route.test.ts
git commit -m "feat(payouts): freeze Interac e-Transfer for launch

Disables the interac provider in both payout routes and removes it from
the two user-facing method lists. Code stays intact per Rule 14 — not a
deletion, a freeze. Remaining incidental mentions (blog/FAQ copy) tracked
as a follow-up sweep.

traces-to: TASK-035"
```

---

### Task 10: Remove the dummy-Firebase-key fallback

**Files:**
- Modify: `src/lib/firebase.ts`

- [ ] **Step 1: Replace the config block**

Replace:
```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaFirebaseDummyKeyForBuild',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const configured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
if (!configured) {
  console.warn('[firebase] Missing required Firebase configuration. Client-side Firebase features require NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID to be set.');
}

const app = !getApps().length ? initializeApp(firebaseConfig as any) : getApp();
```
with:
```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const configured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
if (!configured) {
  throw new Error(
    '[firebase] Missing required Firebase configuration. Set NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID — no dummy fallback is used, so the app will not silently point at a demo project.'
  );
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
```

Note: removing `as any` is intentional — with no fallback strings, `firebaseConfig` now correctly satisfies `FirebaseOptions` typing as long as env vars are set; if this surfaces a new type error, add back a narrow cast only on the specific field TypeScript flags, not the whole object.

- [ ] **Step 2: Verify locally that dev still boots with `.env.local` values present**

Run: `npm run dev` (Ctrl+C after confirming it starts without throwing), or `npx tsc --noEmit 2>&1 | grep "lib/firebase.ts"` for a non-interactive check.
Expected: no error, since `.env.local` already has real `NEXT_PUBLIC_FIREBASE_*` values (confirm with `grep NEXT_PUBLIC_FIREBASE_API_KEY .env.local`).

- [ ] **Step 3: Commit**

```bash
git add src/lib/firebase.ts
git commit -m "fix(security): remove dummy Firebase key fallback

Client Firebase config now throws if required env vars are missing
instead of silently falling back to a demo project.

traces-to: TASK-035"
```

---

### Task 11: Fix the domain inconsistency (`tapcash.com` -> `tapcash.online`)

**Files:**
- Modify: `.env.local`
- Modify: `.env.example`

- [ ] **Step 1: `.env.local`**

Line 19: `NEXT_PUBLIC_APP_URL=https://tapcash.com` -> `NEXT_PUBLIC_APP_URL=https://tapcash.online`
Line 21: `NEXTAUTH_URL=https://tapcash.com` -> `NEXTAUTH_URL=https://tapcash.online`

- [ ] **Step 2: `.env.example`** — same two line edits.

- [ ] **Step 3: Verify**

Run: `grep -rn "tapcash\.com" .env.local .env.example next.config.ts src 2>/dev/null`
Expected: no output (all references now point to `tapcash.online`).

- [ ] **Step 4: Commit**

```bash
git add .env.local .env.example
git commit -m "fix(config): standardize on tapcash.online domain

traces-to: TASK-035"
```

---

### Task 12: Fix `src/app/api/streak/route.ts` type errors

**Files:**
- Modify: `src/app/api/streak/route.ts`

The errors are because `userData.streakCount`, `userData.bestStreak`, and `userData.lastStreakCheckIn` are typed `unknown` (Firestore document data), used directly in arithmetic/property access.

- [ ] **Step 1: Add explicit typing at destructure time**

Replace:
```typescript
const streakCount = userData.streakCount ?? 0;
const lastCheckIn = userData.lastStreakCheckIn;
const bestStreak = userData.bestStreak ?? 0;
```
with:
```typescript
const streakCount = typeof userData.streakCount === "number" ? userData.streakCount : 0;
const lastCheckIn = userData.lastStreakCheckIn as { toDate?: () => Date } | string | undefined;
const bestStreak = typeof userData.bestStreak === "number" ? userData.bestStreak : 0;
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit 2>&1 | grep "api/streak"`
Expected: no output.

- [ ] **Step 3: Run the existing streak tests if present**

Run: `npx jest src/app/api/streak --passWithNoTests`
Expected: PASS (or no tests found, which is fine — this task doesn't add new test coverage, that's Phase 2).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/streak/route.ts
git commit -m "fix(types): resolve unknown-type errors in streak route

traces-to: TASK-035"
```

---

### Task 13: Fix the `NODE_ENV` read-only assignment errors in tests

**Files:**
- Create: `src/lib/__tests__/testEnv.ts`
- Modify: `src/lib/__tests__/origin.test.ts`
- Modify: `src/lib/__tests__/security.test.ts`

Newer `@types/node` types `process.env.NODE_ENV` as read-only, so direct assignment (`process.env.NODE_ENV = "production"`) fails to typecheck even though it works at runtime. Fix with a small typed helper instead of scattering `as any` casts.

- [ ] **Step 1: Create the shared test helper**

```typescript
// src/lib/__tests__/testEnv.ts
export function setNodeEnv(value: string): void {
  Object.defineProperty(process.env, "NODE_ENV", {
    value,
    configurable: true,
    writable: true,
  });
}
```

- [ ] **Step 2: Update `origin.test.ts`**

Add the import:
```typescript
import { setNodeEnv } from "./testEnv";
```
Replace all 4 occurrences of `process.env.NODE_ENV = "production"` with `setNodeEnv("production")`, and all occurrences of `process.env.NODE_ENV = originalEnv` with `setNodeEnv(originalEnv as string)`.

- [ ] **Step 3: Update `security.test.ts`** — same pattern, all 4 occurrences.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -E "origin.test|security.test"`
Expected: no output.

Run: `npx jest src/lib/__tests__/origin.test.ts src/lib/__tests__/security.test.ts`
Expected: all tests still PASS (behavior is unchanged, only the assignment mechanism).

- [ ] **Step 5: Commit**

```bash
git add src/lib/__tests__/testEnv.ts src/lib/__tests__/origin.test.ts src/lib/__tests__/security.test.ts
git commit -m "fix(tests): resolve NODE_ENV read-only typecheck errors

traces-to: TASK-035"
```

---

### Task 14: Fix the `packages/tokens/tokens.test.ts` path bug

**Files:**
- Modify: `packages/tokens/tokens.test.ts`

**Bug:** `resolve(__dirname, '..', '..', '..')` from `packages/tokens/` climbs 3 levels (`packages/tokens` -> `packages` -> repo root -> **one level above the repo root**), which is why the test throws `ENOENT` trying to read `packages/tokens/tokens.json` relative to the wrong root. It needs exactly 2 levels up.

- [ ] **Step 1: Fix the path**

Replace:
```typescript
const repoRoot = resolve(__dirname, '..', '..', '..');
```
with:
```typescript
const repoRoot = resolve(__dirname, '..', '..');
```

- [ ] **Step 2: Verify**

Run: `npx jest packages/tokens/tokens.test.ts`
Expected: PASS, 4/4 tests (previously: `ENOENT` before any test ran).

- [ ] **Step 3: Commit**

```bash
git add packages/tokens/tokens.test.ts
git commit -m "fix(tests): correct repo-root path resolution in tokens drift test

traces-to: TASK-035"
```

---

### Task 15: Final verification and phase close-out

**Files:** none (verification only)

- [ ] **Step 1: Full typecheck must be clean**

Run: `npx tsc --noEmit`
Expected: exit code 0, zero output.

- [ ] **Step 2: Full test suite must be green, including the previously-failing suite**

Run: `npx jest`
Expected: all suites pass, including `packages/tokens/tokens.test.ts` (previously erroring out of the run).

- [ ] **Step 3: Lint sanity check (the earlier audit found this suspiciously silent)**

Run: `npx eslint src --max-warnings=0`
Expected: either a real pass (exit 0 with rule output confirming it actually ran) or a clear error if the linter itself is misconfigured — report either result, don't assume silence means success.

- [ ] **Step 4: Update `projects/tapcash.md` in the boardroom repo**

In `D:\AgentDevWork\repos\OBSIDIAN-TEAM-BOARDROOM\projects\tapcash.md`, update "Current Status / Risks" to reflect: typecheck clean, dummy-key fallback removed, domain standardized on tapcash.online, Interac frozen. Commit in the boardroom repo per the standing periodic-commit instruction.

- [ ] **Step 5: Final commit in tapcash**

```bash
git add -A
git status --short
# review the diff is only what's expected before committing
git commit -m "chore(track1-phase1): close out build-fix phase, all green

npx tsc --noEmit: 0 errors (was 109)
npx jest: all suites passing
Domain standardized on tapcash.online, dummy-key fallback removed,
Interac frozen pending redesign.

traces-to: TASK-035"
```

- [ ] **Step 6: Open the PR (do not merge)**

Per boardroom rules, open a PR from `agent/claude/035-track1-phase1-build-fix` with body referencing `traces-to: TASK-035`, summarizing the 109->0 typecheck fix, the security/domain/Interac changes, and flagging that Phase 2 (Dependabot remediation, cashout route test coverage, Bearer-token audit, Functions v1->v2) is a separate follow-up plan. Shayan reviews and merges.
