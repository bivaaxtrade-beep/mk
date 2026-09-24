import { pgTable, serial, text, numeric, boolean, uniqueIndex, index, timestamp, integer, bigint } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  nickname: text('nickname'),
  photoURL: text('photo_url'),
  passwordHash: text('password_hash'),
  realBalance: numeric('real_balance').default('0.00'),
  demoBalance: numeric('demo_balance').default('10000.00'),
  currency: text('currency').default('USD'),
  tfaEnabled: boolean('tfa_enabled').default(false),
  tfaMode: text('tfa_mode').default('app'),
  tfaSecret: text('tfa_secret'),
  isVerified: boolean('is_verified').default(false),
  isEmailVerified: boolean('is_email_verified').default(false),
  isNidVerified: boolean('is_nid_verified').default(false),
  nidNumber: text('nid_number'),
  isAdmin: boolean('is_admin').default(false),
  phone: text('phone'),
  country: text('country'),
  countryCode: text('country_code'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  gender: text('gender'),
  dob: text('dob'),
  birthDay: text('birth_day'),
  birthMonth: text('birth_month'),
  birthYear: text('birth_year'),
  timeZone: text('time_zone'),
  language: text('language'),
  newsletter: boolean('newsletter').default(true),
  allowNotifications: boolean('allow_notifications').default(true),
  status: text('status').default('Standard'),
  kycStatus: text('kyc_status').default('unverified'),
  referredByUid: text('referred_by_uid'),
  referralCode: text('referral_code'),
  referralSubId: text('referral_sub_id'),
  referralType: text('referral_type'),
  affiliateBalance: numeric('affiliate_balance').default('0.00'),
  totalAffiliateEarnings: numeric('total_affiliate_earnings').default('0.00'),
  referralCount: integer('referral_count').default(0),
  customAffiliateShare: integer('custom_affiliate_share'),
  withdrawalOtp: text('withdrawal_otp'),
  withdrawalOtpExpiresAt: bigint('withdrawal_otp_expires_at', { mode: 'number' }),
  totalLiveVolume: numeric('total_live_volume').default('0.00'),
  manipulationMode: text('manipulation_mode').default('neutral'),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const trades = pgTable('trades', {
  id: serial('id').primaryKey(),
  firebaseId: text('firebase_id'),
  userId: text('user_id').notNull(),
  marketId: text('market_id').notNull(),
  asset: text('asset'),
  amount: numeric('amount').notNull(),
  direction: text('direction').notNull(),
  type: text('type'),
  entryPrice: numeric('entry_price').notNull(),
  exitPrice: numeric('exit_price'),
  duration: integer('duration').notNull(),
  timeLeft: integer('time_left'),
  expiryTime: bigint('expiry_time', { mode: 'number' }).notNull(),
  expirationTime: text('expiration_time'),
  isDemo: boolean('is_demo').default(true),
  accountType: text('account_type').default('demo'),
  tournamentId: text('tournament_id'),
  status: text('status').default('open'),
  targetResult: text('target_result'), // 'win', 'loss', or null
  payoutAmount: numeric('payout_amount'),
  payout: text('payout'),
  settledAt: timestamp('settled_at'),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
}));

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(),
  amount: numeric('amount').notNull(),
  currency: text('currency').default('USD'),
  status: text('status').default('pending'),
  method: text('method').default('direct'),
  txHash: text('tx_hash'),
  details: text('details'), 
  updatedAt: timestamp('updated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id'),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  details: text('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const loginHistory = pgTable('login_history', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  status: text('status').default('success'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const kycRequests = pgTable('kyc_requests', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  status: text('status').default('pending'),
  fullName: text('full_name'),
  documentType: text('document_type'),
  documentNumber: text('document_number'),
  frontImage: text('front_image'),
  backImage: text('back_image'),
  selfieImage: text('selfie_image'),
  rejectionReason: text('rejection_reason'),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tickets = pgTable('tickets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  lastMessage: text('last_message'),
  status: text('status').default('open'),
  priority: text('priority').default('medium'),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const ticketMessages = pgTable('ticket_messages', {
  id: text('id').primaryKey(),
  ticketId: text('ticket_id').notNull(),
  userId: text('user_id').notNull(),
  message: text('message').notNull(),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  trades: many(trades),
  transactions: many(transactions),
  kycRequests: many(kycRequests),
  tickets: many(tickets),
}));

export const tradesRelations = relations(trades, ({ one }) => ({
  user: one(users, {
    fields: [trades.userId],
    references: [users.uid],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.uid],
  }),
}));

export const kycRequestsRelations = relations(kycRequests, ({ one }) => ({
  user: one(users, {
    fields: [kycRequests.userId],
    references: [users.uid],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  user: one(users, {
    fields: [tickets.userId],
    references: [users.uid],
  }),
  messages: many(ticketMessages),
}));

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketMessages.ticketId],
    references: [tickets.id],
  }),
}));

export const candles = pgTable('candles', {
  id: serial('id').primaryKey(),
  pair: text('pair').notNull(),
  type: text('type').notNull(), // 'real' or 'demo'
  time: bigint('time', { mode: 'number' }).notNull(), // timestamp in seconds
  open: numeric('open').notNull(),
  high: numeric('high').notNull(),
  low: numeric('low').notNull(),
  close: numeric('close').notNull(),
  volume: numeric('volume').notNull(),
}, (table) => ({
  pairTypeTimeIdx: uniqueIndex('pair_type_time_idx').on(table.pair, table.type, table.time),
}));

export const tournaments = pgTable('tournaments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  title: text('title'), // Alternative for name
  description: text('description'),
  prizePool: numeric('prize_pool').default('0.00'),
  entryFee: numeric('entry_fee').default('0.00'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: text('status').default('upcoming'), // 'upcoming', 'active', 'finished'
  type: text('type').default('daily'),
  rules: text('rules'),
  participantCount: integer('participant_count').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const masterTraders = pgTable('master_traders', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  country: text('country'),
  winRate: integer('win_rate').default(0),
  profit: numeric('profit').default('0.00'),
  followers: integer('followers').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const activeCopies = pgTable('active_copies', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  masterId: text('master_id').notNull(),
  masterName: text('master_name'),
  maxTradeAmount: numeric('max_trade_amount').default('10.00'),
  tradesLimit: integer('trades_limit').default(0),
  copiedTrades: integer('copied_trades').default(0),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});


