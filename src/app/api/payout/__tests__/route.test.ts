/**
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
