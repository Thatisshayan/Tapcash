/**
 * Firestore Seed Script
 *
 * Populates Firestore with initial data from shared/tapcash-content.ts
 * Run: npx ts-node --compiler-options '{"module":"commonjs"}' scripts/seed-firestore.ts
 *
 * Requires:
 *   - FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in env
 *   - Firestore initialized in the project
 */

import * as admin from "firebase-admin";

const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!privateKey || !clientEmail || !projectId) {
  console.error("Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.");
  process.exit(1);
}

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  }),
});

const db = admin.firestore(app);

// --- Data from shared/tapcash-content.ts ---

const OFFERS = [
  { id: "survey_habits", title: "Consumer Habits Survey", provider: "RapidoReach", category: "Survey", payoutCoins: 150, estimateMinutes: 8, description: "A short survey with a clean approval path and quick coin credit.", accent: "teal", cta: "Start survey", order: 1 },
  { id: "gaming_bonus", title: "Download and reach level 10", provider: "Lootably", category: "Games", payoutCoins: 800, estimateMinutes: 20, description: "Higher-value completion with a clear progress-based reward.", accent: "blue", cta: "View instructions", order: 2 },
  { id: "daily_watch", title: "Watch a daily video run", provider: "TapCash", category: "Video", payoutCoins: 25, estimateMinutes: 4, description: "A lightweight earn path for quick top-up sessions.", accent: "gold", cta: "Do now", order: 3 },
  { id: "referral_boost", title: "Invite a friend and both earn", provider: "TapCash", category: "Referral", payoutCoins: 250, estimateMinutes: 2, description: "Motivates repeat usage without relying on friction-heavy flows.", accent: "teal", cta: "Share invite", order: 4 },
];

const STATS = [
  { value: "3.9M+", label: "Verified completions", detail: "Offer and survey actions tracked end to end.", order: 1 },
  { value: "50K+", label: "Active earners", detail: "A repeatable rewards loop instead of one-off hype.", order: 2 },
  { value: "$2M+", label: "Total paid out", detail: "Manual review keeps the cashout side disciplined.", order: 3 },
  { value: "24h", label: "Avg payout window", detail: "The queue stays visible even when settlement takes time.", order: 4 },
];

const STEPS = [
  { id: "01", title: "Create and verify", description: "Set up an account, confirm email once, and unlock the full earning surface.", order: 1 },
  { id: "02", title: "Choose a high-fit task", description: "Start with surveys, then stack streaks, missions, and provider offers.", order: 2 },
  { id: "03", title: "Cash out cleanly", description: "Use the payout store and review the ledger before you request a withdrawal.", order: 3 },
];

const FAQS = [
  { question: "Is TapCash a real rewards product?", answer: "Yes. The UI is designed to expose the real backend flow: offer completion, ledger entry, and payout review.", order: 1 },
  { question: "Do I need to verify my email?", answer: "Yes. Email verification unlocks the earning and cashout surfaces, and it keeps the platform more resistant to abuse.", order: 2 },
  { question: "Are payouts automatic?", answer: "Not always. Some methods are manual or queued so the backend can verify risk signals before money moves.", order: 3 },
  { question: "Will the mobile app mirror the web experience?", answer: "Yes. The Expo workspace uses the same content model, CTA hierarchy, and payout-first framing.", order: 4 },
];

const PAYOUT_METHODS = [
  { id: "paypal", label: "PayPal Cash", subtitle: "Fastest mainstream cashout", minCoins: 5000, eta: "Usually under 24h", accent: "teal", audience: "Most users", order: 1 },
  { id: "interac", label: "Interac e-Transfer", subtitle: "Canada-first withdrawal path", minCoins: 5000, eta: "Manual review window", accent: "blue", audience: "Canadian users", order: 2 },
  { id: "bitcoin", label: "Bitcoin", subtitle: "Direct crypto payout", minCoins: 10000, eta: "Queue based", accent: "gold", audience: "Crypto users", order: 3 },
  { id: "gift", label: "Gift cards", subtitle: "Steam, Tim Hortons, and more", minCoins: 5000, eta: "Processed manually", accent: "teal", audience: "Light redeemers", order: 4 },
];

const TRUST_POINTS = [
  { title: "Server-verified actions", description: "Sensitive changes are still verified on the backend before the ledger moves.", order: 1 },
  { title: "Clear payout flow", description: "Cashout methods, thresholds, and status updates are easy to scan.", order: 2 },
  { title: "Mobile-first scanning", description: "The same content model drives the web and the new iPhone shell.", order: 3 },
];

async function seedCollection(name: string, docs: Record<string, unknown>[]) {
  const batch = db.batch();
  const col = db.collection(name);

  // Clear existing
  const existing = await col.get();
  existing.forEach((doc) => batch.delete(doc.ref));

  // Add new
  for (const data of docs) {
    const id = data.id as string;
    const ref = id ? col.doc(id) : col.doc();
    batch.set(ref, { ...data, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  }

  await batch.commit();
  console.log(`  ✓ ${name}: ${docs.length} documents`);
}

async function main() {
  console.log("\n🌱 Firestore Seed\n");

  await seedCollection("offers", OFFERS);
  await seedCollection("site_stats", STATS);
  await seedCollection("steps", STEPS);
  await seedCollection("faq", FAQS);
  await seedCollection("payout_methods", PAYOUT_METHODS);
  await seedCollection("trust_points", TRUST_POINTS);

  console.log("\n✅ Seed complete\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
