/**
 * Canonical coin -> CAD conversion.
 *
 * The platform rate is 1000 coins = $1.00 CAD, established by
 * `shared/tapcash-content.ts` and the payout API (`src/app/api/payout/route.ts`).
 *
 * Import from here instead of hardcoding a divisor. Both OfferCard components
 * previously divided by 100, advertising 10x the real payout to users.
 */

export const COINS_PER_CAD = 1000;

/** Convert a coin amount to its CAD value as a number. */
export function coinsToCad(coins: number): number {
  return coins / COINS_PER_CAD;
}

/** Convert a coin amount to a fixed 2-decimal CAD string, e.g. "0.50". */
export function formatCadFromCoins(coins: number): string {
  return coinsToCad(coins).toFixed(2);
}
