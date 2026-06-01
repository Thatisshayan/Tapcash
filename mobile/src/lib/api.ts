import { tapCashActivity, tapCashLeaderboardSeed, tapCashOffers, tapCashPayoutMethods } from "../../../shared/tapcash-content";

const API_BASE_URL =
  typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://tapcash.online";

export async function loadOffers() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/offers`);
    if (!response.ok) throw new Error("Offers unavailable");
    const data = (await response.json()) as { offers?: unknown[] };
    return Array.isArray(data.offers) && data.offers.length > 0 ? data.offers : tapCashOffers;
  } catch {
    return tapCashOffers;
  }
}

export async function loadLeaderboard() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard`);
    if (!response.ok) throw new Error("Leaderboard unavailable");
    const data = (await response.json()) as { leaderboard?: unknown[] };
    return Array.isArray(data.leaderboard) && data.leaderboard.length > 0 ? data.leaderboard : tapCashLeaderboardSeed;
  } catch {
    return tapCashLeaderboardSeed;
  }
}

export async function loadActivity() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/activity`);
    if (!response.ok) throw new Error("Activity unavailable");
    const data = (await response.json()) as { items?: string[] };
    return Array.isArray(data.items) && data.items.length > 0 ? data.items : tapCashActivity.map((item) => `${item.label} ${item.detail}`);
  } catch {
    return tapCashActivity.map((item) => `${item.label} ${item.detail}`);
  }
}

export function loadPayoutMethods() {
  return tapCashPayoutMethods;
}
