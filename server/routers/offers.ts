import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { eq, desc, and, isNull } from 'drizzle-orm';
import { offers, offerCompletions, transactions, wallets } from '../../drizzle/schema_tapcash';

export const offersRouter = router({
  // List all available offers
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        category: z.string().optional(),
        provider: z.string().optional(),
        featured: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const where = and(
          eq(offers.active, true),
          input.category ? eq(offers.category, input.category) : undefined,
          input.provider ? eq(offers.provider, input.provider) : undefined,
          input.featured ? eq(offers.featured, true) : undefined
        );

        const offersList = await ctx.db.query.offers.findMany({
          where,
          orderBy: desc(offers.featured),
          limit: input.limit,
          offset: input.offset,
        });

        const total = await ctx.db.query.offers.findMany({ where });

        return {
          offers: offersList.map((offer) => ({
            id: offer.id,
            title: offer.title,
            description: offer.description,
            category: offer.category,
            provider: offer.provider,
            payout: offer.payout,
            estimatedTime: offer.estimatedTime,
            completionCount: offer.completionCount,
            averageRating: offer.averageRating,
            featured: offer.featured,
          })),
          total: total.length,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch offers',
        });
      }
    }),

  // Get offer details
  getOffer: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      try {
        const offer = await ctx.db.query.offers.findFirst({
          where: eq(offers.id, input.id),
        });

        if (!offer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Offer not found',
          });
        }

        return {
          id: offer.id,
          title: offer.title,
          description: offer.description,
          category: offer.category,
          provider: offer.provider,
          payout: offer.payout,
          estimatedTime: offer.estimatedTime,
          requirements: offer.requirements,
          completionCount: offer.completionCount,
          rejectionCount: offer.rejectionCount,
          averageRating: offer.averageRating,
          featured: offer.featured,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch offer',
        });
      }
    }),

  // Start offer
  startOffer: protectedProcedure
    .input(z.object({ offerId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const offer = await ctx.db.query.offers.findFirst({
          where: eq(offers.id, input.offerId),
        });

        if (!offer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Offer not found',
          });
        }

        // Check if user already has pending/completed this offer
        const existing = await ctx.db.query.offerCompletions.findFirst({
          where: and(
            eq(offerCompletions.userId, ctx.user.id),
            eq(offerCompletions.offerId, input.offerId)
          ),
        });

        if (existing && existing.status !== 'rejected') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'You have already started this offer',
          });
        }

        // Create offer completion record
        const [completion] = await ctx.db
          .insert(offerCompletions)
          .values({
            userId: ctx.user.id,
            offerId: input.offerId,
            earnedAmount: offer.payout,
            status: 'pending',
          })
          .returning();

        return {
          success: true,
          completion: {
            id: completion.id,
            offerId: completion.offerId,
            status: completion.status,
            earnedAmount: completion.earnedAmount,
            startedAt: completion.startedAt,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to start offer',
        });
      }
    }),

  // Mark offer as complete
  completeOffer: protectedProcedure
    .input(z.object({ completionId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const completion = await ctx.db.query.offerCompletions.findFirst({
          where: and(
            eq(offerCompletions.id, input.completionId),
            eq(offerCompletions.userId, ctx.user.id)
          ),
        });

        if (!completion) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Offer completion not found',
          });
        }

        if (completion.status !== 'pending') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Offer is already ${completion.status}`,
          });
        }

        // Update completion status
        const [updated] = await ctx.db
          .update(offerCompletions)
          .set({
            status: 'completed',
            completedAt: new Date(),
            verifiedAt: new Date(),
          })
          .where(eq(offerCompletions.id, input.completionId))
          .returning();

        // Create transaction
        await ctx.db.insert(transactions).values({
          userId: ctx.user.id,
          type: 'offer',
          amount: completion.earnedAmount,
          status: 'completed',
          offerId: completion.offerId,
          description: `Offer completion reward`,
        });

        // Update wallet balance
        const wallet = await ctx.db.query.wallets.findFirst({
          where: eq(wallets.userId, ctx.user.id),
        });

        if (wallet) {
          const newBalance = parseFloat(wallet.balance.toString()) + parseFloat(completion.earnedAmount.toString());
          const newEarned = parseFloat(wallet.totalEarned.toString()) + parseFloat(completion.earnedAmount.toString());

          await ctx.db
            .update(wallets)
            .set({
              balance: newBalance.toString(),
              totalEarned: newEarned.toString(),
              updatedAt: new Date(),
            })
            .where(eq(wallets.userId, ctx.user.id));
        }

        return {
          success: true,
          completion: {
            id: updated.id,
            status: updated.status,
            earnedAmount: updated.earnedAmount,
            completedAt: updated.completedAt,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to complete offer',
        });
      }
    }),

  // Get user's offer progress
  getUserProgress: protectedProcedure.query(async ({ ctx }) => {
    try {
      const completions = await ctx.db.query.offerCompletions.findMany({
        where: eq(offerCompletions.userId, ctx.user.id),
      });

      const completed = completions.filter((c) => c.status === 'completed');
      const pending = completions.filter((c) => c.status === 'pending');
      const rejected = completions.filter((c) => c.status === 'rejected');

      return {
        totalCompleted: completed.length,
        totalPending: pending.length,
        totalRejected: rejected.length,
        totalEarned: completed.reduce((sum, c) => sum + parseFloat(c.earnedAmount.toString()), 0),
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user progress',
      });
    }
  }),

  // Get user's completed offers
  getCompleted: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const completed = await ctx.db.query.offerCompletions.findMany({
          where: and(
            eq(offerCompletions.userId, ctx.user.id),
            eq(offerCompletions.status, 'completed')
          ),
          orderBy: desc(offerCompletions.completedAt),
          limit: input.limit,
          offset: input.offset,
        });

        return {
          completions: completed.map((c) => ({
            id: c.id,
            offerId: c.offerId,
            earnedAmount: c.earnedAmount,
            completedAt: c.completedAt,
          })),
          total: completed.length,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch completed offers',
        });
      }
    }),

  // Get user's pending offers
  getPending: protectedProcedure.query(async ({ ctx }) => {
    try {
      const pending = await ctx.db.query.offerCompletions.findMany({
        where: and(
          eq(offerCompletions.userId, ctx.user.id),
          eq(offerCompletions.status, 'pending')
        ),
      });

      return {
        completions: pending.map((c) => ({
          id: c.id,
          offerId: c.offerId,
          earnedAmount: c.earnedAmount,
          startedAt: c.startedAt,
        })),
        total: pending.length,
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch pending offers',
      });
    }
  }),
});
