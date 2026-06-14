import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { eq, desc, and } from 'drizzle-orm';
import { wallets, transactions, users } from '../../drizzle/schema_tapcash';

export const walletRouter = router({
  // Get wallet balance
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    try {
      const wallet = await ctx.db.query.wallets.findFirst({
        where: eq(wallets.userId, ctx.user.id),
      });

      if (!wallet) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Wallet not found',
        });
      }

      return {
        balance: wallet.balance,
        pendingBalance: wallet.pendingBalance,
        totalEarned: wallet.totalEarned,
        totalPaidOut: wallet.totalPaidOut,
        updatedAt: wallet.updatedAt,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch balance',
      });
    }
  }),

  // Get wallet summary
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    try {
      const wallet = await ctx.db.query.wallets.findFirst({
        where: eq(wallets.userId, ctx.user.id),
      });

      if (!wallet) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Wallet not found',
        });
      }

      return {
        balance: wallet.balance,
        pendingBalance: wallet.pendingBalance,
        totalEarned: wallet.totalEarned,
        totalPaidOut: wallet.totalPaidOut,
        totalAdjustments: wallet.totalAdjustments,
        availableToWithdraw: wallet.balance,
        updatedAt: wallet.updatedAt,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch wallet summary',
      });
    }
  }),

  // Get transaction history
  getTransactions: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        type: z.enum(['offer', 'payout', 'adjustment']).optional(),
        status: z.enum(['pending', 'completed', 'failed', 'reversed']).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const where = and(
          eq(transactions.userId, ctx.user.id),
          input.type ? eq(transactions.type, input.type) : undefined,
          input.status ? eq(transactions.status, input.status) : undefined
        );

        const txs = await ctx.db.query.transactions.findMany({
          where,
          orderBy: desc(transactions.createdAt),
          limit: input.limit,
          offset: input.offset,
        });

        const total = await ctx.db.query.transactions.findMany({
          where,
        });

        return {
          transactions: txs.map((tx) => ({
            id: tx.id,
            type: tx.type,
            amount: tx.amount,
            status: tx.status,
            reference: tx.reference,
            provider: tx.provider,
            description: tx.description,
            createdAt: tx.createdAt,
            completedAt: tx.completedAt,
          })),
          total: total.length,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch transactions',
        });
      }
    }),

  // Get pending rewards
  getPending: protectedProcedure.query(async ({ ctx }) => {
    try {
      const pending = await ctx.db.query.transactions.findMany({
        where: and(
          eq(transactions.userId, ctx.user.id),
          eq(transactions.status, 'pending')
        ),
      });

      const totalPending = pending.reduce((sum, tx) => {
        return sum + parseFloat(tx.amount.toString());
      }, 0);

      return {
        count: pending.length,
        total: totalPending,
        transactions: pending.map((tx) => ({
          id: tx.id,
          amount: tx.amount,
          type: tx.type,
          provider: tx.provider,
          createdAt: tx.createdAt,
        })),
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch pending rewards',
      });
    }
  }),

  // Get transaction details
  getTransaction: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        const tx = await ctx.db.query.transactions.findFirst({
          where: and(
            eq(transactions.id, input.id),
            eq(transactions.userId, ctx.user.id)
          ),
        });

        if (!tx) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Transaction not found',
          });
        }

        return {
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          status: tx.status,
          reference: tx.reference,
          provider: tx.provider,
          description: tx.description,
          metadata: tx.metadata,
          createdAt: tx.createdAt,
          completedAt: tx.completedAt,
          updatedAt: tx.updatedAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch transaction',
        });
      }
    }),

  // Get wallet stats
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const wallet = await ctx.db.query.wallets.findFirst({
        where: eq(wallets.userId, ctx.user.id),
      });

      if (!wallet) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Wallet not found',
        });
      }

      // Get transaction counts
      const allTxs = await ctx.db.query.transactions.findMany({
        where: eq(transactions.userId, ctx.user.id),
      });

      const completedTxs = allTxs.filter((tx) => tx.status === 'completed');
      const pendingTxs = allTxs.filter((tx) => tx.status === 'pending');
      const failedTxs = allTxs.filter((tx) => tx.status === 'failed');

      return {
        balance: wallet.balance,
        pendingBalance: wallet.pendingBalance,
        totalEarned: wallet.totalEarned,
        totalPaidOut: wallet.totalPaidOut,
        completedTransactions: completedTxs.length,
        pendingTransactions: pendingTxs.length,
        failedTransactions: failedTxs.length,
        averageTransaction: completedTxs.length > 0
          ? completedTxs.reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0) / completedTxs.length
          : 0,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch wallet stats',
      });
    }
  }),
});
