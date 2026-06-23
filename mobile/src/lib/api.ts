import { auth } from "./firebase";

const API_BASE_URL = __DEV__ ? "http://localhost:3000" : "https://tapcash.online";

export type ApiOffer = {
  id: string;
  title: string;
  description: string;
  payout: number;
  clickUrl: string;
  provider: string;
  image?: string;
  category?: string;
  deepLink?: string;
};

export type ApiOfferDisplay = {
  id: string;
  title: string;
  provider: string;
  category: string;
  payoutCoins: number;
  estimateMinutes: number;
  description: string;
  accent: "teal" | "blue" | "gold";
  cta: string;
  clickUrl: string;
};

export function mapApiOfferToDisplay(apiOffer: ApiOffer): ApiOfferDisplay {
  return {
    id: apiOffer.id,
    title: apiOffer.title,
    provider: apiOffer.provider,
    category: apiOffer.category || "General",
    payoutCoins: apiOffer.payout || 0,
    estimateMinutes: 10,
    description: apiOffer.description,
    accent: "teal",
    cta: "Start Offer",
    clickUrl: apiOffer.clickUrl || "",
  };
}

class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export async function apiFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });

  if (res.status === 401) {
    await auth.signOut();
    throw new UnauthorizedError();
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = `${res.status} ${res.statusText}`;
    try {
      const json = JSON.parse(text);
      message = json.error || json.message || message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function loadUserBalance(): Promise<{ balanceCoins: number; pendingCoins: number }> {
  const data = await apiFetch<{ balanceCoins: number; pendingCoins: number }>("/api/debug/ledger-summary");
  return { balanceCoins: data.balanceCoins ?? 0, pendingCoins: data.pendingCoins ?? 0 };
}

export async function loadOffers(userId: string, filters?: { category?: string; difficulty?: string }): Promise<ApiOfferDisplay[]> {
  const queryParams = new URLSearchParams();
  queryParams.set("userId", userId);
  if (filters?.category) queryParams.set("category", filters.category);
  if (filters?.difficulty) queryParams.set("difficulty", filters.difficulty);
  const path = `/api/offers?${queryParams.toString()}`;
  const data = await apiFetch<{ offers: ApiOffer[] }>(path);
  return (Array.isArray(data.offers) ? data.offers : []).map(mapApiOfferToDisplay);
}

export async function recordClick(userId: string, offerId: string, provider: string): Promise<{ success: boolean; clickId?: string }> {
  const res = await apiFetch<{ success: boolean; clickId?: string }>("/api/clicks", {
    method: "POST",
    body: JSON.stringify({ userId, offerId, provider }),
  });
  return res;
}

export async function requestPayout(amountCoins: number, method: string, destination: string): Promise<{ success: boolean; withdrawalId?: string; error?: string }> {
  const res = await apiFetch<{ success: boolean; withdrawalId?: string; error?: string }>("/api/payouts/request", {
    method: "POST",
    body: JSON.stringify({ amountCoins, method, destination }),
  });
  return res;
}

export async function loadLeaderboard(): Promise<Array<{ rank: number; displayName: string; coins: number }>> {
  const data = await apiFetch<{ leaderboard: Array<{ rank: number; displayName: string; coins: number }> }>("/api/leaderboard");
  return Array.isArray(data.leaderboard) ? data.leaderboard : [];
}

export async function savePushToken(token: string): Promise<boolean> {
  try {
    await apiFetch("/api/user/push-token", {
      method: "POST",
      body: JSON.stringify({ pushToken: token }),
    });
    return true;
  } catch {
    return false;
  }
}
