-- Bivaax Trade Enterprise Backup (Logical Fallback)
-- Generated at: 2026-08-28T18:57:36.536Z
-- Requested by: system_pre_boot
-- Database type: SQLite


--
-- Table structure for app_settings
--


--
-- Table structure for users
--

-- Dumping data for table users (3 rows)
INSERT OR IGNORE INTO "users" ("id", "uid", "email", "display_name", "nickname", "photo_url", "password_hash", "real_balance", "demo_balance", "currency", "tfa_enabled", "tfa_mode", "tfa_secret", "is_verified", "is_email_verified", "is_nid_verified", "nid_number", "is_admin", "phone", "country", "country_code", "first_name", "last_name", "gender", "dob", "status", "kyc_status", "referred_by_uid", "referral_code", "referral_sub_id", "referral_type", "affiliate_balance", "total_affiliate_earnings", "referral_count", "custom_affiliate_share", "withdrawal_otp", "withdrawal_otp_expires_at", "total_live_volume", "updated_at", "created_at", "total_deposits", "smart_mode_enabled", "smart_mode_strategy", "manipulation_mode", "password") VALUES (1, 'admin_seed_y33pqt6b', 'hamproosapport@gmail.com', 'Bivaax Super Admin', 'Admin', NULL, '$2b$10$BLVJpV0Z1yT59XBeJ4z.eODUZOyODLhJRAPLGiZMle69vjAzAt5gG', 1000, 10000, 'USD', 0, 'app', NULL, 0, 0, 0, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Standard', 'unverified', NULL, 'P1GGNC', NULL, NULL, 0, 0, 0, NULL, NULL, NULL, 0, NULL, 1787934185128, 0, 0, 'auto_25_percent', 'neutral', NULL);
INSERT OR IGNORE INTO "users" ("id", "uid", "email", "display_name", "nickname", "photo_url", "password_hash", "real_balance", "demo_balance", "currency", "tfa_enabled", "tfa_mode", "tfa_secret", "is_verified", "is_email_verified", "is_nid_verified", "nid_number", "is_admin", "phone", "country", "country_code", "first_name", "last_name", "gender", "dob", "status", "kyc_status", "referred_by_uid", "referral_code", "referral_sub_id", "referral_type", "affiliate_balance", "total_affiliate_earnings", "referral_count", "custom_affiliate_share", "withdrawal_otp", "withdrawal_otp_expires_at", "total_live_volume", "updated_at", "created_at", "total_deposits", "smart_mode_enabled", "smart_mode_strategy", "manipulation_mode", "password") VALUES (2, 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'hasan1@gmail.com', 'hasan1 ননহ', NULL, NULL, NULL, 0, 10000, 'USD', 0, 'app', NULL, 0, 0, 0, NULL, 1, NULL, NULL, NULL, NULL, NULL, 'Male', '{"day":"--","month":"--","year":"--"}', 'Standard', 'unverified', NULL, '', NULL, NULL, 0, 0, 0, NULL, NULL, NULL, 0, NULL, NULL, 0, 0, 'auto_25_percent', 'neutral', NULL);
INSERT OR IGNORE INTO "users" ("id", "uid", "email", "display_name", "nickname", "photo_url", "password_hash", "real_balance", "demo_balance", "currency", "tfa_enabled", "tfa_mode", "tfa_secret", "is_verified", "is_email_verified", "is_nid_verified", "nid_number", "is_admin", "phone", "country", "country_code", "first_name", "last_name", "gender", "dob", "status", "kyc_status", "referred_by_uid", "referral_code", "referral_sub_id", "referral_type", "affiliate_balance", "total_affiliate_earnings", "referral_count", "custom_affiliate_share", "withdrawal_otp", "withdrawal_otp_expires_at", "total_live_volume", "updated_at", "created_at", "total_deposits", "smart_mode_enabled", "smart_mode_strategy", "manipulation_mode", "password") VALUES (3, '1KDsXebs2Qb5HjaNcUdVe3toIWI3', 'sufhgjgyjmona46365@gmail.com', 'tgyhf', NULL, NULL, NULL, 0, 10002.8, 'USD', 0, 'app', NULL, 0, 0, 0, NULL, 0, NULL, 'Bangladesh', 'BD', NULL, NULL, 'Male', '{"day":"--","month":"--","year":"--"}', 'Standard', 'unverified', NULL, '', NULL, NULL, 0, 0, 0, NULL, NULL, NULL, 0, NULL, NULL, 0, 0, 'auto_25_percent', 'neutral', NULL);

--
-- Table structure for tournaments
--

-- Dumping data for table tournaments (3 rows)
INSERT OR IGNORE INTO "tournaments" ("id", "type", "title", "description", "banner_url", "prize_pool", "entry_fee", "min_players", "max_players", "start_time", "end_time", "status", "is_locked", "requirements", "created_at") VALUES ('t-daily-free', 'Daily Free', 'Daily Freebie Blast', 'Join the daily free tournament and win real cash prizes! No entry fee required.', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000', 100, 0, 10, 1000, 1787937785810, 1788020585810, 'active', 0, '{"minBalance":0}', 1787934185810);
INSERT OR IGNORE INTO "tournaments" ("id", "type", "title", "description", "banner_url", "prize_pool", "entry_fee", "min_players", "max_players", "start_time", "end_time", "status", "is_locked", "requirements", "created_at") VALUES ('t-weekly-pro', 'Weekly', 'Weekly Pro Challenge', 'Compete with the best for a massive prize pool. Show your trading skills!', 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=1000', 5000, 10, 50, 5000, 1788106985810, 1788711785810, 'scheduled', 1, '{"minBalance":100,"kycRequired":true}', 1787934185810);
INSERT OR IGNORE INTO "tournaments" ("id", "type", "title", "description", "banner_url", "prize_pool", "entry_fee", "min_players", "max_players", "start_time", "end_time", "status", "is_locked", "requirements", "created_at") VALUES ('t-prestige-elite', 'Prestige', 'Elite Prestige Cup', 'The ultimate tournament for our VIP traders. High stakes, higher rewards.', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1000', 25000, 100, 10, 100, 1788538985810, 1789143785810, 'scheduled', 1, '{"minBalance":1000,"statusRequired":"VIP"}', 1787934185810);

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

-- Dumping data for table trades (2 rows)
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (1, 'whnhcp33lm', '1KDsXebs2Qb5HjaNcUdVe3toIWI3', 'Crypto IDX', 'Crypto IDX', 1, 'up', 'up', 2081.51241, 4497.55126, 63, 63, 1787937480, '1787937480000', 1, 'demo', NULL, 'won', NULL, 1.9, '90', 1787937498, NULL, 1787937416065);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (2, '1', '1KDsXebs2Qb5HjaNcUdVe3toIWI3', 'Crypto IDX', NULL, 1, 'up', NULL, 2081.51241, 4495.26789, 63, NULL, 1787937480, NULL, 1, 'demo', NULL, 'won', NULL, 1.9, NULL, 1787937498, NULL, 1787937416065);

--
-- Table structure for transactions
--


--
-- Table structure for audit_logs
--

-- Dumping data for table audit_logs (13 rows)
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (1, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1787934182367', NULL, NULL, 'Database backup created successfully: backup_2026-08-28T16-23-02-367Z_1787934182367.sql (0.00 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1787934182367);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (2, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1787934311204', NULL, NULL, 'Database backup created successfully: backup_2026-08-28T16-25-11-204Z_1787934311204.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1787934311204);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (3, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1787935501400', NULL, NULL, 'Database backup created successfully: backup_2026-08-28T16-45-01-400Z_1787935501400.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1787935501400);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (4, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1787935891520', NULL, NULL, 'Database backup created successfully: backup_2026-08-28T16-51-31-520Z_1787935891520.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1787935891520);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (5, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1787936010966', NULL, NULL, 'Database backup created successfully: backup_2026-08-28T16-53-30-966Z_1787936010966.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1787936010966);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (6, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1787936288984', NULL, NULL, 'Database backup created successfully: backup_2026-08-28T16-58-08-984Z_1787936288984.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1787936288984);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (7, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1787936358495', NULL, NULL, 'Database backup created successfully: backup_2026-08-28T16-59-18-495Z_1787936358495.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1787936358495);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (8, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1787936816053', NULL, NULL, 'Database backup created successfully: backup_2026-08-28T17-06-56-053Z_1787936816053.sql (0.04 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1787936816053);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (9, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1787937183590', NULL, NULL, 'Database backup created successfully: backup_2026-08-28T17-13-03-590Z_1787937183590.sql (0.04 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1787937183590);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (10, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1787937487345', NULL, NULL, 'Database backup created successfully: backup_2026-08-28T17-18-07-345Z_1787937487345.sql (0.04 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1787937487345);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (11, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1787939809627', NULL, NULL, 'Database backup created successfully: backup_2026-08-28T17-56-49-627Z_1787939809627.sql (0.04 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1787939809627);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (12, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1787941700459', NULL, NULL, 'Database backup created successfully: backup_2026-08-28T18-28-20-459Z_1787941700459.sql (0.04 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1787941700459);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (13, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1787942161541', NULL, NULL, 'Database backup created successfully: backup_2026-08-28T18-36-01-541Z_1787942161541.sql (0.04 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1787942161541);

--
-- Table structure for system_backups
--

-- Dumping data for table system_backups (13 rows)
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787934182367', 1787934182367, 'backup_2026-08-28T16-23-02-367Z_1787934182367.sql', 1058, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787934311204', 1787934311204, 'backup_2026-08-28T16-25-11-204Z_1787934311204.sql', 31860, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787935501400', 1787935501400, 'backup_2026-08-28T16-45-01-400Z_1787935501400.sql', 33698, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787935891520', 1787935891520, 'backup_2026-08-28T16-51-31-520Z_1787935891520.sql', 34433, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787936010966', 1787936010966, 'backup_2026-08-28T16-53-30-966Z_1787936010966.sql', 35176, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787936288984', 1787936288984, 'backup_2026-08-28T16-58-08-984Z_1787936288984.sql', 35911, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787936358495', 1787936358495, 'backup_2026-08-28T16-59-18-495Z_1787936358495.sql', 36646, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787936816053', 1787936816053, 'backup_2026-08-28T17-06-56-053Z_1787936816053.sql', 37381, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787937183590', 1787937183590, 'backup_2026-08-28T17-13-03-590Z_1787937183590.sql', 38116, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787937487345', 1787937487345, 'backup_2026-08-28T17-18-07-345Z_1787937487345.sql', 39463, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787939809627', 1787939809627, 'backup_2026-08-28T17-56-49-627Z_1787939809627.sql', 40766, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787941700459', 1787941700459, 'backup_2026-08-28T18-28-20-459Z_1787941700459.sql', 41502, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787942161541', 1787942161541, 'backup_2026-08-28T18-36-01-541Z_1787942161541.sql', 42238, 'success', 21, 'system_pre_boot');

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

-- Dumping data for table master_traders (150 rows)
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m1', 'CRISHTTRADER', '🇻🇪', 88, 45000, 6);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m2', 'OBOROTEN', '🇺🇦', 81, 86000, 13);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m3', 'GEOVANNY', '🇨🇴', 74, 12000, 5);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m4', 'ALEX FOREX', '🇬🇧', 92, 125000, 38);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m5', 'BINANCE WHALE', '🇸🇬', 85, 240000, 71);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m6', 'TRADEMINATOR', '🇧🇩', 89, 155000, 42);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m7', 'SHARK_TRADER', '🇺🇸', 91, 198000, 85);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m8', 'ELITE_SIGNALS', '🇦🇪', 84, 92000, 54);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m9', 'CRYPTO_KING', '🇰🇷', 79, 310000, 120);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m10', 'MASTER_ZEN', '🇯🇵', 94, 75000, 29);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m11', 'BULL_RUNNER', '🇧🇷', 82, 64000, 31);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m12', 'SCALPER_PRO', '🇩🇪', 87, 112000, 47);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m13', 'DHAKA_WIZARD', '🇧🇩', 90, 48000, 19);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m14', 'VOLATILITY_X', '🇷🇺', 76, 210000, 63);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m15', 'PIPS_HUNTER', '🇦🇺', 83, 56000, 22);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m16', 'FOREX_MASTER', '🇨🇭', 95, 185000, 92);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m17', 'WALLSTREET_BET', '🇺🇸', 71, 420000, 156);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m18', 'EAGLE_EYE', '🇹🇷', 88, 34000, 14);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m19', 'GOLD_DIGGER', '🇿🇦', 86, 128000, 36);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m20', 'TECH_ANALYSIS', '🇮🇳', 80, 42000, 25);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m21', 'QUANT_TRADE', '🇨🇦', 93, 265000, 78);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m22', 'TREND_FOLLOWER', '🇫🇷', 78, 89000, 41);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m23', 'CHART_GURU', '🇮🇩', 84, 52000, 18);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m24', 'NIGHT_OWL', '🇪🇸', 89, 97000, 33);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m25', 'ALPHA_TRADER', '🇸🇬', 91, 143000, 59);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m26', 'MARCUS_FX', '🇳🇬', 85, 28000, 11);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m27', 'VIKING_TRADE', '🇳🇴', 87, 76000, 27);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m28', 'SAMURAI_TRADER', '🇯🇵', 92, 154000, 68);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m29', 'PHOENIX_RISE', '🇬🇷', 81, 61000, 24);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m30', 'LEGACY_TRADE', '🇮🇹', 83, 119000, 51);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m31', 'Hyper_Signals_31', '🇷🇺', 93, 54781, 40);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m32', 'Smart_Trader_32', '🇩🇪', 74, 386207, 21);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m33', 'Elite_Market_33', '🇩🇪', 69, 21280, 92);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m34', 'Max_Wealth_34', '🇲🇽', 88, 124851, 59);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m35', 'Max_Edge_35', '🇵🇭', 89, 496823, 97);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m36', 'Nova_Edge_36', '🇯🇵', 72, 420167, 24);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m37', 'Prime_Wealth_37', '🇳🇬', 94, 294440, 43);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m38', 'Elite_Gold_38', '🇮🇩', 82, 241829, 118);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m39', 'Nova_Profit_39', '🇰🇼', 72, 484686, 26);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m40', 'Master_Profit_40', '🇸🇬', 84, 472824, 91);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m41', 'Swift_Trader_41', '🇻🇳', 67, 73248, 6);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m42', 'Elite_Gold_42', '🇵🇭', 66, 133192, 16);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m43', 'Apex_Bull_43', '🇷🇺', 88, 335383, 16);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m44', 'Expert_Bull_44', '🇹🇷', 68, 42033, 28);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m45', 'Max_Wizard_45', '🇮🇳', 91, 247786, 87);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m46', 'Nova_Scalper_46', '🇦🇪', 91, 139967, 88);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m47', 'Hyper_Flow_47', '🇦🇪', 92, 460838, 29);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m48', 'Pro_Market_48', '🇦🇪', 76, 465558, 86);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m49', 'Expert_Quantum_49', '🇪🇸', 89, 29525, 67);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m50', 'Swift_Signals_50', '🇩🇪', 81, 137511, 33);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m51', 'Neo_Wizard_51', '🇮🇩', 84, 508098, 13);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m52', 'Apex_Edge_52', '🇮🇩', 75, 353589, 110);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m53', 'Nova_Market_53', '🇯🇵', 65, 463620, 35);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m54', 'Pro_Quantum_54', '🇮🇹', 65, 29861, 74);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m55', 'Neo_King_55', '🇮🇳', 70, 437794, 38);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m56', 'Max_Strategy_56', '🇦🇺', 75, 354812, 10);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m57', 'Super_Quantum_57', '🇲🇽', 82, 213833, 36);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m58', 'Ultra_Market_58', '🇧🇷', 85, 88628, 44);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m59', 'Super_Trader_59', '🇮🇹', 77, 323908, 47);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m60', 'Elite_King_60', '🇻🇳', 88, 475511, 64);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m61', 'Elite_Profit_61', '🇲🇽', 83, 442011, 69);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m62', 'Max_Flow_62', '🇦🇪', 69, 68911, 42);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m63', 'Ultra_Scalper_63', '🇫🇷', 76, 464215, 44);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m64', 'Neo_Strategy_64', '🇸🇦', 91, 387527, 9);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m65', 'Neo_Edge_65', '🇺🇸', 72, 295028, 3);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m66', 'Max_Market_66', '🇧🇷', 87, 40356, 101);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m67', 'Nova_Gold_67', '🇶🇦', 95, 315858, 44);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m68', 'Master_Wealth_68', '🇧🇷', 85, 395300, 68);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m69', 'Apex_Edge_69', '🇲🇾', 78, 350012, 110);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m70', 'Smart_King_70', '🇮🇹', 82, 214025, 35);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m71', 'Smart_Gold_71', '🇻🇳', 79, 334285, 48);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m72', 'Ultra_Quantum_72', '🇸🇦', 86, 87947, 30);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m73', 'Hyper_King_73', '🇧🇷', 86, 355289, 39);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m74', 'Master_Wizard_74', '🇮🇩', 80, 506353, 113);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m75', 'Apex_Profit_75', '🇲🇾', 96, 265376, 66);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m76', 'Swift_Signals_76', '🇧🇩', 91, 464964, 14);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m77', 'Neo_Wealth_77', '🇧🇩', 95, 494864, 74);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m78', 'Alpha_Bull_78', '🇻🇳', 82, 140545, 98);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m79', 'Global_Trader_79', '🇮🇩', 66, 212776, 9);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m80', 'Alpha_Quantum_80', '🇨🇦', 74, 483203, 99);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m81', 'Alpha_Flow_81', '🇪🇸', 80, 418500, 11);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m82', 'Ultra_Flow_82', '🇧🇩', 86, 73641, 75);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m83', 'Max_Edge_83', '🇺🇸', 73, 339620, 33);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m84', 'Max_Strategy_84', '🇪🇸', 79, 283945, 86);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m85', 'Swift_Edge_85', '🇺🇸', 79, 107501, 0);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m86', 'Super_Trader_86', '🇶🇦', 90, 76604, 88);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m87', 'Swift_Trader_87', '🇯🇵', 70, 147949, 89);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m88', 'Global_Forex_88', '🇿🇦', 87, 174008, 15);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m89', 'Elite_Wizard_89', '🇵🇭', 69, 86045, 109);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m90', 'Master_King_90', '🇹🇷', 71, 26096, 90);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m91', 'Nova_Wizard_91', '🇸🇦', 81, 177484, 92);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m92', 'Nova_Wizard_92', '🇦🇺', 77, 420097, 94);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m93', 'Smart_Bull_93', '🇬🇧', 65, 442267, 21);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m94', 'Super_Scalper_94', '🇮🇳', 89, 34464, 22);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m95', 'Global_Quantum_95', '🇦🇺', 72, 13087, 82);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m96', 'Hyper_Strategy_96', '🇦🇪', 95, 476336, 109);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m97', 'Prime_Signals_97', '🇨🇦', 92, 404439, 23);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m98', 'Max_Gold_98', '🇶🇦', 87, 498950, 57);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m99', 'Elite_Gold_99', '🇶🇦', 81, 393794, 25);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m100', 'Alpha_Profit_100', '🇧🇩', 95, 430227, 42);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m101', 'Neo_Forex_101', '🇹🇷', 74, 353035, 20);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m102', 'Prime_Flow_102', '🇯🇵', 67, 489884, 101);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m103', 'Elite_Wizard_103', '🇶🇦', 70, 135247, 88);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m104', 'Alpha_Forex_104', '🇮🇩', 83, 94877, 89);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m105', 'Smart_Flow_105', '🇨🇦', 90, 324540, 8);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m106', 'Super_Gold_106', '🇧🇩', 69, 459078, 85);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m107', 'Master_Market_107', '🇲🇽', 95, 279520, 40);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m108', 'Ultra_Strategy_108', '🇿🇦', 82, 407314, 13);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m109', 'Expert_Forex_109', '🇮🇳', 95, 441961, 87);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m110', 'Pro_Profit_110', '🇶🇦', 82, 153273, 6);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m111', 'Max_Market_111', '🇬🇧', 80, 150678, 45);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m112', 'Hyper_Wealth_112', '🇧🇷', 92, 167763, 12);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m113', 'Hyper_Flow_113', '🇪🇸', 90, 57760, 96);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m114', 'Pro_Edge_114', '🇮🇳', 71, 387495, 50);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m115', 'Super_Wizard_115', '🇳🇬', 88, 357545, 64);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m116', 'Master_Forex_116', '🇦🇪', 73, 29683, 93);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m117', 'Ultra_Gold_117', '🇦🇺', 95, 350694, 109);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m118', 'Smart_Flow_118', '🇫🇷', 78, 204237, 105);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m119', 'Neo_Edge_119', '🇮🇳', 87, 483139, 12);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m120', 'Nova_Forex_120', '🇰🇼', 67, 115858, 32);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m121', 'Alpha_King_121', '🇧🇩', 69, 153441, 111);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m122', 'Max_Flow_122', '🇻🇳', 79, 120773, 92);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m123', 'Nova_Signals_123', '🇰🇼', 77, 344831, 14);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m124', 'Apex_Profit_124', '🇨🇦', 74, 312933, 22);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m125', 'Apex_Flow_125', '🇰🇷', 72, 118176, 10);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m126', 'Hyper_Scalper_126', '🇦🇺', 90, 95017, 79);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m127', 'Nova_Forex_127', '🇵🇭', 68, 386549, 57);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m128', 'Ultra_Signals_128', '🇿🇦', 71, 282918, 103);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m129', 'Pro_Scalper_129', '🇮🇹', 70, 269175, 61);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m130', 'Global_Wizard_130', '🇹🇷', 83, 446808, 70);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m131', 'Expert_Signals_131', '🇰🇷', 95, 327581, 60);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m132', 'Smart_Scalper_132', '🇮🇩', 72, 312663, 15);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m133', 'Hyper_Bull_133', '🇳🇬', 88, 119627, 28);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m134', 'Hyper_Gold_134', '🇹🇷', 85, 62077, 21);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m135', 'Ultra_Bull_135', '🇹🇷', 70, 312404, 23);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m136', 'Neo_Quantum_136', '🇯🇵', 87, 451718, 100);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m137', 'Master_Flow_137', '🇧🇷', 92, 367721, 66);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m138', 'Alpha_Strategy_138', '🇸🇬', 79, 57557, 76);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m139', 'Neo_Trader_139', '🇸🇦', 67, 266757, 49);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m140', 'Hyper_Gold_140', '🇨🇦', 93, 72000, 5);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m141', 'Apex_Signals_141', '🇶🇦', 72, 384458, 49);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m142', 'Swift_Edge_142', '🇰🇼', 78, 93947, 116);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m143', 'Alpha_King_143', '🇦🇺', 67, 429686, 106);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m144', 'Nova_Bull_144', '🇰🇼', 76, 488602, 49);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m145', 'Swift_Profit_145', '🇨🇦', 88, 362770, 6);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m146', 'Master_Edge_146', '🇦🇪', 92, 208927, 25);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m147', 'Ultra_Flow_147', '🇫🇷', 92, 38641, 58);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m148', 'Ultra_Flow_148', '🇮🇩', 94, 406330, 7);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m149', 'Super_Wealth_149', '🇲🇾', 66, 173682, 41);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m150', 'Neo_Scalper_150', '🇪🇸', 68, 15005, 8);

--
-- Table structure for candles
--


--
-- Table structure for historical_candles
--

