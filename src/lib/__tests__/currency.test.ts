import { COINS_PER_CAD, coinsToCad, formatCadFromCoins } from '../currency';

describe('coin -> CAD conversion', () => {
  it('uses the canonical rate of 1000 coins per $1 CAD', () => {
    expect(COINS_PER_CAD).toBe(1000);
  });

  it('converts 1000 coins to exactly 1 dollar', () => {
    expect(coinsToCad(1000)).toBe(1);
  });

  it('converts a 500-coin offer to $0.50, not $5.00', () => {
    // Regression: OfferCard divided by 100, advertising 10x the real payout.
    expect(coinsToCad(500)).toBe(0.5);
  });

  it('converts 20000 coins (the cashout minimum) to $20', () => {
    expect(coinsToCad(20000)).toBe(20);
  });

  it('handles zero', () => {
    expect(coinsToCad(0)).toBe(0);
  });

  it('formats a 500-coin payout as "0.50"', () => {
    expect(formatCadFromCoins(500)).toBe('0.50');
  });

  it('formats 1000 coins as "1.00"', () => {
    expect(formatCadFromCoins(1000)).toBe('1.00');
  });

  it('formats 2500 coins as "2.50"', () => {
    expect(formatCadFromCoins(2500)).toBe('2.50');
  });

  it('never produces a value 10x the canonical rate', () => {
    // Guards the exact bug class: /100 instead of /1000.
    for (const coins of [100, 500, 1000, 7500, 20000]) {
      expect(coinsToCad(coins)).toBe(coins / 1000);
      expect(coinsToCad(coins)).not.toBe(coins / 100);
    }
  });
});
