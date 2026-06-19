import { tapCashActivity, tapCashLeaderboardSeed, tapCashOffers, tapCashPayoutMethods, type TapCashOffer, type TapCashActivityItem } from "@shared/tapcash-content";
import { auth } from "./firebase";

const API_BASE_URL = "https://tapcash.online";

async function authFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const token = await auth.currentUser?.getIdToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!response.ok) throw new Error(`${path} → ${response.status}`);
  return response.json() as Promise<T>;
}

export async function loadUserProfile(): Promise<{ uid: string; email: string; displayName?: string } | null> {
  try {
    return await authFetch<{ uid: string; email: string; displayName?: string }>("/api/user/profile");
  } catch {
    return null;
  }
}

export async function loadUserBalance(): Promise<{ balanceCoins: number; pendingCoins: number }> {
  try {
    const data = await authFetch<{ balanceCoins: number; pendingCoins: number }>("/api/debug/ledger-summary");
    return { balanceCoins: data.balanceCoins ?? 0, pendingCoins: data.pendingCoins ?? 0 };
  } catch {
    return { balanceCoins: 0, pendingCoins: 0 };
  }
}

export async function loadOffers(filters?: { category?: string; difficulty?: string }): Promise<TapCashOffer[]> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.category) queryParams.set("category", filters.category);
    if (filters?.difficulty) queryParams.set("difficulty", filters.difficulty);
    const path = queryParams.toString() ? `/api/offers?${queryParams}` : "/api/offers";
    const data = await authFetch<{ offers: TapCashOffer[] }>(path);
    return Array.isArray(data.offers) && data.offers.length > 0 ? data.offers : tapCashOffers;
  } catch {
    return tapCashOffers;
  }
}

export async function loadTransactions(limit?: number): Promise<TapCashActivityItem[]> {
  try {
    const path = limit ? `/api/transactions?limit=${limit}` : "/api/transactions";
    const data = await authFetch<{ transactions: TapCashActivityItem[] }>(path);
    return Array.isArray(data.transactions) ? data.transactions : [];
  } catch {
    return [];
  }
}

export async function startOffer(offerId: string): Promise<{ success: boolean; trackingId?: string }> {
  try {
    return await authFetch<{ success: boolean; trackingId?: string }>(`/api/offers/${offerId}/start`, {
      method: "POST",
    });
  } catch {
    return { success: false };
  }
}

export async function requestPayout(amountCoins: number, method: string, destination: string): Promise<{ success: boolean; withdrawalId?: string; error?: string }> {
  try {
    const response = await authFetch<{ success: boolean; withdrawalId?: string; error?: string }>("/api/payouts/request", {
      method: "POST",
      body: JSON.stringify({ amountCoins, method, destination }),
    });
    return response;
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Payout request failed" };
  }
}

export async function loadPayoutHistory(): Promise<Array<{ id: string; amountCoins: number; method: string; status: string; createdAt: string }>> {
  try {
    const data = await authFetch<{ payouts: Array<{ id: string; amountCoins: number; method: string; status: string; createdAt: string }> }>("/api/payouts");
    return Array.isArray(data.payouts) ? data.payouts : [];
  } catch {
    return [];
  }
}

export async function loadLeaderboard(): Promise<Array<{ rank: number; displayName: string; coins: number }>> {
  try {
    const data = await authFetch<{ leaderboard: Array<{ rank: number; displayName: string; coins: number }> }>("/api/leaderboard");
    return Array.isArray(data.leaderboard) && data.leaderboard.length > 0 ? data.leaderboard : tapCashLeaderboardSeed;
  } catch {
    return tapCashLeaderboardSeed;
  }
}

export async function loadActivity(): Promise<string[]> {
  try {
    const data = await authFetch<{ transactions: Array<{ type?: string; amountCoins?: number }> }>("/api/debug/ledger-summary");
    if (Array.isArray(data.transactions) && data.transactions.length > 0) {
      return data.transactions.map((t) => `${t.type ?? "Transaction"} ${t.amountCoins ?? 0} coins`.trim()).filter(Boolean);
    }
    return [];
  } catch {
    return tapCashActivity.map((item) => `${item.label} ${item.detail}`);
  }
}

export function loadPayoutMethods() {
  return tapCashPayoutMethods;
}