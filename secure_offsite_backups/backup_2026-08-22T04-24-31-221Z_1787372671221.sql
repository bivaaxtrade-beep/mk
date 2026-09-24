-- Bivaax Trade Enterprise Backup (Logical Fallback)
-- Generated at: 2026-08-22T04:24:31.221Z
-- Requested by: system_pre_boot
-- Database type: SQLite


--
-- Table structure for users
--

-- Dumping data for table users (2 rows)
INSERT OR IGNORE INTO "users" ("id", "uid", "email", "display_name", "nickname", "photo_url", "password_hash", "real_balance", "demo_balance", "currency", "tfa_enabled", "tfa_mode", "tfa_secret", "is_verified", "is_email_verified", "is_nid_verified", "nid_number", "is_admin", "phone", "country", "country_code", "first_name", "last_name", "gender", "dob", "status", "kyc_status", "referred_by_uid", "referral_code", "referral_sub_id", "referral_type", "affiliate_balance", "total_affiliate_earnings", "referral_count", "custom_affiliate_share", "withdrawal_otp", "withdrawal_otp_expires_at", "total_live_volume", "updated_at", "created_at", "smart_mode_enabled", "smart_mode_strategy", "manipulation_mode") VALUES (1, 'admin_seed_56fqiu8q', 'hamproosapport@gmail.com', 'Bivaax Super Admin', 'Admin', NULL, '$2b$10$T/dfqfKCqSroB55Y19UCbuz4Ts6kt23bNpnvYWSc/dagQ/ehDI5R6', 1000, 10000, 'USD', 0, 'app', NULL, 1, 0, 0, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Standard', 'unverified', NULL, '1GJAEJ', NULL, NULL, 0, 0, 0, NULL, NULL, NULL, 0, NULL, 1787369230917, 0, 'auto_25_percent', 'neutral');
INSERT OR IGNORE INTO "users" ("id", "uid", "email", "display_name", "nickname", "photo_url", "password_hash", "real_balance", "demo_balance", "currency", "tfa_enabled", "tfa_mode", "tfa_secret", "is_verified", "is_email_verified", "is_nid_verified", "nid_number", "is_admin", "phone", "country", "country_code", "first_name", "last_name", "gender", "dob", "status", "kyc_status", "referred_by_uid", "referral_code", "referral_sub_id", "referral_type", "affiliate_balance", "total_affiliate_earnings", "referral_count", "custom_affiliate_share", "withdrawal_otp", "withdrawal_otp_expires_at", "total_live_volume", "updated_at", "created_at", "smart_mode_enabled", "smart_mode_strategy", "manipulation_mode") VALUES (2, 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'hasan1@gmail.com', 'hasan1', NULL, NULL, NULL, 0, 10001.8, 'USD', 0, 'app', NULL, 0, 0, 0, NULL, 1, NULL, 'Bangladesh', 'BD', NULL, NULL, NULL, NULL, 'Standard', 'unverified', NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, NULL, 0, NULL, NULL, 0, 'auto_25_percent', 'neutral');

--
-- Table structure for tournaments
--

-- Dumping data for table tournaments (3 rows)
INSERT OR IGNORE INTO "tournaments" ("id", "type", "title", "description", "banner_url", "prize_pool", "entry_fee", "min_players", "max_players", "start_time", "end_time", "status", "is_locked", "requirements", "created_at") VALUES ('t-daily-free', 'Daily Free', 'Daily Freebie Blast', 'Join the daily free tournament and win real cash prizes! No entry fee required.', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000', 100, 0, 10, 1000, 1787372831923, 1787455631923, 'scheduled', 0, '{"minBalance":0}', 1787369231923);
INSERT OR IGNORE INTO "tournaments" ("id", "type", "title", "description", "banner_url", "prize_pool", "entry_fee", "min_players", "max_players", "start_time", "end_time", "status", "is_locked", "requirements", "created_at") VALUES ('t-weekly-pro', 'Weekly', 'Weekly Pro Challenge', 'Compete with the best for a massive prize pool. Show your trading skills!', 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=1000', 5000, 10, 50, 5000, 1787542031923, 1788146831923, 'scheduled', 1, '{"minBalance":100,"kycRequired":true}', 1787369231923);
INSERT OR IGNORE INTO "tournaments" ("id", "type", "title", "description", "banner_url", "prize_pool", "entry_fee", "min_players", "max_players", "start_time", "end_time", "status", "is_locked", "requirements", "created_at") VALUES ('t-prestige-elite', 'Prestige', 'Elite Prestige Cup', 'The ultimate tournament for our VIP traders. High stakes, higher rewards.', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1000', 25000, 100, 10, 100, 1787974031923, 1788578831923, 'scheduled', 1, '{"minBalance":1000,"statusRequired":"VIP"}', 1787369231923);

--
-- Table structure for tournament_participants
--


--
-- Table structure for tournament_prizes
--

-- Dumping data for table tournament_prizes (9 rows)
INSERT OR IGNORE INTO "tournament_prizes" ("id", "tournament_id", "rank_from", "rank_to", "prize_amount", "prize_type") VALUES (1, 't-daily-free', 1, 1, 50, 'fixed');
INSERT OR IGNORE INTO "tournament_prizes" ("id", "tournament_id", "rank_from", "rank_to", "prize_amount", "prize_type") VALUES (2, 't-daily-free', 2, 2, 20, 'fixed');
INSERT OR IGNORE INTO "tournament_prizes" ("id", "tournament_id", "rank_from", "rank_to", "prize_amount", "prize_type") VALUES (3, 't-daily-free', 3, 3, 10, 'fixed');
INSERT OR IGNORE INTO "tournament_prizes" ("id", "tournament_id", "rank_from", "rank_to", "prize_amount", "prize_type") VALUES (4, 't-weekly-pro', 1, 1, 2500, 'fixed');
INSERT OR IGNORE INTO "tournament_prizes" ("id", "tournament_id", "rank_from", "rank_to", "prize_amount", "prize_type") VALUES (5, 't-weekly-pro', 2, 2, 1000, 'fixed');
INSERT OR IGNORE INTO "tournament_prizes" ("id", "tournament_id", "rank_from", "rank_to", "prize_amount", "prize_type") VALUES (6, 't-weekly-pro', 3, 3, 500, 'fixed');
INSERT OR IGNORE INTO "tournament_prizes" ("id", "tournament_id", "rank_from", "rank_to", "prize_amount", "prize_type") VALUES (7, 't-prestige-elite', 1, 1, 12500, 'fixed');
INSERT OR IGNORE INTO "tournament_prizes" ("id", "tournament_id", "rank_from", "rank_to", "prize_amount", "prize_type") VALUES (8, 't-prestige-elite', 2, 2, 5000, 'fixed');
INSERT OR IGNORE INTO "tournament_prizes" ("id", "tournament_id", "rank_from", "rank_to", "prize_amount", "prize_type") VALUES (9, 't-prestige-elite', 3, 3, 2500, 'fixed');

--
-- Table structure for leaderboard_stats
--


--
-- Table structure for trades
--

-- Dumping data for table trades (3 rows)
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (1, 'xpehpgyaax', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'AUD/USD (OTC)', NULL, 1, 'down', NULL, 0.654117142859123, 0.64908, 68, NULL, 1787369880, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787369880, NULL, 1787369812699);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (2, '1', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'AUD/USD (OTC)', NULL, 1, 'down', NULL, 0.654117142859123, 0.64908, 68, NULL, 1787369880, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787369880, NULL, 1787369812699);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (3, 'fgc54srcq1', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'AUD/USD (OTC)', NULL, 1, 'down', NULL, 0.6196505716530748, 0.6175, 61, NULL, 1787372519, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787372519, NULL, 1787372458938);

--
-- Table structure for transactions
--


--
-- Table structure for audit_logs
--


--
-- Table structure for system_backups
--

-- Dumping data for table system_backups (12 rows)
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787369227768', 1787369227768, 'backup_2026-08-22T03-27-07-768Z_1787369227768.sql', 1014, 'success', 20, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787369227768', 1787369227768, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787369671258', 1787369671258, 'backup_2026-08-22T03-34-31-258Z_1787369671258.sql', 8053, 'success', 20, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787369671258', 1787369671258, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787369678048', 1787369678048, 'backup_2026-08-22T03-34-38-048Z_1787369678048.sql', 8519, 'success', 20, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787369678048', 1787369678048, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787370562160', 1787370562160, 'backup_2026-08-22T03-49-22-160Z_1787370562160.sql', 10120, 'success', 20, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787370562160', 1787370562160, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787370570569', 1787370570569, 'backup_2026-08-22T03-49-30-569Z_1787370570569.sql', 10587, 'success', 20, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787370570569', 1787370570569, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787372622969', 1787372622969, 'backup_2026-08-22T04-23-42-969Z_1787372622969.sql', 11605, 'success', 20, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787372622969', 1787372622969, 'N/A', 0, 'failed', 0, 'system_pre_boot');

--
-- Table structure for login_history
--


--
-- Table structure for kyc_requests
--


--
-- Table structure for tickets
--


--
-- Table structure for ticket_messages
--


--
-- Table structure for support_canned_responses
--


--
-- Table structure for agent_profiles
--


--
-- Table structure for active_copies
--


--
-- Table structure for master_traders
--

-- Dumping data for table master_traders (6 rows)
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m1', 'CRISHTTRADER', '🇻🇪', 88, 45000, 6);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m2', 'OBOROTEN', '🇺🇦', 81, 86000, 13);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m3', 'GEOVANNY', '🇨🇴', 74, 12000, 5);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m4', 'ALEX FOREX', '🇬🇧', 92, 125000, 38);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m5', 'BINANCE WHALE', '🇸🇬', 85, 240000, 71);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m6', 'TRADEMINATOR', '🇧🇩', 89, 155000, 42);

--
-- Table structure for candles
--


--
-- Table structure for historical_candles
--

