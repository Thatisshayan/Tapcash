import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { users, wallets, transactions, payouts, fraudFlags, adminLogs, offers, offerCompletions } from '../../drizzle/schema_tapcash';

// Admin middleware
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // Dashboard Overview
  getOverview: adminProcedure.query(async ({ ctx }) => {
    try {
      // Get all users
      const allUsers = await ctx.db.query.users.findMany();
      const activeUsers = allUsers.filter((u) => u.status === 'active');

      // Get all wallets
      const allWallets = await ctx.db.query.wallets.findMany();
      const totalBalance = allWallets.reduce((sum, w) => sum + parseFloat(w.balance.toString()), 0);
      const totalEarned = allWallets.reduce((sum, w) => sum + parseFloat(w.totalEarned.toString()), 0);
      const totalPaidOut = allWallets.reduce((sum, w) => sum + parseFloat(w.totalPaidOut.toString()), 0);

      // Get transactions
      const allTransactions = await ctx.db.query.transactions.findMany();
      const completedTxs = allTransactions.filter((t) => t.status === 'completed');
      const totalRevenue = completedTxs.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      // Get payouts
      const allPayouts = await ctx.db.query.payouts.findMany();
      const completedPayouts = allPayouts.filter((p) => p.status === 'completed');

      // Get fraud flags
      const allFraudFlags = await ctx.db.query.fraudFlags.findMany();
      const pendingFlags = allFraudFlags.filter((f) => f.status === 'pending');

      return {
        users: {
          total: allUsers.length,
          active: activeUsers.length,
          suspended: allUsers.filter((u) => u.status === 'suspended').length,
          flagged: allUsers.filter((u) => u.status === 'flagged').length,
        },
        revenue: {
          total: totalRevenue,
          earned: totalEarned,
          paidOut: totalPaidOut,
          pending: totalBalance,
        },
        transactions: {
          total: allTransactions.length,
          completed: completedTxs.length,
          pending: allTransactions.filter((t) => t.status === 'pending').length,
          failed: allTransactions.filter((t) => t.status === 'failed').length,
        },
        payouts: {
          total: allPayouts.length,
          completed: completedPayouts.length,
          pending: allPayouts.filter((p) => p.status === 'pending').length,
          failed: allPayouts.filter((p) => p.status === 'failed').length,
        },
        fraud: {
          total: allFraudFlags.length,
          pending: pendingFlags.length,
          approved: allFraudFlags.filter((f) => f.status === 'approved').length,
          rejected: allFraudFlags.filter((f) => f.status === 'rejected').length,
        },
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch overview',
      });
    }
  }),

  // User Management
  listUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: z.enum(['active', 'suspended', 'flagged']).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const allUsers = await ctx.db.query.users.findMany();

        let filtered = allUsers;
        if (input.status) {
          filtered = filtered.filter((u) => u.status === input.status);
        }
        if (input.search) {
          const search = input.search.toLowerCase();
          filtered = filtered.filter(
            (u) =>
              u.email.toLowerCase().includes(search) ||
              u.displayName.toLowerCase().includes(search)
          );
        }

        const paginated = filtered.slice(input.offset, input.offset + input.limit);

        return {
          users: paginated.map((u) => ({
            id: u.id,
            email: u.email,
            displayName: u.displayName,
            status: u.status,
            role: u.role,
            createdAt: u.createdAt,
            lastActive: u.lastActive,
          })),
          total: filtered.length,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch users',
        });
      }
    }),

  // Get user details
  getUser: adminProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        const user = await ctx.db.query.users.findFirst({
          where: eq(users.id, input.userId),
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        const wallet = await ctx.db.query.wallets.findFirst({
          where: eq(wallets.userId, input.userId),
        });

        const userTransactions = await ctx.db.query.transactions.findMany({
          where: eq(transactions.userId, input.userId),
        });

        return {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          status: user.status,
          role: user.role,
          country: user.country,
          createdAt: user.createdAt,
          lastActive: user.lastActive,
          wallet: wallet ? {
            balance: wallet.balance,
            pendingBalance: wallet.pendingBalance,
            totalEarned: wallet.totalEarned,
            totalPaidOut: wallet.totalPaidOut,
          } : null,
          transactionCount: userTransactions.length,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user',
        });
      }
    }),

  // Update user status
  updateUserStatus: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        status: z.enum(['active', 'suspended', 'flagged']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const [updated] = await ctx.db
          .update(users)
          .set({ status: input.status, updatedAt: new Date() })
          .where(eq(users.id, input.userId))
          .returning();

        // Log admin action
        await ctx.db.insert(adminLogs).values({
          adminId: ctx.user.id,
          action: 'UPDATE_USER_STATUS',
          targetType: 'user',
          targetId: input.userId,
          details: { newStatus: input.status },
        });

        return {
          success: true,
          user: {
            id: updated.id,
            status: updated.status,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user status',
        });
      }
    }),

  // Transaction Management
  listTransactions: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: z.enum(['pending', 'completed', 'failed', 'reversed']).optional(),
        type: z.enum(['offer', 'payout', 'adjustment']).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const allTxs = await ctx.db.query.transactions.findMany();

        let filtered = allTxs;
        if (input.status) {
          filtered = filtered.filter((t) => t.status === input.status);
        }
        if (input.type) {
          filtered = filtered.filter((t) => t.type === input.type);
        }

        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        const paginated = filtered.slice(input.offset, input.offset + input.limit);

        return {
          transactions: paginated.map((t) => ({
            id: t.id,
            userId: t.userId,
            type: t.type,
            amount: t.amount,
            status: t.status,
            reference: t.reference,
            createdAt: t.createdAt,
          })),
          total: filtered.length,
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

  // Fraud Management
  listFraudFlags: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const allFlags = await ctx.db.query.fraudFlags.findMany();

        let filtered = allFlags;
        if (input.status) {
          filtered = filtered.filter((f) => f.status === input.status);
        }

        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        const paginated = filtered.slice(input.offset, input.offset + input.limit);

        return {
          flags: paginated.map((f) => ({
            id: f.id,
            userId: f.userId,
            reason: f.reason,
            riskScore: f.riskScore,
            status: f.status,
            createdAt: f.createdAt,
          })),
          total: filtered.length,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch fraud flags',
        });
      }
    }),

  // Get fraud flag details
  getFraudFlag: adminProcedure
    .input(z.object({ flagId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        const flag = await ctx.db.query.fraudFlags.findFirst({
          where: eq(fraudFlags.id, input.flagId),
        });

        if (!flag) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Fraud flag not found',
          });
        }

        return {
          id: flag.id,
          userId: flag.userId,
          reason: flag.reason,
          riskScore: flag.riskScore,
          status: flag.status,
          evidence: flag.evidence,
          notes: flag.notes,
          createdAt: flag.createdAt,
          reviewedAt: flag.reviewedAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch fraud flag',
        });
      }
    }),

  // Approve fraud flag
  approveFraudFlag: adminProcedure
    .input(z.object({ flagId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const [updated] = await ctx.db
          .update(fraudFlags)
          .set({
            status: 'approved',
            reviewedBy: ctx.user.id,
            reviewedAt: new Date(),
          })
          .where(eq(fraudFlags.id, input.flagId))
          .returning();

        // Log admin action
        await ctx.db.insert(adminLogs).values({
          adminId: ctx.user.id,
          action: 'APPROVE_FRAUD_FLAG',
          targetType: 'fraud_flag',
          targetId: input.flagId,
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to approve fraud flag',
        });
      }
    }),

  // Reject fraud flag
  rejectFraudFlag: adminProcedure
    .input(z.object({ flagId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const [updated] = await ctx.db
          .update(fraudFlags)
          .set({
            status: 'rejected',
            reviewedBy: ctx.user.id,
            reviewedAt: new Date(),
          })
          .where(eq(fraudFlags.id, input.flagId))
          .returning();

        // Log admin action
        await ctx.db.insert(adminLogs).values({
          adminId: ctx.user.id,
          action: 'REJECT_FRAUD_FLAG',
          targetType: 'fraud_flag',
          targetId: input.flagId,
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reject fraud flag',
        });
      }
    }),

  // Create fraud flag
  createFraudFlag: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        reason: z.string().min(10),
        riskScore: z.number().min(0).max(100),
        evidence: z.record(z.any()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const [flag] = await ctx.db
          .insert(fraudFlags)
          .values({
            userId: input.userId,
            reason: input.reason,
            riskScore: input.riskScore,
            evidence: input.evidence,
          })
          .returning();

        // Log admin action
        await ctx.db.insert(adminLogs).values({
          adminId: ctx.user.id,
          action: 'CREATE_FRAUD_FLAG',
          targetType: 'fraud_flag',
          targetId: flag.id,
        });

        return {
          success: true,
          flag: {
            id: flag.id,
            userId: flag.userId,
            riskScore: flag.riskScore,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create fraud flag',
        });
      }
    }),

  // Get admin logs
  getLogs: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        action: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const allLogs = await ctx.db.query.adminLogs.findMany();

        let filtered = allLogs;
        if (input.action) {
          filtered = filtered.filter((l) => l.action === input.action);
        }

        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        const paginated = filtered.slice(input.offset, input.offset + input.limit);

        return {
          logs: paginated.map((l) => ({
            id: l.id,
            adminId: l.adminId,
            action: l.action,
            targetType: l.targetType,
            targetId: l.targetId,
            createdAt: l.createdAt,
          })),
          total: filtered.length,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch admin logs',
        });
      }
    }),
});
