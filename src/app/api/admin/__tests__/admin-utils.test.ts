/**
 * Tests for admin API utility functions
 */

describe("ADMIN_UIDS parsing", () => {
  function parseAdminUids(envValue: string): string[] {
    return envValue.split(",").map((u) => u.trim()).filter(Boolean);
  }

  it("parses comma-separated UIDs", () => {
    const result = parseAdminUids("uid1,uid2,uid3");
    expect(result).toEqual(["uid1", "uid2", "uid3"]);
  });

  it("handles whitespace around UIDs", () => {
    const result = parseAdminUids(" uid1 , uid2 ");
    expect(result).toEqual(["uid1", "uid2"]);
  });

  it("filters empty entries", () => {
    const result = parseAdminUids("uid1,,uid2,,");
    expect(result).toEqual(["uid1", "uid2"]);
  });

  it("returns empty array for empty string", () => {
    const result = parseAdminUids("");
    expect(result).toEqual([]);
  });

  it("handles single UID", () => {
    const result = parseAdminUids("admin-uid-123");
    expect(result).toEqual(["admin-uid-123"]);
  });
});

describe("Cashout request status validation", () => {
  function validateStatusTransition(currentStatus: string, action: string): { valid: boolean; error?: string } {
    if (currentStatus !== "pending_review") {
      return { valid: false, error: `Withdrawal already ${currentStatus}` };
    }
    if (!["approve", "reject"].includes(action)) {
      return { valid: false, error: 'Invalid action. Must be "approve" or "reject"' };
    }
    return { valid: true };
  }

  it("allows approve on pending_review", () => {
    expect(validateStatusTransition("pending_review", "approve")).toEqual({ valid: true });
  });

  it("allows reject on pending_review", () => {
    expect(validateStatusTransition("pending_review", "reject")).toEqual({ valid: true });
  });

  it("rejects approve on already approved", () => {
    const result = validateStatusTransition("approved", "approve");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("already");
  });

  it("rejects approve on rejected", () => {
    const result = validateStatusTransition("rejected", "approve");
    expect(result.valid).toBe(false);
  });

  it("rejects invalid action", () => {
    const result = validateStatusTransition("pending_review", "refund");
    expect(result.valid).toBe(false);
  });
});

describe("Rate limit helper", () => {
  function validateRateLimitConfig(limit: number, windowMs: number): { valid: boolean; error?: string } {
    if (!Number.isInteger(limit) || limit < 1) {
      return { valid: false, error: "Limit must be a positive integer" };
    }
    if (!Number.isInteger(windowMs) || windowMs < 1000) {
      return { valid: false, error: "Window must be at least 1000ms" };
    }
    return { valid: true };
  }

  it("accepts valid config", () => {
    expect(validateRateLimitConfig(3, 60000)).toEqual({ valid: true });
  });

  it("rejects zero limit", () => {
    const result = validateRateLimitConfig(0, 60000);
    expect(result.valid).toBe(false);
  });

  it("rejects negative limit", () => {
    const result = validateRateLimitConfig(-1, 60000);
    expect(result.valid).toBe(false);
  });

  it("rejects non-integer limit", () => {
    const result = validateRateLimitConfig(3.5, 60000);
    expect(result.valid).toBe(false);
  });

  it("rejects window under 1000ms", () => {
    const result = validateRateLimitConfig(3, 500);
    expect(result.valid).toBe(false);
  });
});
