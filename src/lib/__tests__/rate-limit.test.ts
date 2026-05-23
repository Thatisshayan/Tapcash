import { checkRateLimit } from '../rate-limit';

describe('Rate Limiter', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should allow requests within the limit', () => {
    const ip = '192.168.1.1';
    const options = { limit: 3, windowMs: 10000 };

    expect(checkRateLimit(ip, options).success).toBe(true);
    expect(checkRateLimit(ip, options).success).toBe(true);
    expect(checkRateLimit(ip, options).success).toBe(true);
  });

  it('should block requests exceeding the limit', () => {
    const ip = '192.168.1.2';
    const options = { limit: 2, windowMs: 10000 };

    expect(checkRateLimit(ip, options).success).toBe(true);
    expect(checkRateLimit(ip, options).success).toBe(true);
    
    const blockedResult = checkRateLimit(ip, options);
    expect(blockedResult.success).toBe(false);
    expect(blockedResult.remaining).toBe(0);
  });

  it('should reset the limit after the window expires', () => {
    const ip = '192.168.1.3';
    const options = { limit: 1, windowMs: 5000 };

    expect(checkRateLimit(ip, options).success).toBe(true);
    expect(checkRateLimit(ip, options).success).toBe(false);

    // Fast-forward time past the window
    jest.advanceTimersByTime(5001);

    const resetResult = checkRateLimit(ip, options);
    expect(resetResult.success).toBe(true);
    expect(resetResult.remaining).toBe(0); // 1 limit - 1 count = 0 remaining
  });
});
