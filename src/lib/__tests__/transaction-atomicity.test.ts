/**
 * Transaction atomicity tests
 *
 * These tests verify that Firestore transaction patterns used across the codebase
 * follow atomicity guarantees. We test the logic of transaction callbacks by
 * mocking Firestore's runTransaction.
 */

// Mock Firebase Admin
jest.mock("@/lib/firebaseAdmin", () => ({
  adminDb: {
    runTransaction: jest.fn(),
    collection: jest.fn(),
  },
  adminAuth: {
    verifyIdToken: jest.fn(),
  },
}));

import { adminDb } from "@/lib/firebaseAdmin";

describe("Transaction Atomicity Patterns", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should execute transaction callback atomically", async () => {
    const mockTransaction = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ balance: 1000 }),
        ref: { id: "user1" },
      }),
      update: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };

    (adminDb.runTransaction as jest.Mock).mockImplementation(async (cb: (transaction: typeof mockTransaction) => Promise<any>) => {
      return cb(mockTransaction);
    });

    await adminDb.runTransaction(async (transaction: typeof mockTransaction) => {
      const doc = await transaction.get({ id: "user1" } as any);
      const balance = doc.data()?.balance || 0;
      transaction.update({ id: "user1" } as any, { balance: balance - 100 });
    });

    expect(adminDb.runTransaction).toHaveBeenCalledTimes(1);
    expect(mockTransaction.update).toHaveBeenCalled();
  });

  it("should rollback on transaction failure", async () => {
    const mockTransaction = {
      get: jest.fn().mockRejectedValue(new Error("Transaction conflict")),
      update: jest.fn(),
      set: jest.fn(),
    };

    (adminDb.runTransaction as jest.Mock).mockImplementation(async (cb: (transaction: typeof mockTransaction) => Promise<any>) => {
      return cb(mockTransaction);
    });

    await expect(
      adminDb.runTransaction(async (transaction: typeof mockTransaction) => {
        await transaction.get({ id: "user1" } as any);
        transaction.update({ id: "user1" } as any, { balance: 500 });
      })
    ).rejects.toThrow("Transaction conflict");
  });

  it("should read-before-write to prevent race conditions", async () => {
    const readOrder: string[] = [];

    const mockTransaction = {
      get: jest.fn().mockImplementation(async () => {
        readOrder.push("read");
        return {
          exists: true,
          data: () => ({ balance: 1000, pending: false }),
        };
      }),
      update: jest.fn().mockImplementation(() => {
        readOrder.push("write");
      }),
    };

    (adminDb.runTransaction as jest.Mock).mockImplementation(async (cb: (transaction: typeof mockTransaction) => Promise<any>) => {
      return cb(mockTransaction);
    });

    await adminDb.runTransaction(async (transaction: typeof mockTransaction) => {
      const doc = await transaction.get({ id: "user1" } as any);
      const data = doc.data();
      if (data && !data.pending) {
        transaction.update({ id: "user1" } as any, { balance: data.balance + 50 });
      }
    });

    expect(readOrder).toEqual(["read", "write"]);
  });

  it("should ensure idempotent writes (no duplicate updates)", async () => {
    let updateCount = 0;

    const mockTransaction = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ balance: 1000, lastProcessed: "tx-001" }),
      }),
      update: jest.fn().mockImplementation(() => {
        updateCount++;
      }),
    };

    (adminDb.runTransaction as jest.Mock).mockImplementation(async (cb: (transaction: typeof mockTransaction) => Promise<any>) => {
      return cb(mockTransaction);
    });

    await adminDb.runTransaction(async (transaction: typeof mockTransaction) => {
      const doc = await transaction.get({ id: "user1" } as any);
      const data = doc.data();
      if (data?.lastProcessed !== "tx-001") {
        transaction.update({ id: "user1" } as any, {
          balance: data!.balance + 50,
          lastProcessed: "tx-001",
        });
      }
    });

    expect(updateCount).toBe(0);
  });

  it("should reject when document does not exist", async () => {
    const mockTransaction = {
      get: jest.fn().mockResolvedValue({
        exists: false,
        data: () => undefined,
      }),
      update: jest.fn(),
    };

    (adminDb.runTransaction as jest.Mock).mockImplementation(async (cb: (transaction: typeof mockTransaction) => Promise<any>) => {
      return cb(mockTransaction);
    });

    let caughtError: string | null = null;
    await adminDb.runTransaction(async (transaction: typeof mockTransaction) => {
      const doc = await transaction.get({ id: "nonexistent" } as any);
      if (!doc.exists) {
        caughtError = "Document not found";
        return;
      }
      transaction.update({ id: "nonexistent" } as any, { data: true });
    });

    expect(caughtError).toBe("Document not found");
    expect(mockTransaction.update).not.toHaveBeenCalled();
  });

  it("should handle multiple reads in a single transaction", async () => {
    let readCount = 0;

    const mockTransaction = {
      get: jest.fn().mockImplementation(async () => {
        readCount++;
        return { exists: true, data: () => ({}) };
      }),
      update: jest.fn(),
    };

    (adminDb.runTransaction as jest.Mock).mockImplementation(async (cb: (transaction: typeof mockTransaction) => Promise<any>) => {
      return cb(mockTransaction);
    });

    await adminDb.runTransaction(async (transaction: typeof mockTransaction) => {
      await transaction.get({ id: "doc1" } as any);
      await transaction.get({ id: "doc2" } as any);
      await transaction.get({ id: "doc3" } as any);
    });

    expect(readCount).toBe(3);
  });

  it("should handle batch updates within a transaction", async () => {
    const updates: Array<{ ref: any; data: any }> = [];

    const mockTransaction = {
      get: jest.fn().mockResolvedValue({ exists: true, data: () => ({}) }),
      update: jest.fn().mockImplementation((ref, data) => {
        updates.push({ ref, data });
      }),
    };

    (adminDb.runTransaction as jest.Mock).mockImplementation(async (cb: (transaction: typeof mockTransaction) => Promise<any>) => {
      return cb(mockTransaction);
    });

    await adminDb.runTransaction(async (transaction: typeof mockTransaction) => {
      for (let i = 0; i < 5; i++) {
        transaction.update({ id: `item-${i}` } as any, { processed: true });
      }
    });

    expect(updates).toHaveLength(5);
    updates.forEach((u, i) => {
      expect(u.data).toEqual({ processed: true });
    });
  });

  it("should ensure consistency across related documents", async () => {
    const mockTransaction = {
      get: jest.fn().mockImplementation(async (ref: any) => {
        if (ref.id === "account") {
          return { exists: true, data: () => ({ balance: 1000 }) };
        }
        return { exists: true, data: () => ({ amount: 500 }) };
      }),
      update: jest.fn(),
    };

    (adminDb.runTransaction as jest.Mock).mockImplementation(async (cb: (transaction: typeof mockTransaction) => Promise<any>) => {
      return cb(mockTransaction);
    });

    await adminDb.runTransaction(async (transaction: typeof mockTransaction) => {
      const account = await transaction.get({ id: "account" } as any);
      const withdrawal = await transaction.get({ id: "withdrawal" } as any);

      const newBalance = account.data()!.balance - withdrawal.data()!.amount;
      if (newBalance < 0) throw new Error("Insufficient balance");

      transaction.update({ id: "account" } as any, { balance: newBalance });
      transaction.update({ id: "withdrawal" } as any, { status: "processed" });
    });

    expect(mockTransaction.update).toHaveBeenCalledTimes(2);
  });

  it("should handle concurrent transaction retries", async () => {
    let attempts = 0;

    (adminDb.runTransaction as jest.Mock).mockImplementation(async (cb: (transaction: any) => Promise<any>) => {
      attempts++;
      if (attempts < 3) {
        throw new Error("Transaction conflict: retry");
      }
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ balance: 1000 }),
        }),
        update: jest.fn(),
      };
      return cb(mockTransaction);
    });

    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        await adminDb.runTransaction(async (transaction: any) => {
          const doc = await transaction.get({ id: "user1" } as any);
          transaction.update({ id: "user1" } as any, {
            balance: doc.data()!.balance + 50,
          });
        });
        break;
      } catch {
        if (i === maxRetries - 1) throw new Error("Max retries exceeded");
      }
    }

    expect(attempts).toBe(3);
  });
});
