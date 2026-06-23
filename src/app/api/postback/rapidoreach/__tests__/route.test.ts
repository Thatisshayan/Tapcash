/**
 * Tests for pure helper functions in the RapidoReach postback handler
 */

function parseAmountCoins(rawAmount: string | null): number {
  if (!rawAmount) return NaN;
  const trimmed = rawAmount.trim();
  if (!trimmed) return NaN;
  const numeric = Number(trimmed);
  if (Number.isNaN(numeric) || numeric <= 0) return NaN;
  return Number.isInteger(numeric) ? numeric : Math.round(numeric * 100);
}

function isCompletedStatus(rawStatus: string | null): boolean {
  if (!rawStatus) return true;
  const normalized = rawStatus.trim().toLowerCase();
  return ["c", "complete", "completed", "approved", "success"].includes(normalized);
}

describe("parseAmountCoins", () => {
  it("returns integer for whole number string", () => {
    expect(parseAmountCoins("500")).toBe(500);
  });

  it("returns integer for decimal whole number", () => {
    expect(parseAmountCoins("500.00")).toBe(500);
  });

  it("converts dollar amount to cents", () => {
    expect(parseAmountCoins("5.50")).toBe(550);
  });

  it("returns NaN for null", () => {
    expect(parseAmountCoins(null)).toBeNaN();
  });

  it("returns NaN for empty string", () => {
    expect(parseAmountCoins("")).toBeNaN();
  });

  it("returns NaN for whitespace only", () => {
    expect(parseAmountCoins("   ")).toBeNaN();
  });

  it("returns NaN for zero", () => {
    expect(parseAmountCoins("0")).toBeNaN();
  });

  it("returns NaN for negative value", () => {
    expect(parseAmountCoins("-100")).toBeNaN();
  });

  it("returns NaN for non-numeric string", () => {
    expect(parseAmountCoins("abc")).toBeNaN();
  });

  it("trims whitespace before parsing", () => {
    expect(parseAmountCoins("  250  ")).toBe(250);
  });

  it("handles small dollar amounts", () => {
    expect(parseAmountCoins("0.99")).toBe(99);
  });
});

describe("isCompletedStatus", () => {
  it("returns true for null (no status = completed)", () => {
    expect(isCompletedStatus(null)).toBe(true);
  });

  it("returns true for 'c'", () => {
    expect(isCompletedStatus("c")).toBe(true);
  });

  it("returns true for 'complete'", () => {
    expect(isCompletedStatus("complete")).toBe(true);
  });

  it("returns true for 'completed'", () => {
    expect(isCompletedStatus("completed")).toBe(true);
  });

  it("returns true for 'approved'", () => {
    expect(isCompletedStatus("approved")).toBe(true);
  });

  it("returns true for 'success'", () => {
    expect(isCompletedStatus("success")).toBe(true);
  });

  it("is case insensitive", () => {
    expect(isCompletedStatus("COMPLETED")).toBe(true);
    expect(isCompletedStatus("Approved")).toBe(true);
  });

  it("returns false for 'pending'", () => {
    expect(isCompletedStatus("pending")).toBe(false);
  });

  it("returns false for 'rejected'", () => {
    expect(isCompletedStatus("rejected")).toBe(false);
  });

  it("returns false for random text", () => {
    expect(isCompletedStatus("in_progress")).toBe(false);
  });

  it("trims whitespace", () => {
    expect(isCompletedStatus("  completed  ")).toBe(true);
  });
});
