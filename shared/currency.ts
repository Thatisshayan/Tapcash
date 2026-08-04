/**
 * Canonical coin -> CAD conversion — shared source of truth for web and mobile.
 *
 * The platform rate is 1000 coins = $1.00 CAD, established by
 * `shared/tapcash-content.ts` and the payout API (`src/app/api/payout/route.ts`).
 *
 * Both platforms import from here so a future rate change cannot make web and
 * mobile payout displays diverge. (Previously each side had its own copy.)
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
