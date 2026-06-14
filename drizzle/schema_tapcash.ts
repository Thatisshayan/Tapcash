import { 
  pgTable, 
  text, 
  varchar, 
  integer, 
  decimal, 
  timestamp, 
  boolean, 
  json, 
  uuid, 
  primaryKey,
  foreignKey,
  index,
  enum as pgEnum,
  serial
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const userStatusEnum = pgEnum('user_status', ['active', 'suspended', 'flagged']);
export const transactionTypeEnum = pgEnum('transaction_type', ['offer', 'payout', 'adjustment']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed', 'reversed']);
export const payoutStatusEnum = pgEnum('payout_status', ['pending', 'approved', 'processing', 'completed', 'failed']);
export const fraudStatusEnum = pgEnum('fraud_status', ['pending', 'approved', 'rejected']);
export const offerCompletionStatusEnum = pgEnum('offer_completion_status', ['pending', 'completed', 'rejected']);

// Users Table
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    displayName: varchar('display_name', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: userRoleEnum('role').notNull().default('user'),
    status: userStatusEnum('status').notNull().default('active'),
    emailVerified: boolean('email_verified').notNull().default(false),
    profileImage: varchar('profile_image', { length: 512 }),
    bio: text('bio'),
    country: varchar('country', { length: 100 }),
    referralCode: varchar('referral_code', { length: 50 }).unique(),
    referredBy: uuid('referred_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    lastActive: timestamp('last_active', { withTimezone: true }),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
    statusIdx: index('users_status_idx').on(table.status),
    referralIdx: index('users_referral_code_idx').on(table.referralCode),
  })
);

// Wallets Table
export const wallets = pgTable(
  'wallets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().unique(),
    balance: decimal('balance', { precision: 20, scale: 2 }).notNull().default('0'),
    pendingBalance: decimal('pending_balance', { precision: 20, scale: 2 }).notNull().default('0'),
    totalEarned: decimal('total_earned', { precision: 20, scale: 2 }).notNull().default('0'),
    totalPaidOut: decimal('total_paid_out', { precision: 20, scale: 2 }).notNull().default('0'),
    totalAdjustments: decimal('total_adjustments', { precision: 20, scale: 2 }).notNull().default('0'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }).onDelete('cascade'),
    userIdIdx: index('wallets_user_id_idx').on(table.userId),
  })
);

// Transactions Table (Ledger)
export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    type: transactionTypeEnum('type').notNull(),
    amount: decimal('amount', { precision: 20, scale: 2 }).notNull(),
    status: transactionStatusEnum('status').notNull().default('pending'),
    reference: varchar('reference', { length: 255 }),
    provider: varchar('provider', { length: 100 }),
    offerId: uuid('offer_id'),
    payoutId: uuid('payout_id'),
    description: text('description'),
    metadata: json('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }).onDelete('cascade'),
    userIdIdx: index('transactions_user_id_idx').on(table.userId),
    typeIdx: index('transactions_type_idx').on(table.type),
    statusIdx: index('transactions_status_idx').on(table.status),
    referenceIdx: index('transactions_reference_idx').on(table.reference),
    createdAtIdx: index('transactions_created_at_idx').on(table.createdAt),
  })
);

// Offers Table
export const offers = pgTable(
  'offers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    provider: varchar('provider', { length: 100 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 100 }).notNull(),
    payout: decimal('payout', { precision: 20, scale: 2 }).notNull(),
    estimatedTime: varchar('estimated_time', { length: 100 }),
    requirements: json('requirements'),
    active: boolean('active').notNull().default(true),
    featured: boolean('featured').notNull().default(false),
    completionCount: integer('completion_count').notNull().default(0),
    rejectionCount: integer('rejection_count').notNull().default(0),
    averageRating: decimal('average_rating', { precision: 3, scale: 2 }),
    providerOfferId: varchar('provider_offer_id', { length: 255 }),
    metadata: json('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    providerIdx: index('offers_provider_idx').on(table.provider),
    categoryIdx: index('offers_category_idx').on(table.category),
    activeIdx: index('offers_active_idx').on(table.active),
    featuredIdx: index('offers_featured_idx').on(table.featured),
  })
);

// Offer Completions Table
export const offerCompletions = pgTable(
  'offer_completions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    offerId: uuid('offer_id').notNull(),
    status: offerCompletionStatusEnum('status').notNull().default('pending'),
    earnedAmount: decimal('earned_amount', { precision: 20, scale: 2 }).notNull(),
    providerReference: varchar('provider_reference', { length: 255 }),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    rejectionReason: text('rejection_reason'),
    metadata: json('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }).onDelete('cascade'),
    offerIdFk: foreignKey({ columns: [table.offerId], foreignColumns: [offers.id] }).onDelete('cascade'),
    userIdIdx: index('offer_completions_user_id_idx').on(table.userId),
    offerIdIdx: index('offer_completions_offer_id_idx').on(table.offerId),
    statusIdx: index('offer_completions_status_idx').on(table.status),
    createdAtIdx: index('offer_completions_created_at_idx').on(table.createdAt),
  })
);

// Payout Methods Table
export const payoutMethods = pgTable(
  'payout_methods',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    method: varchar('method', { length: 100 }).notNull(),
    label: varchar('label', { length: 255 }).notNull(),
    details: json('details').notNull(),
    verified: boolean('verified').notNull().default(false),
    primary: boolean('primary').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }).onDelete('cascade'),
    userIdIdx: index('payout_methods_user_id_idx').on(table.userId),
    methodIdx: index('payout_methods_method_idx').on(table.method),
  })
);

// Payouts Table
export const payouts = pgTable(
  'payouts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    payoutMethodId: uuid('payout_method_id').notNull(),
    amount: decimal('amount', { precision: 20, scale: 2 }).notNull(),
    status: payoutStatusEnum('status').notNull().default('pending'),
    reference: varchar('reference', { length: 255 }).unique(),
    processorReference: varchar('processor_reference', { length: 255 }),
    fee: decimal('fee', { precision: 20, scale: 2 }).notNull().default('0'),
    netAmount: decimal('net_amount', { precision: 20, scale: 2 }).notNull(),
    rejectionReason: text('rejection_reason'),
    metadata: json('metadata'),
    requestedAt: timestamp('requested_at', { withTimezone: true }).notNull().defaultNow(),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    failedAt: timestamp('failed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }).onDelete('cascade'),
    payoutMethodIdFk: foreignKey({ columns: [table.payoutMethodId], foreignColumns: [payoutMethods.id] }).onDelete('restrict'),
    userIdIdx: index('payouts_user_id_idx').on(table.userId),
    statusIdx: index('payouts_status_idx').on(table.status),
    referenceIdx: index('payouts_reference_idx').on(table.reference),
    requestedAtIdx: index('payouts_requested_at_idx').on(table.requestedAt),
  })
);

// Fraud Flags Table
export const fraudFlags = pgTable(
  'fraud_flags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    reason: varchar('reason', { length: 255 }).notNull(),
    riskScore: integer('risk_score').notNull(),
    status: fraudStatusEnum('status').notNull().default('pending'),
    evidence: json('evidence').notNull(),
    notes: text('notes'),
    reviewedBy: uuid('reviewed_by'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }).onDelete('cascade'),
    reviewedByFk: foreignKey({ columns: [table.reviewedBy], foreignColumns: [users.id] }).onDelete('set null'),
    userIdIdx: index('fraud_flags_user_id_idx').on(table.userId),
    statusIdx: index('fraud_flags_status_idx').on(table.status),
    riskScoreIdx: index('fraud_flags_risk_score_idx').on(table.riskScore),
    createdAtIdx: index('fraud_flags_created_at_idx').on(table.createdAt),
  })
);

// Admin Logs Table
export const adminLogs = pgTable(
  'admin_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    adminId: uuid('admin_id').notNull(),
    action: varchar('action', { length: 255 }).notNull(),
    targetType: varchar('target_type', { length: 100 }),
    targetId: uuid('target_id'),
    details: json('details'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    adminIdFk: foreignKey({ columns: [table.adminId], foreignColumns: [users.id] }).onDelete('cascade'),
    adminIdIdx: index('admin_logs_admin_id_idx').on(table.adminId),
    actionIdx: index('admin_logs_action_idx').on(table.action),
    targetTypeIdx: index('admin_logs_target_type_idx').on(table.targetType),
    createdAtIdx: index('admin_logs_created_at_idx').on(table.createdAt),
  })
);

// Provider Postbacks Table
export const providerPostbacks = pgTable(
  'provider_postbacks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    provider: varchar('provider', { length: 100 }).notNull(),
    offerId: uuid('offer_id'),
    userId: varchar('user_id', { length: 255 }),
    transactionId: varchar('transaction_id', { length: 255 }),
    status: varchar('status', { length: 50 }).notNull(),
    amount: decimal('amount', { precision: 20, scale: 2 }),
    rawData: json('raw_data').notNull(),
    processed: boolean('processed').notNull().default(false),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    signature: varchar('signature', { length: 512 }),
    signatureValid: boolean('signature_valid'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    providerIdx: index('provider_postbacks_provider_idx').on(table.provider),
    userIdIdx: index('provider_postbacks_user_id_idx').on(table.userId),
    processedIdx: index('provider_postbacks_processed_idx').on(table.processed),
    createdAtIdx: index('provider_postbacks_created_at_idx').on(table.createdAt),
  })
);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  wallet: one(wallets, {
    fields: [users.id],
    references: [wallets.userId],
  }),
  transactions: many(transactions),
  offerCompletions: many(offerCompletions),
  payoutMethods: many(payoutMethods),
  payouts: many(payouts),
  fraudFlags: many(fraudFlags),
  adminLogs: many(adminLogs),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  offer: one(offers, {
    fields: [transactions.offerId],
    references: [offers.id],
  }),
}));

export const offersRelations = relations(offers, ({ many }) => ({
  completions: many(offerCompletions),
}));

export const offerCompletionsRelations = relations(offerCompletions, ({ one }) => ({
  user: one(users, {
    fields: [offerCompletions.userId],
    references: [users.id],
  }),
  offer: one(offers, {
    fields: [offerCompletions.offerId],
    references: [offers.id],
  }),
}));

export const payoutMethodsRelations = relations(payoutMethods, ({ one, many }) => ({
  user: one(users, {
    fields: [payoutMethods.userId],
    references: [users.id],
  }),
  payouts: many(payouts),
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
  user: one(users, {
    fields: [payouts.userId],
    references: [users.id],
  }),
  payoutMethod: one(payoutMethods, {
    fields: [payouts.payoutMethodId],
    references: [payoutMethods.id],
  }),
}));

export const fraudFlagsRelations = relations(fraudFlags, ({ one }) => ({
  user: one(users, {
    fields: [fraudFlags.userId],
    references: [users.id],
  }),
  reviewedBy: one(users, {
    fields: [fraudFlags.reviewedBy],
    references: [users.id],
  }),
}));

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminLogs.adminId],
    references: [users.id],
  }),
}));
