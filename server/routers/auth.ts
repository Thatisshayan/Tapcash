import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { users } from '../../drizzle/schema_tapcash';
import bcrypt from 'bcrypt';

export const authRouter = router({
  // Signup
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        displayName: z.string().min(2).max(255),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user exists
        const existing = await ctx.db.query.users.findFirst({
          where: eq(users.email, input.email),
        });

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already registered',
          });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(input.password, 10);

        // Generate referral code
        const referralCode = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create user
        const [newUser] = await ctx.db
          .insert(users)
          .values({
            email: input.email,
            displayName: input.displayName,
            passwordHash,
            referralCode,
          })
          .returning();

        return {
          success: true,
          user: {
            id: newUser.id,
            email: newUser.email,
            displayName: newUser.displayName,
            role: newUser.role,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create account',
        });
      }
    }),

  // Signin
  signin: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Find user
        const user = await ctx.db.query.users.findFirst({
          where: eq(users.email, input.email),
        });

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password',
          });
        }

        // Check password
        const passwordValid = await bcrypt.compare(input.password, user.passwordHash);

        if (!passwordValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid email or password',
          });
        }

        // Check if user is active
        if (user.status !== 'active') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `Account is ${user.status}`,
          });
        }

        // Update last login
        await ctx.db
          .update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, user.id));

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Authentication failed',
        });
      }
    }),

  // Get current user
  me: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.user.id),
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        status: user.status,
        profileImage: user.profileImage,
        country: user.country,
        referralCode: user.referralCode,
        createdAt: user.createdAt,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user',
      });
    }
  }),

  // Update profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        displayName: z.string().min(2).max(255).optional(),
        bio: z.string().max(500).optional(),
        country: z.string().max(100).optional(),
        profileImage: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const [updated] = await ctx.db
          .update(users)
          .set({
            displayName: input.displayName,
            bio: input.bio,
            country: input.country,
            profileImage: input.profileImage,
            updatedAt: new Date(),
          })
          .where(eq(users.id, ctx.user.id))
          .returning();

        return {
          success: true,
          user: {
            id: updated.id,
            email: updated.email,
            displayName: updated.displayName,
            bio: updated.bio,
            country: updated.country,
            profileImage: updated.profileImage,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile',
        });
      }
    }),

  // Change password
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await ctx.db.query.users.findFirst({
          where: eq(users.id, ctx.user.id),
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        // Verify current password
        const passwordValid = await bcrypt.compare(input.currentPassword, user.passwordHash);

        if (!passwordValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Current password is incorrect',
          });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(input.newPassword, 10);

        // Update password
        await ctx.db
          .update(users)
          .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
          .where(eq(users.id, ctx.user.id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to change password',
        });
      }
    }),

  // Logout
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    // Update last active
    await ctx.db
      .update(users)
      .set({ lastActive: new Date() })
      .where(eq(users.id, ctx.user.id));

    return { success: true };
  }),
});
