import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { eq, desc, and } from 'drizzle-orm';
import { payouts, payoutMethods, wallets, transactions } from '../../drizzle/schema_tapcash';

export const payoutsRouter = router({
  // Get available payout methods
  getMethods: protectedProcedure.query(async ({ ctx }) => {
    try {
      const methods = await ctx.db.query.payoutMethods.findMany({
        where: eq(payoutMethods.userId, ctx.user.id),
      });

      return {
        methods: methods.map((m) => ({
          id: m.id,
          method: m.method,
          label: m.label,
          verified: m.verified,
          primary: m.primary,
        })),
        total: methods.length,
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch payout methods',
      });
    }
  }),

  // Add payout method
  addMethod: protectedProcedure
    .input(
      z.object({
        method: z.enum(['paypal', 'gift_card', 'crypto', 'bank_transfer']),
        label: z.string().min(1).max(255),
        details: z.record(z.any()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const [method] = await ctx.db
          .insert(payoutMethods)
          .values({
            userId: ctx.user.id,
            method: input.method,
            label: input.label,
            details: input.details,
          })
          .returning();

        return {
          success: true,
          method: {
            id: method.id,
            method: method.method,
            label: method.label,
            verified: method.verified,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add payout method',
        });
      }
    }),

  // Update payout method
  updateMethod: protectedProcedure
    .input(
      z.object({
        methodId: z.string().uuid(),
        label: z.string().min(1).max(255).optional(),
        primary: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify ownership
        const method = await ctx.db.query.payoutMethods.findFirst({
          where: and(
            eq(payoutMethods.id, input.methodId),
            eq(payoutMethods.userId, ctx.user.id)
          ),
        });

        if (!method) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Payout method not found',
          });
        }

        // If setting as primary, unset others
        if (input.primary) {
          await ctx.db
            .update(payoutMethods)
            .set({ primary: false })
            .where(eq(payoutMethods.userId, ctx.user.id));
        }

        const [updated] = await ctx.db
          .update(payoutMethods)
          .set({
            label: input.label,
            primary: input.primary,
          })
          .where(eq(payoutMethods.id, input.methodId))
          .returning();

        return {
          success: true,
          method: {
            id: updated.id,
            label: updated.label,
            primary: updated.primary,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update payout method',
        });
      }
    }),

  // Delete payout method
  deleteMethod: protectedProcedure
    .input(z.object({ methodId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const method = await ctx.db.query.payoutMethods.findFirst({
          where: and(
            eq(payoutMethods.id, input.methodId),
            eq(payoutMethods.userId, ctx.user.id)
          ),
        });

        if (!method) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Payout method not found',
          });
        }

        await ctx.db.delete(payoutMethods).where(eq(payoutMethods.id, input.methodId));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete payout method',
        });
      }
    }),

  // Request payout
  requestPayout: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        methodId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Get wallet
        const wallet = await ctx.db.query.wallets.findFirst({
          where: eq(wallets.userId, ctx.user.id),
        });

        if (!wallet) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Wallet not found',
          });
        }

        // Check balance
        const balance = parseFloat(wallet.balance.toString());
        if (balance < input.amount) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Insufficient balance',
          });
        }

        // Verify payout method
        const method = await ctx.db.query.payoutMethods.findFirst({
          where: and(
            eq(payoutMethods.id, input.methodId),
            eq(payoutMethods.userId, ctx.user.id)
          ),
        });

        if (!method) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Payout method not found',
          });
        }

        // Calculate fee (2.5%)
        const fee = input.amount * 0.025;
        const netAmount = input.amount - fee;

        // Generate reference
        const reference = `PAYOUT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create payout
        const [payout] = await ctx.db
          .insert(payouts)
          .values({
            userId: ctx.user.id,
            payoutMethodId: input.methodId,
            amount: input.amount.toString(),
            fee: fee.toString(),
            netAmount: netAmount.toString(),
            reference,
          })
          .returning();

        // Create transaction record
        await ctx.db.insert(transactions).values({
          userId: ctx.user.id,
          type: 'payout',
          amount: (-input.amount).toString(),
          status: 'pending',
          payoutId: payout.id,
          reference,
          description: `Payout request via ${method.label}`,
        });

        // Update wallet (deduct from balance, add to pending)
        const newBalance = balance - input.amount;
        const newPaidOut = parseFloat(wallet.totalPaidOut.toString()) + input.amount;

        await ctx.db
          .update(wallets)
          .set({
            balance: newBalance.toString(),
            totalPaidOut: newPaidOut.toString(),
            updatedAt: new Date(),
          })
          .where(eq(wallets.userId, ctx.user.id));

        return {
          success: true,
          payout: {
            id: payout.id,
            reference,
            amount: input.amount,
            fee,
            netAmount,
            status: payout.status,
            requestedAt: payout.requestedAt,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to request payout',
        });
      }
    }),

  // Get payout history
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        status: z.enum(['pending', 'approved', 'processing', 'completed', 'failed']).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const where = input.status
          ? and(
              eq(payouts.userId, ctx.user.id),
              eq(payouts.status, input.status)
            )
          : eq(payouts.userId, ctx.user.id);

        const payoutsList = await ctx.db.query.payouts.findMany({
          where,
          orderBy: desc(payouts.requestedAt),
          limit: input.limit,
          offset: input.offset,
        });

        const total = await ctx.db.query.payouts.findMany({ where });

        return {
          payouts: payoutsList.map((p) => ({
            id: p.id,
            reference: p.reference,
            amount: p.amount,
            fee: p.fee,
            netAmount: p.netAmount,
            status: p.status,
            requestedAt: p.requestedAt,
            completedAt: p.completedAt,
          })),
          total: total.length,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch payout history',
        });
      }
    }),

  // Get payout details
  getPayout: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        const payout = await ctx.db.query.payouts.findFirst({
          where: and(
            eq(payouts.id, input.id),
            eq(payouts.userId, ctx.user.id)
          ),
        });

        if (!payout) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Payout not found',
          });
        }

        return {
          id: payout.id,
          reference: payout.reference,
          amount: payout.amount,
          fee: payout.fee,
          netAmount: payout.netAmount,
          status: payout.status,
          rejectionReason: payout.rejectionReason,
          requestedAt: payout.requestedAt,
          approvedAt: payout.approvedAt,
          processedAt: payout.processedAt,
          completedAt: payout.completedAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch payout',
        });
      }
    }),

  // Cancel payout (if pending)
  cancelPayout: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const payout = await ctx.db.query.payouts.findFirst({
          where: and(
            eq(payouts.id, input.id),
            eq(payouts.userId, ctx.user.id)
          ),
        });

        if (!payout) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Payout not found',
          });
        }

        if (payout.status !== 'pending') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Cannot cancel ${payout.status} payout`,
          });
        }

        // Refund to wallet
        const wallet = await ctx.db.query.wallets.findFirst({
          where: eq(wallets.userId, ctx.user.id),
        });

        if (wallet) {
          const newBalance = parseFloat(wallet.balance.toString()) + parseFloat(payout.amount.toString());
          await ctx.db
            .update(wallets)
            .set({
              balance: newBalance.toString(),
              updatedAt: new Date(),
            })
            .where(eq(wallets.userId, ctx.user.id));
        }

        // Update payout status
        await ctx.db
          .update(payouts)
          .set({ status: 'failed' })
          .where(eq(payouts.id, input.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel payout',
        });
      }
    }),
});
