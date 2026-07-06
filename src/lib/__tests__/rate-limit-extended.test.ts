import { checkRateLimit } from "../rate-limit";
jest.mock("../redis", () => ({ redis: null }));

describe("Rate Limiter — Extended", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should track remaining count correctly", async () => {
    const ip = "10.0.0.1";
    const options = { limit: 5, windowMs: 10000 };

    const r1 = await checkRateLimit(ip, options);
    expect(r1.remaining).toBe(4);

    const r2 = await checkRateLimit(ip, options);
    expect(r2.remaining).toBe(3);

    const r3 = await checkRateLimit(ip, options);
    expect(r3.remaining).toBe(2);
  });

  it("should return correct limit value", async () => {
    const ip = "10.0.0.2";
    const options = { limit: 10, windowMs: 60000 };

    const result = await checkRateLimit(ip, options);
    expect(result.limit).toBe(10);
  });

  it("should return reset timestamp in the future", async () => {
    const ip = "10.0.0.3";
    const options = { limit: 5, windowMs: 30000 };

    const result = await checkRateLimit(ip, options);
    expect(result.reset).toBeGreaterThan(Date.now());
  });

  it("should handle different IPs independently", async () => {
    const options = { limit: 1, windowMs: 10000 };

    expect((await checkRateLimit("10.0.10.1", options)).success).toBe(true);
    expect((await checkRateLimit("10.0.10.2", options)).success).toBe(true);
  });

  it("should return remaining=0 when exactly at limit", async () => {
    const ip = "10.0.0.4";
    const options = { limit: 2, windowMs: 10000 };

    await checkRateLimit(ip, options);
    const result = await checkRateLimit(ip, options);
    expect(result.remaining).toBe(0);
    expect(result.success).toBe(true);
  });

  it("should reject when over limit and remaining=0", async () => {
    const ip = "10.0.0.5";
    const options = { limit: 2, windowMs: 10000 };

    await checkRateLimit(ip, options);
    await checkRateLimit(ip, options);
    const result = await checkRateLimit(ip, options);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should handle large window sizes", async () => {
    const ip = "10.0.0.6";
    const options = { limit: 100, windowMs: 3600000 };

    const result = await checkRateLimit(ip, options);
    expect(result.success).toBe(true);
    expect(result.limit).toBe(100);
  });
});
