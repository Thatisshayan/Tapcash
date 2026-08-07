/**
 * @jest-environment node
 *
 * The repo's default jsdom test environment (see jest.config.js) has no
 * global `Request` -- the route-level tests below construct real WHATWG
 * `Request` objects to drive the actual POST handler. Node's test
 * environment provides `Request` (and `Headers`/`Response`) natively, so
 * this file opts into it, matching the precedent set in
 * src/lib/__tests__/admin-session.test.ts. This is a per-file override;
 * no other test file is affected.
 *
 * Tests for /api/payout route helpers
 */

// Pure utility functions extracted from the route
function coinsToDollars(coins: number): number {
  return coins / 1000;
}

function validateProvider(provider: string): boolean {
  return ["paypal", "interac", "tremendous"].includes(provider);
}

describe("coinsToDollars", () => {
  it("converts 1000 coins to $1.00", () => {
    expect(coinsToDollars(1000)).toBe(1);
  });

  it("converts 500 coins to $0.50", () => {
    expect(coinsToDollars(500)).toBe(0.5);
  });

  it("converts 2000 coins to $2.00", () => {
    expect(coinsToDollars(2000)).toBe(2);
  });

  it("converts 0 coins to $0.00", () => {
    expect(coinsToDollars(0)).toBe(0);
  });

  it("converts 24750 coins correctly", () => {
    expect(coinsToDollars(24750)).toBe(24.75);
  });
});

describe("validateProvider", () => {
  it("accepts paypal", () => {
    expect(validateProvider("paypal")).toBe(true);
  });

  it("accepts interac", () => {
    expect(validateProvider("interac")).toBe(true);
  });

  it("accepts tremendous", () => {
    expect(validateProvider("tremendous")).toBe(true);
  });

  it("rejects bitcoin", () => {
    expect(validateProvider("bitcoin")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(validateProvider("")).toBe(false);
  });

  it("is case sensitive", () => {
    expect(validateProvider("PayPal")).toBe(false);
  });
});

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
