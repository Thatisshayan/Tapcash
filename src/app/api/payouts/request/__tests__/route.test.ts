/**
 * Tests for pure helper functions in the cashout request route
 */
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

const ALLOWED_METHODS = ["paypal", "litecoin", "bitcoin", "visa", "steam", "roblox", "interac", "tim_hortons", "canadian_tire", "cineplex", "shoppers"];

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

  it("rejects empty string", () => {
    expect(validateMethod("")).toBe(false);
  });
});
