/**
 * Mobile-side coin -> CAD conversion.
 *
 * The canonical implementation lives in `shared/currency.ts` (repo root, mapped
 * via `@shared/*`) and is consumed by both web and mobile. This module
 * re-exports it so existing imports (`../lib/currency`) keep working without
 * call-site changes.
 */
export { COINS_PER_CAD, coinsToCad, formatCadFromCoins } from "@shared/currency";
