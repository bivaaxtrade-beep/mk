-- Bivaax Trade Enterprise Backup (Logical Fallback)
-- Generated at: 2026-08-23T18:48:17.779Z
-- Requested by: system_pre_boot
-- Database type: SQLite


--
-- Table structure for app_settings
--


--
-- Table structure for users
--

-- Dumping data for table users (3 rows)
INSERT OR IGNORE INTO "users" ("id", "uid", "email", "display_name", "nickname", "photo_url", "password_hash", "real_balance", "demo_balance", "currency", "tfa_enabled", "tfa_mode", "tfa_secret", "is_verified", "is_email_verified", "is_nid_verified", "nid_number", "is_admin", "phone", "country", "country_code", "first_name", "last_name", "gender", "dob", "status", "kyc_status", "referred_by_uid", "referral_code", "referral_sub_id", "referral_type", "affiliate_balance", "total_affiliate_earnings", "referral_count", "custom_affiliate_share", "withdrawal_otp", "withdrawal_otp_expires_at", "total_live_volume", "updated_at", "created_at", "total_deposits", "smart_mode_enabled", "smart_mode_strategy", "manipulation_mode", "password") VALUES (1, 'admin_seed_hl3hev7t', 'hamproosapport@gmail.com', 'Bivaax Super Admin', 'Admin', NULL, '$2b$10$vTANLSQ8Kn26HbXnplZIcOL4dqqWl8wJcmm1VAAYII/fcE2pGMROa', 1000, 10000, 'USD', 0, 'app', NULL, 1, 0, 0, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Standard', 'unverified', NULL, 'EASS81', NULL, NULL, 0, 0, 0, NULL, NULL, NULL, 0, NULL, 1787499137300, 0, 0, 'auto_25_percent', 'neutral', NULL);
INSERT OR IGNORE INTO "users" ("id", "uid", "email", "display_name", "nickname", "photo_url", "password_hash", "real_balance", "demo_balance", "currency", "tfa_enabled", "tfa_mode", "tfa_secret", "is_verified", "is_email_verified", "is_nid_verified", "nid_number", "is_admin", "phone", "country", "country_code", "first_name", "last_name", "gender", "dob", "status", "kyc_status", "referred_by_uid", "referral_code", "referral_sub_id", "referral_type", "affiliate_balance", "total_affiliate_earnings", "referral_count", "custom_affiliate_share", "withdrawal_otp", "withdrawal_otp_expires_at", "total_live_volume", "updated_at", "created_at", "total_deposits", "smart_mode_enabled", "smart_mode_strategy", "manipulation_mode", "password") VALUES (2, 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'hasan1@gmail.com', 'hasan1', NULL, NULL, NULL, 0, 10012.95, 'USD', 0, 'app', NULL, 0, 0, 0, NULL, 1, NULL, 'Bangladesh', 'BD', NULL, NULL, NULL, NULL, 'Standard', 'verified', NULL, '', NULL, NULL, 0, 0, 0, NULL, NULL, NULL, 0, NULL, NULL, 0, 0, 'auto_25_percent', 'neutral', NULL);
INSERT OR IGNORE INTO "users" ("id", "uid", "email", "display_name", "nickname", "photo_url", "password_hash", "real_balance", "demo_balance", "currency", "tfa_enabled", "tfa_mode", "tfa_secret", "is_verified", "is_email_verified", "is_nid_verified", "nid_number", "is_admin", "phone", "country", "country_code", "first_name", "last_name", "gender", "dob", "status", "kyc_status", "referred_by_uid", "referral_code", "referral_sub_id", "referral_type", "affiliate_balance", "total_affiliate_earnings", "referral_count", "custom_affiliate_share", "withdrawal_otp", "withdrawal_otp_expires_at", "total_live_volume", "updated_at", "created_at", "total_deposits", "smart_mode_enabled", "smart_mode_strategy", "manipulation_mode", "password") VALUES (3, '1KDsXebs2Qb5HjaNcUdVe3toIWI3', 'sufhgjgyjmona46365@gmail.com', 'tgyhf', NULL, NULL, NULL, 0, 10000, 'USD', 0, 'app', NULL, 0, 0, 0, NULL, 0, NULL, 'Bangladesh', 'BD', NULL, NULL, NULL, NULL, 'Standard', 'unverified', NULL, '', NULL, NULL, 0, 0, 0, NULL, NULL, NULL, 0, NULL, NULL, 0, 0, 'auto_25_percent', 'neutral', NULL);

--
-- Table structure for tournaments
--

-- Dumping data for table tournaments (3 rows)
INSERT OR IGNORE INTO "tournaments" ("id", "type", "title", "description", "banner_url", "prize_pool", "entry_fee", "min_players", "max_players", "start_time", "end_time", "status", "is_locked", "requirements", "created_at") VALUES ('t-daily-free', 'Daily Free', 'Daily Freebie Blast', 'Join the daily free tournament and win real cash prizes! No entry fee required.', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000', 100, 0, 10, 1000, 1787502738180, 1787585538180, 'active', 0, '{"minBalance":0}', 1787499138180);
INSERT OR IGNORE INTO "tournaments" ("id", "type", "title", "description", "banner_url", "prize_pool", "entry_fee", "min_players", "max_players", "start_time", "end_time", "status", "is_locked", "requirements", "created_at") VALUES ('t-weekly-pro', 'Weekly', 'Weekly Pro Challenge', 'Compete with the best for a massive prize pool. Show your trading skills!', 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=1000', 5000, 10, 50, 5000, 1787671938180, 1788276738180, 'scheduled', 1, '{"minBalance":100,"kycRequired":true}', 1787499138180);
INSERT OR IGNORE INTO "tournaments" ("id", "type", "title", "description", "banner_url", "prize_pool", "entry_fee", "min_players", "max_players", "start_time", "end_time", "status", "is_locked", "requirements", "created_at") VALUES ('t-prestige-elite', 'Prestige', 'Elite Prestige Cup', 'The ultimate tournament for our VIP traders. High stakes, higher rewards.', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1000', 25000, 100, 10, 100, 1788103938180, 1788708738180, 'scheduled', 1, '{"minBalance":1000,"statusRequired":"VIP"}', 1787499138180);

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

-- Dumping data for table trades (44 rows)
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (1, 'eu10y1zcjw', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'AUD/USD (OTC)', NULL, 1, 'down', NULL, 0.68785, 0.68186, 76, NULL, 1787499900, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787499900, NULL, 1787499825354);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (2, '1', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'AUD/USD (OTC)', NULL, 1, 'down', NULL, 0.68785, 0.68186, 76, NULL, 1787499900, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787499900, NULL, 1787499825354);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (3, '02waqul3xj', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'AUD/USD (OTC)', NULL, 1, 'up', NULL, 0.6828, 0.69876, 68, NULL, 1787501100, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787501100, NULL, 1787501033088);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (4, '3', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'AUD/USD (OTC)', NULL, 1, 'up', NULL, 0.6828, 0.69876, 68, NULL, 1787501100, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787501100, NULL, 1787501033088);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (5, 'fwr893pf2g', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'Crypto IDX', NULL, 1, 'down', NULL, 4224.52586, 4212.78503, 5, NULL, 1787505238, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787505238, NULL, 1787505235199);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (6, 'ntmvc650sw', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'Crypto IDX', NULL, 1, 'down', NULL, 4354.7363, 4385.6106, 5, NULL, 1787505255, NULL, 1, 'demo', NULL, 'lost', 0, NULL, 1787505255, NULL, 1787505251986);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (7, 'ec8f1ujoez', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'Crypto IDX', NULL, 1, 'up', NULL, 4373.91367, 4382.31813, 5, NULL, 1787505261, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787505262, NULL, 1787505258226);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (8, '8oo0o1xr5y', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'BTC/USD', NULL, 1, 'up', NULL, 57590.99463, 58023.47354, 5, NULL, 1787505285, NULL, 1, 'demo', NULL, 'won', 1.75, NULL, 1787505286, NULL, 1787505282192);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (9, '5', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'Crypto IDX', NULL, 1, 'down', NULL, 4224.52586, 4212.78503, 5, NULL, 1787505238, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787505238, NULL, 1787505235199);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (10, '6', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'Crypto IDX', NULL, 1, 'down', NULL, 4354.7363, 4385.6106, 5, NULL, 1787505255, NULL, 1, 'demo', NULL, 'lost', 0, NULL, 1787505255, NULL, 1787505251986);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (11, '7', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'Crypto IDX', NULL, 1, 'up', NULL, 4373.91367, 4382.31813, 5, NULL, 1787505261, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787505262, NULL, 1787505258226);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (12, '8', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'BTC/USD', NULL, 1, 'up', NULL, 57590.99463, 58023.47354, 5, NULL, 1787505285, NULL, 1, 'demo', NULL, 'won', 1.75, NULL, 1787505286, NULL, 1787505282192);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (13, 'vpuglb95c2', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/GBP (OTC)', NULL, 1, 'down', NULL, 0.84369, 0.84086, 5, NULL, 1787505969, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787505970, NULL, 1787505966456);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (14, '3v6kao835d', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/GBP (OTC)', NULL, 1, 'up', NULL, 0.84146, 0.84266, 5, NULL, 1787505975, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787505976, NULL, 1787505971922);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (15, 'vewz4ioptg', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/GBP (OTC)', NULL, 1, 'up', NULL, 0.84302, 0.84705, 5, NULL, 1787505980, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787505981, NULL, 1787505978646);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (16, 'gabgy036wo', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/GBP (OTC)', NULL, 1, 'up', NULL, 0.85155, 0.85423, 5, NULL, 1787506019, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787506020, NULL, 1787506016087);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (17, '6s8km7deek', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'AUD/CAD (OTC)', NULL, 1, 'up', NULL, 0.87491, 0.87731, 5, NULL, 1787506033, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787506033, NULL, 1787506029657);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (18, 'ab26ctl4ia', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/JPY (OTC)', NULL, 1, 'down', NULL, 170.80422, 170.9048, 5, NULL, 1787506094, NULL, 1, 'demo', NULL, 'lost', 0, NULL, 1787506095, NULL, 1787506091558);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (19, 'keixjxx7to', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/JPY (OTC)', NULL, 1, 'down', NULL, 174.04815, 174.28491, 5, NULL, 1787506260, NULL, 1, 'demo', NULL, 'lost', 0, NULL, 1787506261, NULL, 1787506257603);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (20, 'lv0k6tgtz0', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/JPY (OTC)', NULL, 1, 'up', NULL, 174.38753, 174.42, 5, NULL, 1787506264, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787506264, NULL, 1787506260741);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (21, 'encob8jww7', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/JPY (OTC)', NULL, 1, 'down', NULL, 174.53001, 174.4747, 5, NULL, 1787506269, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787506270, NULL, 1787506266404);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (22, 'u95v7rumvc', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/JPY (OTC)', NULL, 1, 'up', NULL, 174.05992, 174.40973, 5, NULL, 1787506277, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787506278, NULL, 1787506274197);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (23, '13', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/GBP (OTC)', NULL, 1, 'down', NULL, 0.84369, 0.84086, 5, NULL, 1787505969, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787505970, NULL, 1787505966456);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (24, '14', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/GBP (OTC)', NULL, 1, 'up', NULL, 0.84146, 0.84266, 5, NULL, 1787505975, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787505976, NULL, 1787505971922);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (25, '15', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/GBP (OTC)', NULL, 1, 'up', NULL, 0.84302, 0.84705, 5, NULL, 1787505980, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787505981, NULL, 1787505978646);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (26, '16', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/GBP (OTC)', NULL, 1, 'up', NULL, 0.85155, 0.85423, 5, NULL, 1787506019, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787506020, NULL, 1787506016087);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (27, '17', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'AUD/CAD (OTC)', NULL, 1, 'up', NULL, 0.87491, 0.87731, 5, NULL, 1787506033, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787506033, NULL, 1787506029657);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (28, '18', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/JPY (OTC)', NULL, 1, 'down', NULL, 170.80422, 170.9048, 5, NULL, 1787506094, NULL, 1, 'demo', NULL, 'lost', 0, NULL, 1787506095, NULL, 1787506091558);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (29, '19', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/JPY (OTC)', NULL, 1, 'down', NULL, 174.04815, 174.28491, 5, NULL, 1787506260, NULL, 1, 'demo', NULL, 'lost', 0, NULL, 1787506261, NULL, 1787506257603);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (30, '20', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/JPY (OTC)', NULL, 1, 'up', NULL, 174.38753, 174.42, 5, NULL, 1787506264, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787506264, NULL, 1787506260741);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (31, '21', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/JPY (OTC)', NULL, 1, 'down', NULL, 174.53001, 174.4747, 5, NULL, 1787506269, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787506270, NULL, 1787506266404);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (32, '22', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/JPY (OTC)', NULL, 1, 'up', NULL, 174.05992, 174.40973, 5, NULL, 1787506277, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787506278, NULL, 1787506274197);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (33, '2zrq8c8f1m', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/JPY (OTC)', NULL, 1, 'down', NULL, 159.25094, 156.37228, 52, NULL, 1787508540, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787508541, NULL, 1787508489570);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (34, '33', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/JPY (OTC)', NULL, 1, 'down', NULL, 159.25094, 156.37228, 52, NULL, 1787508540, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787508541, NULL, 1787508489570);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (35, 'mrjrbqp6ix', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/JPY (OTC)', NULL, 1, 'down', NULL, 158.82795, 156.37228, 45, NULL, 1787508540, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787508541, NULL, 1787508495767);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (36, '35', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'EUR/JPY (OTC)', NULL, 1, 'down', NULL, 158.82795, 156.37228, 45, NULL, 1787508540, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787508541, NULL, 1787508495767);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (37, 'vukafpqy2h', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'AUD/CAD (OTC)', NULL, 1, 'down', NULL, 0.88159, 0.88395, 5, NULL, 1787510170, NULL, 1, 'demo', NULL, 'lost', 0, NULL, 1787510171, NULL, 1787510167424);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (38, '37', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'AUD/CAD (OTC)', NULL, 1, 'down', NULL, 0.88159, 0.88395, 5, NULL, 1787510170, NULL, 1, 'demo', NULL, 'lost', 0, NULL, 1787510171, NULL, 1787510167424);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (39, 'pg6yvnmb2u', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'AUD/CAD (OTC)', NULL, 1, 'down', NULL, 0.88824, 0.88387, 42, NULL, 1787510220, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787510227, NULL, 1787510179328);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (40, 'ipih1sw9l8', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'AUD/CAD (OTC)', NULL, 1, 'up', NULL, 0.89279, 0.88823, 97, NULL, 1787510280, NULL, 1, 'demo', NULL, 'lost', 0, NULL, 1787510281, NULL, 1787510184619);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (41, '39', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'AUD/CAD (OTC)', NULL, 1, 'down', NULL, 0.88824, 0.88387, 42, NULL, 1787510220, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787510227, NULL, 1787510179328);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (42, '40', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'AUD/CAD (OTC)', NULL, 1, 'up', NULL, 0.89279, 0.88823, 97, NULL, 1787510280, NULL, 1, 'demo', NULL, 'lost', 0, NULL, 1787510281, NULL, 1787510184619);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (43, 'urtj4kypi5', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'AUD/CAD (OTC)', NULL, 1, 'up', NULL, 0.88752, 0.88999, 39, NULL, 1787510520, NULL, 1, 'demo', NULL, 'won', 1.9, NULL, 1787510520, NULL, 1787510482493);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (44, 'ap8cj0erxn', 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'AUD/CAD (OTC)', NULL, 1, 'up', NULL, 0.88646, 0.85777, 95, NULL, 1787510580, NULL, 1, 'demo', NULL, 'lost', 0, NULL, 1787510580, NULL, 1787510486143);

--
-- Table structure for transactions
--


--
-- Table structure for audit_logs
--


--
-- Table structure for system_backups
--

-- Dumping data for table system_backups (48 rows)
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787499134541', 1787499134541, 'backup_2026-08-23T15-32-14-541Z_1787499134541.sql', 1058, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787499134541', 1787499134541, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787499247312', 1787499247312, 'backup_2026-08-23T15-34-07-312Z_1787499247312.sql', 8173, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787499247312', 1787499247312, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787499625327', 1787499625327, 'backup_2026-08-23T15-40-25-327Z_1787499625327.sql', 9713, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787499625327', 1787499625327, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787499639728', 1787499639728, 'backup_2026-08-23T15-40-39-728Z_1787499639728.sql', 10179, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787499639728', 1787499639728, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787500538283', 1787500538283, 'backup_2026-08-23T15-55-38-283Z_1787500538283.sql', 11230, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787500538283', 1787500538283, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787500949169', 1787500949169, 'backup_2026-08-23T16-02-29-169Z_1787500949169.sql', 12227, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787500949169', 1787500949169, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787500956349', 1787500956349, 'backup_2026-08-23T16-02-36-349Z_1787500956349.sql', 12694, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787500956349', 1787500956349, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787501861595', 1787501861595, 'backup_2026-08-23T16-17-41-595Z_1787501861595.sql', 14226, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787501861595', 1787501861595, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787501867024', 1787501867024, 'backup_2026-08-23T16-17-47-024Z_1787501867024.sql', 14693, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787501867024', 1787501867024, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787504445033', 1787504445033, 'backup_2026-08-23T17-00-45-033Z_1787504445033.sql', 15157, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787504445033', 1787504445033, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787504817565', 1787504817565, 'backup_2026-08-23T17-06-57-565Z_1787504817565.sql', 15624, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787504817565', 1787504817565, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787505005611', 1787505005611, 'backup_2026-08-23T17-10-05-611Z_1787505005611.sql', 16091, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787505005611', 1787505005611, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787505012127', 1787505012127, 'backup_2026-08-23T17-10-12-127Z_1787505012127.sql', 16558, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787505012127', 1787505012127, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787505885431', 1787505885431, 'backup_2026-08-23T17-24-45-431Z_1787505885431.sql', 21316, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787505885431', 1787505885431, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787505891037', 1787505891037, 'backup_2026-08-23T17-24-51-037Z_1787505891037.sql', 21783, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787505891037', 1787505891037, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787508843017', 1787508843017, 'backup_2026-08-23T18-14-03-017Z_1787508843017.sql', 34599, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787508843017', 1787508843017, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787508850069', 1787508850069, 'backup_2026-08-23T18-14-10-069Z_1787508850069.sql', 35066, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787508850069', 1787508850069, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787509955613', 1787509955613, 'backup_2026-08-23T18-32-35-613Z_1787509955613.sql', 36070, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787509955613', 1787509955613, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787509965406', 1787509965406, 'backup_2026-08-23T18-32-45-406Z_1787509965406.sql', 36537, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787509965406', 1787509965406, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787510220071', 1787510220071, 'backup_2026-08-23T18-37-00-071Z_1787510220071.sql', 39140, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787510220071', 1787510220071, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787510262621', 1787510262621, 'backup_2026-08-23T18-37-42-621Z_1787510262621.sql', 39614, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787510262621', 1787510262621, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787510268032', 1787510268032, 'backup_2026-08-23T18-37-48-032Z_1787510268032.sql', 40081, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787510268032', 1787510268032, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787510356434', 1787510356434, 'backup_2026-08-23T18-39-16-434Z_1787510356434.sql', 41617, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787510356434', 1787510356434, 'N/A', 0, 'failed', 0, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1787510364982', 1787510364982, 'backup_2026-08-23T18-39-24-982Z_1787510364982.sql', 42084, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_fail_1787510364982', 1787510364982, 'N/A', 0, 'failed', 0, 'system_pre_boot');

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

