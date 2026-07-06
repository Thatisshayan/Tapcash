export interface GiftCardBonus {
  method: string;
  label: string;
  bonusPercent: number;
  icon: string;
}

export const GIFT_CARD_BONUSES: GiftCardBonus[] = [
  { method: "steam", label: "Steam Gift Card", bonusPercent: 1, icon: "🎮" },
  { method: "roblox", label: "Roblox Gift Card", bonusPercent: 1, icon: "🧱" },
  { method: "visa", label: "Visa Prepaid Card", bonusPercent: 1, icon: "💳" },
  { method: "tim_hortons", label: "Tim Hortons Gift Card", bonusPercent: 3, icon: "☕" },
  { method: "canadian_tire", label: "Canadian Tire Gift Card", bonusPercent: 3, icon: "🔧" },
  { method: "cineplex", label: "Cineplex Gift Card", bonusPercent: 2, icon: "🎬" },
  { method: "shoppers", label: "Shoppers Drug Mart", bonusPercent: 3, icon: "💊" },
];

export function getGiftCardBonus(method: string): GiftCardBonus | undefined {
  return GIFT_CARD_BONUSES.find((b) => b.method === method);
}

export function applyBonus(amountCoins: number, method: string): { base: number; bonus: number; total: number } {
  const bonusConfig = getGiftCardBonus(method);
  if (!bonusConfig) {
    return { base: amountCoins, bonus: 0, total: amountCoins };
  }
  const bonus = Math.floor(amountCoins * (bonusConfig.bonusPercent / 100));
  return { base: amountCoins, bonus, total: amountCoins + bonus };
}
