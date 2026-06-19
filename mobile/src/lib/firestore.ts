import { db } from "./firebase";
import { collection, query, where, onSnapshot, type QuerySnapshot, type DocumentData } from "firebase/firestore";

export type BalanceState = {
  balanceCoins: number;
  pendingCoins: number;
};

export type Transaction = {
  id: string;
  type: string;
  status: string;
  amountCoins: number;
  source: string;
  createdAt: Date | null;
};

export type CashPathStep = {
  id: string;
  title: string;
  description: string;
};

export function subscribeToBalance(userId: string, callback: (state: BalanceState) => void): () => void {
  const q = query(collection(db, "ledger_transactions"), where("userId", "==", userId));
  
  return onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      let balanceCoins = 0;
      let pendingCoins = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        balanceCoins += Number(data.balanceEffectCoins ?? 0);
        if (data.status === "pending") {
          pendingCoins += Number(data.amountCoins ?? 0);
        }
      });
      
      callback({ balanceCoins, pendingCoins });
    },
    () => callback({ balanceCoins: 0, pendingCoins: 0 })
  );
}

export function subscribeToTransactions(userId: string, callback: (txs: Transaction[]) => void): () => void {
  const q = query(collection(db, "ledger_transactions"), where("userId", "==", userId));
  
  return onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const txs: Transaction[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type ?? "",
          status: data.status ?? "",
          amountCoins: Number(data.amountCoins ?? 0),
          source: data.source ?? "",
          createdAt: data.createdAt?.toDate?.() ?? null,
        };
      });
      
      txs.sort((a, b) => {
        const ta = a.createdAt?.getTime() ?? 0;
        const tb = b.createdAt?.getTime() ?? 0;
        return tb - ta;
      });
      
      callback(txs.slice(0, 10));
    },
    () => callback([])
  );
}

export function subscribeToCashPath(userId: string, callback: (steps: CashPathStep[]) => void): () => void {
  const q = query(collection(db, "cashpath_steps"), where("userId", "==", userId));
  
  return onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const steps: CashPathStep[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title ?? "",
          description: data.description ?? "",
        };
      });
      
      callback(steps);
    },
    () => callback([])
  );
}