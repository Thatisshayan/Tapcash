import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

const ALL_ACHIEVEMENTS: Omit<Achievement, "unlockedAt">[] = [
  { id: "first_earn",     name: "First Coin",      icon: "🪙", description: "Earn your first coins" },
  { id: "streak_3",       name: "Flame Keeper",    icon: "🔥", description: "3-day login streak" },
  { id: "streak_7",       name: "Week Warrior",    icon: "🏆", description: "7-day login streak" },
  { id: "coins_1k",       name: "Four Figures",    icon: "💰", description: "Reach 1,000 coins" },
  { id: "coins_10k",      name: "High Roller",     icon: "💎", description: "Reach 10,000 coins" },
  { id: "coins_100k",     name: "Diamond Earner",  icon: "👑", description: "Reach 100,000 coins" },
  { id: "first_cashout",  name: "Cashed Out",      icon: "💸", description: "Complete your first payout" },
  { id: "first_referral", name: "Referral Boss",   icon: "👥", description: "Refer your first friend" },
  { id: "spin_jackpot",   name: "Lucky Spin",      icon: "🎰", description: "Win 500 coins on a spin" },
];

export async function checkAndAwardAchievements(
  userId: string,
  context: { coins?: number; streakDay?: number; action?: string }
) {
  const achievementsRef = adminDb.collection("users").doc(userId).collection("achievements");
  const existingSnap = await achievementsRef.get();
  const existing = new Set(existingSnap.docs.map((d) => d.id));

  const toAward: string[] = [];

  const { coins = 0, streakDay = 0, action = "" } = context;

  if (!existing.has("first_earn") && coins > 0) toAward.push("first_earn");
  if (!existing.has("streak_3") && streakDay >= 3) toAward.push("streak_3");
  if (!existing.has("streak_7") && streakDay >= 7) toAward.push("streak_7");
  if (!existing.has("coins_1k") && coins >= 1_000) toAward.push("coins_1k");
  if (!existing.has("coins_10k") && coins >= 10_000) toAward.push("coins_10k");
  if (!existing.has("coins_100k") && coins >= 100_000) toAward.push("coins_100k");
  if (!existing.has("first_cashout") && action === "cashout") toAward.push("first_cashout");
  if (!existing.has("first_referral") && action === "referral") toAward.push("first_referral");
  if (!existing.has("spin_jackpot") && action === "spin_jackpot") toAward.push("spin_jackpot");

  for (const id of toAward) {
    const def = ALL_ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) continue;
    await achievementsRef.doc(id).set({
      ...def,
      unlockedAt: FieldValue.serverTimestamp(),
    });
  }

  return toAward;
}

export { ALL_ACHIEVEMENTS };
