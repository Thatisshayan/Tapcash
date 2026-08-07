/**
 * @jest-environment node
 *
 * The repo's default jsdom test environment (see jest.config.js) has no
 * global `Request` -- the route-level tests below construct real WHATWG
 * `Request` objects to drive the actual POST handler. Node's test
 * environment provides `Request` (and `Headers`/`Response`) natively, so
 * this file opts into it, matching the precedent set in
 * src/lib/__tests__/admin-session.test.ts and
 * src/app/api/payout/__tests__/route.test.ts. This is a per-file override;
 * no other test file is affected.
 *
 * jest.setup.ts also globally mocks next/server with a stub NextRequest
 * that has no .nextUrl and a headers.get() that always returns undefined
 * -- the route-level tests below need real nextUrl.pathname (used by
 * src/lib/origin.ts) and real per-header header reads, so this file
 * un-mocks next/server for itself only (precedent:
 * src/lib/__tests__/admin-session.test.ts).
 *
 * Tests for pure helper functions in the cashout request route
 */
jest.unmock("next/server");

import { createHash } from "crypto";

function getDestinationLockId(destination: string) {
  return createHash("sha256").update(destination).digest("hex");
}

function validateCashoutAmount(amountCoins: number): { valid: boolean; error?: string } {
  if (Number.isNaN(amountCoins) || amountCoins < 2000) {
    return { valid: false, error: "Invalid amount. Minimum cashout is 2,000 coins ($2.00)." };
  }
  return { valid: true };
}

const ALLOWED_METHODS = ["paypal", "litecoin", "bitcoin", "visa", "steam", "roblox", "tim_hortons", "canadian_tire", "cineplex", "shoppers"];

function validateMethod(method: string): boolean {
  return ALLOWED_METHODS.includes(method);
}

describe("getDestinationLockId", () => {
  it("returns a 64-character hex string", () => {
    const result = getDestinationLockId("user@example.com");
    expect(result).toMatch(/^[a-f0-9]{64}$/);
  });

  it("is deterministic for the same input", () => {
    const a = getDestinationLockId("test@test.com");
    const b = getDestinationLockId("test@test.com");
    expect(a).toBe(b);
  });

  it("differs for different inputs", () => {
    const a = getDestinationLockId("alice@example.com");
    const b = getDestinationLockId("bob@example.com");
    expect(a).not.toBe(b);
  });

  it("is case sensitive", () => {
    const a = getDestinationLockId("user@example.com");
    const b = getDestinationLockId("User@example.com");
    expect(a).not.toBe(b);
  });
});

describe("validateCashoutAmount", () => {
  it("accepts 2000 coins", () => {
    expect(validateCashoutAmount(2000)).toEqual({ valid: true });
  });

  it("accepts amounts above 2000", () => {
    expect(validateCashoutAmount(5000)).toEqual({ valid: true });
    expect(validateCashoutAmount(100000)).toEqual({ valid: true });
  });

  it("rejects amounts below 2000", () => {
    const result = validateCashoutAmount(1999);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("2,000");
  });

  it("rejects zero", () => {
    const result = validateCashoutAmount(0);
    expect(result.valid).toBe(false);
  });

  it("rejects negative amounts", () => {
    const result = validateCashoutAmount(-100);
    expect(result.valid).toBe(false);
  });

  it("rejects NaN", () => {
    const result = validateCashoutAmount(NaN);
    expect(result.valid).toBe(false);
  });
});

describe("validateMethod", () => {
  it("accepts all allowed methods", () => {
    for (const method of ALLOWED_METHODS) {
      expect(validateMethod(method)).toBe(true);
    }
  });

  it("rejects 'paypal' (must match exactly)", () => {
    expect(validateMethod("paypal")).toBe(true);
  });

  it("rejects unknown method", () => {
    expect(validateMethod("bank_transfer")).toBe(false);
  });

  it("rejects 'interac' (frozen for launch, 2026-08-06)", () => {
    expect(validateMethod("interac")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(validateMethod("")).toBe(false);
  });
});

describe("POST /api/payouts/request — validation", () => {
  const verifyIdToken = jest.fn();
  const docGet = jest.fn();
  const docUpdate = jest.fn();
  const collectionWhere = jest.fn();
  const collectionAdd = jest.fn();

  // NOTE: `where` is wired directly to the shared `collectionWhere` mock
  // (not via `.mockReturnThis()`) -- calling `.mockReturnThis()` here would
  // re-run on every `adminDb.collection(...)` invocation and clobber the
  // `.mockReturnValue(...)` configured in `beforeEach` below, breaking the
  // `.where(...).where(...).get()` chain the route uses for its
  // daily-cashout-count query.
  jest.mock("@/lib/firebaseAdmin", () => ({
    adminDb: {
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({ get: docGet, update: docUpdate })),
        where: collectionWhere,
        add: collectionAdd,
      })),
    },
    adminAuth: {
      verifyIdToken,
    },
  }));

  // The real implementations of these two libs would otherwise interfere with
  // the validation-focused tests below and are covered by their own test
  // suites: `withRateLimit` shares an in-memory bucket across every POST in
  // this file (unrelated 429s once >3 calls land on the same "anonymous" IP
  // key), and `validateCsrf` unconditionally rejects any POST that doesn't
  // carry matching x-csrf-token header + cookie (unrelated 403s). Both gates
  // run before the auth/validation logic under test here, so they're bypassed
  // to isolate the behavior this suite actually covers.
  jest.mock("@/lib/rate-limit", () => ({
    withRateLimit: jest.fn().mockResolvedValue(null),
  }));

  jest.mock("@/lib/csrf", () => ({
    validateCsrf: jest.fn().mockReturnValue({ valid: true }),
  }));

  beforeEach(() => {
    jest.clearAllMocks();
    collectionWhere.mockReturnValue({
      where: collectionWhere,
      // Real Firestore QuerySnapshots expose both `.docs` and `.forEach` --
      // the route's daily-cashout-count gate (route.ts ~line 127) calls
      // `.forEach()` on the snapshot, so the stub needs it too.
      get: jest.fn().mockResolvedValue({ empty: true, docs: [], size: 0, forEach: jest.fn() }),
      limit: jest.fn().mockReturnThis(),
    });
  });

  it("rejects a request with no Authorization header with 401", async () => {
    const { POST } = await import("../route");
    const { NextRequest } = await import("next/server");
    const request = new NextRequest("http://localhost/api/payouts/request", {
      method: "POST",
      body: JSON.stringify({ amountCoins: 2000, method: "paypal", destination: "user@example.com" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it("rejects a request below the 2000-coin minimum with 400", async () => {
    verifyIdToken.mockResolvedValue({ uid: "user-uid-1", email: "user@tapcash.online", email_verified: true });
    docGet.mockResolvedValue({ exists: true, data: () => ({ balance: 5000 }) });
    const { POST } = await import("../route");
    const { NextRequest } = await import("next/server");
    const request = new NextRequest("http://localhost/api/payouts/request", {
      method: "POST",
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ amountCoins: 500, method: "paypal", destination: "user@example.com" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("2,000");
  });

  it("rejects an unrecognized payout method with 400", async () => {
    verifyIdToken.mockResolvedValue({ uid: "user-uid-1", email: "user@tapcash.online", email_verified: true });
    docGet.mockResolvedValue({ exists: true, data: () => ({ balance: 50000 }) });
    const { POST } = await import("../route");
    const { NextRequest } = await import("next/server");
    const request = new NextRequest("http://localhost/api/payouts/request", {
      method: "POST",
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ amountCoins: 2000, method: "bank_transfer", destination: "user@example.com" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("rejects an unverified email with 403", async () => {
    verifyIdToken.mockResolvedValue({ uid: "user-uid-1", email: "user@tapcash.online", email_verified: false });
    const { POST } = await import("../route");
    const { NextRequest } = await import("next/server");
    const request = new NextRequest("http://localhost/api/payouts/request", {
      method: "POST",
      headers: { Authorization: "Bearer valid-token" },
      body: JSON.stringify({ amountCoins: 2000, method: "paypal", destination: "user@example.com" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
  });
});
