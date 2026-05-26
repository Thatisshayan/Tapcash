import * as admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

export type LedgerTransactionType =
  | "pending_credit"
  | "approved_credit"
  | "reversed_credit"
  | "cashout_requested"
  | "cashout_paid"
  | "cashout_rejected";

export type LedgerTransactionStatus = "pending" | "approved" | "reversed" | "paid" | "rejected";

export interface LedgerTransactionInput {
  userId: string;
  type: LedgerTransactionType;
  amountCoins: number;
  balanceEffectCoins?: number;
  status?: LedgerTransactionStatus;
  source?: string;
  referenceId?: string;
  createdBy?: string | null;
  id?: string;
  metadata?: Record<string, any>;
}

export interface LedgerTransactionRecord extends LedgerTransactionInput {
  createdAt: any;
  updatedAt: any;
}

export function normalizedLedgerType(type: string): LedgerTransactionType {
  if (
    type === "pending_credit" ||
    type === "approved_credit" ||
    type === "reversed_credit" ||
    type === "cashout_requested" ||
    type === "cashout_paid" ||
    type === "cashout_rejected"
  ) {
    return type;
  }

  return "approved_credit";
}

export function defaultBalanceEffect(type: LedgerTransactionType, amountCoins: number): number {
  switch (type) {
    case "pending_credit":
      return 0;
    case "approved_credit":
      return amountCoins;
    case "reversed_credit":
      return -Math.abs(amountCoins);
    case "cashout_requested":
      return -Math.abs(amountCoins);
    case "cashout_paid":
      return 0;
    case "cashout_rejected":
      return Math.abs(amountCoins);
    default:
      return amountCoins;
  }
}

export async function appendLedgerTransaction(input: LedgerTransactionInput) {
  const type = normalizedLedgerType(input.type);
  const balanceEffectCoins = input.balanceEffectCoins ?? defaultBalanceEffect(type, input.amountCoins);
  const docRef = input.id
    ? adminDb.collection("ledger_transactions").doc(input.id)
    : adminDb.collection("ledger_transactions").doc();

  await docRef.set({
    id: docRef.id,
    userId: input.userId,
    type,
    amountCoins: input.amountCoins,
    balanceEffectCoins,
    status: input.status || inferStatus(type),
    source: input.source || null,
    referenceId: input.referenceId || null,
    createdBy: input.createdBy || null,
    metadata: input.metadata || {},
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return docRef.id;
}

export async function computeLedgerBalance(userId: string) {
  const snapshot = await adminDb
    .collection("ledger_transactions")
    .where("userId", "==", userId)
    .get();

  let balance = 0;
  snapshot.forEach((doc) => {
    const data = doc.data();
    balance += Number(data.balanceEffectCoins || 0);
  });

  return balance;
}

export async function getRecentLedgerTransactions(userId: string, limitCount = 20) {
  const snapshot = await adminDb
    .collection("ledger_transactions")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(limitCount)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function countLedgerTransactions(
  userId: string,
  types: LedgerTransactionType[]
) {
  const snapshot = await adminDb
    .collection("ledger_transactions")
    .where("userId", "==", userId)
    .where("type", "in", types)
    .get();

  return snapshot.size;
}

function inferStatus(type: LedgerTransactionType): LedgerTransactionStatus {
  switch (type) {
    case "pending_credit":
      return "pending";
    case "approved_credit":
      return "approved";
    case "reversed_credit":
      return "reversed";
    case "cashout_requested":
      return "pending";
    case "cashout_paid":
      return "paid";
    case "cashout_rejected":
      return "rejected";
    default:
      return "approved";
  }
}
