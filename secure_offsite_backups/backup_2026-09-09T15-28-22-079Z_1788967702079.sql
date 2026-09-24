-- Bivaax Trade Enterprise Backup (Logical Fallback)
-- Generated at: 2026-09-09T15:28:22.079Z
-- Requested by: system_pre_boot
-- Database type: SQLite


--
-- Table structure for app_settings
--

-- Dumping data for table app_settings (1 rows)
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('auto_market_config', '{"enabled":false,"lossRate":80,"winRate":20,"maxConcurrentTrades":10,"realOnly":true}', 1788950774227, 1788950774227);

--
-- Table structure for users
--

-- Dumping data for table users (2 rows)
INSERT OR IGNORE INTO "users" ("id", "uid", "email", "display_name", "nickname", "photo_url", "password_hash", "real_balance", "demo_balance", "currency", "tfa_enabled", "tfa_mode", "tfa_secret", "is_verified", "is_email_verified", "is_nid_verified", "nid_number", "is_admin", "phone", "country", "country_code", "first_name", "last_name", "gender", "dob", "birth_day", "birth_month", "birth_year", "time_zone", "language", "newsletter", "allow_notifications", "status", "kyc_status", "referred_by_uid", "referral_code", "referral_sub_id", "referral_type", "affiliate_balance", "total_affiliate_earnings", "referral_count", "custom_affiliate_share", "withdrawal_otp", "withdrawal_otp_expires_at", "total_live_volume", "updated_at", "created_at", "total_deposits", "smart_mode_enabled", "smart_mode_strategy", "manipulation_mode", "bx_coins", "risk_free_trades", "password") VALUES (1, 'admin_seed_6ouzbebg', 'hamproosapport@gmail.com', 'Bivaax Super Admin', 'Admin', NULL, '$2b$10$UWI.xzM1uAAhJXf56PtYYOjFy5Ib.0llzeb6X6/VOZY2eA36PiTQe', 1000, 10000, 'USD', 0, 'app', NULL, 0, 0, 0, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 'Standard', 'unverified', NULL, '6P6XY8', NULL, NULL, 0, 0, 0, NULL, NULL, NULL, 0, NULL, 1788950768619, 0, 0, 'auto_25_percent', 'neutral', 0, 0, NULL);
INSERT OR IGNORE INTO "users" ("id", "uid", "email", "display_name", "nickname", "photo_url", "password_hash", "real_balance", "demo_balance", "currency", "tfa_enabled", "tfa_mode", "tfa_secret", "is_verified", "is_email_verified", "is_nid_verified", "nid_number", "is_admin", "phone", "country", "country_code", "first_name", "last_name", "gender", "dob", "birth_day", "birth_month", "birth_year", "time_zone", "language", "newsletter", "allow_notifications", "status", "kyc_status", "referred_by_uid", "referral_code", "referral_sub_id", "referral_type", "affiliate_balance", "total_affiliate_earnings", "referral_count", "custom_affiliate_share", "withdrawal_otp", "withdrawal_otp_expires_at", "total_live_volume", "updated_at", "created_at", "total_deposits", "smart_mode_enabled", "smart_mode_strategy", "manipulation_mode", "bx_coins", "risk_free_trades", "password") VALUES (2, 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'bivaaxtrfddssddsade@gmail.com', 'bivaaxtrfddssddsade', NULL, NULL, NULL, 0, 9998.9, 'USD', 0, 'app', NULL, 0, 0, 0, NULL, 0, NULL, 'Bangladesh', 'BD', NULL, NULL, '---', '{"day":"---","month":"---","year":"---"}', '---', '---', '---', 'UTC', 'en', 1, 1, 'Standard', 'unverified', NULL, '', NULL, NULL, 0, 0, 0, NULL, NULL, NULL, 990, NULL, NULL, 0, 0, 'auto_25_percent', 'neutral', 99, 0, NULL);

--
-- Table structure for tournaments
--

-- Dumping data for table tournaments (3 rows)
INSERT OR IGNORE INTO "tournaments" ("id", "type", "title", "description", "banner_url", "prize_pool", "entry_fee", "min_players", "max_players", "start_time", "end_time", "status", "is_locked", "requirements", "created_at") VALUES ('t-daily-free', 'Daily Free', 'Daily Freebie Blast', 'Join the daily free tournament and win real cash prizes! No entry fee required.', 'https://i.postimg.cc/X7V2GwM7/file-0000000098bc8207bad85a8ea8279dc3.png', 100, 0, 10, 1000, 1788954369216, 1789037169216, 'active', 0, '{"minBalance":0}', 1788950769216);
INSERT OR IGNORE INTO "tournaments" ("id", "type", "title", "description", "banner_url", "prize_pool", "entry_fee", "min_players", "max_players", "start_time", "end_time", "status", "is_locked", "requirements", "created_at") VALUES ('t-weekly-pro', 'Weekly', 'Weekly Pro Challenge', 'Compete with the best for a massive prize pool. Show your trading skills!', 'https://i.postimg.cc/Cx5mJSLm/file-000000006d208208a8989dc8d13c649f.png', 5000, 10, 50, 5000, 1788876708216, 1789481508216, 'active', 1, '{"minBalance":100,"kycRequired":true}', 1788950769216);
INSERT OR IGNORE INTO "tournaments" ("id", "type", "title", "description", "banner_url", "prize_pool", "entry_fee", "min_players", "max_players", "start_time", "end_time", "status", "is_locked", "requirements", "created_at") VALUES ('t-prestige-elite', 'Prestige', 'Elite Prestige Cup', 'The ultimate tournament for our VIP traders. High stakes, higher rewards.', 'https://i.postimg.cc/fb05nCdy/file-000000004db08211a55c9e853e4af6fd.png', 25000, 100, 10, 100, 1789555569216, 1790160369216, 'scheduled', 1, '{"minBalance":1000,"statusRequired":"VIP"}', 1788950769216);

--
-- Table structure for tournament_participants
--

-- Dumping data for table tournament_participants (2 rows)
INSERT OR IGNORE INTO "tournament_participants" ("tournament_id", "user_id", "score", "rank", "joined_at") VALUES ('t-daily-free', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 10000, NULL, 1788962759944);
INSERT OR IGNORE INTO "tournament_participants" ("tournament_id", "user_id", "score", "rank", "joined_at") VALUES ('t-weekly-pro', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 0, NULL, 1788962763060);

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

-- Dumping data for table leaderboard_stats (1 rows)
INSERT OR IGNORE INTO "leaderboard_stats" ("user_id", "total_profit", "total_trades", "won_trades", "lost_trades", "draw_trades", "total_volume", "current_streak", "max_streak", "roi", "last_trade_at") VALUES ('WZjBt6SvgaP1RLOmEmi2EOFJnVu2', -990, 1, 0, 1, 0, 990, -1, 0, 0, 1788962940580);

--
-- Table structure for trades
--

-- Dumping data for table trades (28 rows)
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (1, 't363qehfuy', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'EUR/USD (OTC)', 'EUR/USD (OTC)', 1, 'up', 'up', 1.08481, 1.0828, 36, 36, 1788960300, '1788960300000', 1, 'demo', NULL, 'lost', NULL, 0, '90', 1788960300, NULL, 1788960263436);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (2, '1', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'EUR/USD (OTC)', NULL, 1, 'up', NULL, 1.08481, 1.0828, 36, NULL, 1788960300, NULL, 1, 'demo', NULL, 'lost', NULL, 0, NULL, 1788960300, NULL, 1788960263436);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (3, 'rbksme2jdq', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', 'GBP/USD (OTC)', 1, 'down', 'down', 1.26342, 1.26635, 54, 54, 1788961980, '1788961980000', 1, 'demo', NULL, 'lost', NULL, 0, '90', 1788961980, NULL, 1788961925185);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (4, 'w7qtucv3px', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', 'GBP/USD (OTC)', 1, 'up', 'up', 1.26268, 1.26635, 49, 49, 1788961980, '1788961980000', 1, 'demo', NULL, 'won', NULL, 1.9, '90', 1788961980, NULL, 1788961930116);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (5, '3', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', NULL, 1, 'down', NULL, 1.26342, 1.26635, 54, NULL, 1788961980, NULL, 1, 'demo', NULL, 'lost', NULL, 0, NULL, 1788961980, NULL, 1788961925185);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (6, '4', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', NULL, 1, 'up', NULL, 1.26268, 1.26635, 49, NULL, 1788961980, NULL, 1, 'demo', NULL, 'won', NULL, 1.9, NULL, 1788961980, NULL, 1788961930116);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (7, '8o1hdkgz27', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', 'GBP/USD (OTC)', 1000, 'up', 'up', 1.26111, 1.2582, 37, 37, 1788962820, '1788962820000', 0, 'tournament', 't-weekly-pro', 'lost', NULL, 0, '90', 1788962820, NULL, 1788962782622);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (8, 'ggotv9ka50', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', 'GBP/USD (OTC)', 1000, 'up', 'up', 1.26101, 1.2582, 36, 36, 1788962820, '1788962820000', 0, 'tournament', 't-weekly-pro', 'lost', NULL, 0, '90', 1788962820, NULL, 1788962783854);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (9, 'szdtg9trl0', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', 'GBP/USD (OTC)', 1000, 'up', 'up', 1.26085, 1.2582, 35, 35, 1788962820, '1788962820000', 0, 'tournament', 't-weekly-pro', 'lost', NULL, 0, '90', 1788962820, NULL, 1788962784319);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (10, 'inh9btd8x8', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', 'GBP/USD (OTC)', 1000, 'up', 'up', 1.26085, 1.2582, 35, 35, 1788962820, '1788962820000', 0, 'tournament', 't-weekly-pro', 'lost', NULL, 0, '90', 1788962820, NULL, 1788962784745);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (11, '248tjfs0em', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', 'GBP/USD (OTC)', 1000, 'up', 'up', 1.26047, 1.2582, 34, 34, 1788962820, '1788962820000', 0, 'tournament', 't-weekly-pro', 'lost', NULL, 0, '90', 1788962820, NULL, 1788962785201);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (12, '7901hydnke', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', 'GBP/USD (OTC)', 1000, 'up', 'up', 1.26047, 1.2582, 34, 34, 1788962820, '1788962820000', 0, 'tournament', 't-weekly-pro', 'lost', NULL, 0, '90', 1788962820, NULL, 1788962785451);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (13, 'lh2nrbhr3t', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', 'GBP/USD (OTC)', 1000, 'up', 'up', 1.26047, 1.2582, 34, 34, 1788962820, '1788962820000', 0, 'tournament', 't-weekly-pro', 'lost', NULL, 0, '90', 1788962820, NULL, 1788962785857);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (14, 'l9fy0nmp5g', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', 'GBP/USD (OTC)', 1000, 'up', 'up', 1.26047, 1.2582, 33, 33, 1788962820, '1788962820000', 0, 'tournament', 't-weekly-pro', 'lost', NULL, 0, '90', 1788962820, NULL, 1788962786076);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (15, '36qgq6hlwb', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', 'GBP/USD (OTC)', 1000, 'up', 'up', 1.26006, 1.2582, 33, 33, 1788962820, '1788962820000', 0, 'tournament', 't-weekly-pro', 'lost', NULL, 0, '90', 1788962820, NULL, 1788962786307);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (16, 'ux2ps9a3js', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', 'GBP/USD (OTC)', 1000, 'up', 'up', 1.26006, 1.2582, 33, 33, 1788962820, '1788962820000', 0, 'tournament', 't-weekly-pro', 'lost', NULL, 0, '90', 1788962820, NULL, 1788962786516);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (17, 'eqjwlw5fw9', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', 'GBP/USD (OTC)', 990, 'down', 'down', 1.25485, 1.256, 62, 62, 1788962940, '1788962940000', 0, 'real', NULL, 'lost', NULL, 0, '90', 1788962940, NULL, 1788962877910);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (18, '7', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', NULL, 1000, 'up', NULL, 1.26111, 1.2582, 37, NULL, 1788962820, NULL, 0, 'demo', NULL, 'lost', NULL, 0, NULL, 1788962820, NULL, 1788962782622);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (19, '8', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', NULL, 1000, 'up', NULL, 1.26101, 1.2582, 36, NULL, 1788962820, NULL, 0, 'demo', NULL, 'lost', NULL, 0, NULL, 1788962820, NULL, 1788962783854);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (20, '9', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', NULL, 1000, 'up', NULL, 1.26085, 1.2582, 35, NULL, 1788962820, NULL, 0, 'demo', NULL, 'lost', NULL, 0, NULL, 1788962820, NULL, 1788962784319);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (21, '10', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', NULL, 1000, 'up', NULL, 1.26085, 1.2582, 35, NULL, 1788962820, NULL, 0, 'demo', NULL, 'lost', NULL, 0, NULL, 1788962820, NULL, 1788962784745);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (22, '11', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', NULL, 1000, 'up', NULL, 1.26047, 1.2582, 34, NULL, 1788962820, NULL, 0, 'demo', NULL, 'lost', NULL, 0, NULL, 1788962820, NULL, 1788962785201);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (23, '12', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', NULL, 1000, 'up', NULL, 1.26047, 1.2582, 34, NULL, 1788962820, NULL, 0, 'demo', NULL, 'lost', NULL, 0, NULL, 1788962820, NULL, 1788962785451);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (24, '13', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', NULL, 1000, 'up', NULL, 1.26047, 1.2582, 34, NULL, 1788962820, NULL, 0, 'demo', NULL, 'lost', NULL, 0, NULL, 1788962820, NULL, 1788962785857);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (25, '14', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', NULL, 1000, 'up', NULL, 1.26047, 1.2582, 33, NULL, 1788962820, NULL, 0, 'demo', NULL, 'lost', NULL, 0, NULL, 1788962820, NULL, 1788962786076);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (26, '15', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', NULL, 1000, 'up', NULL, 1.26006, 1.2582, 33, NULL, 1788962820, NULL, 0, 'demo', NULL, 'lost', NULL, 0, NULL, 1788962820, NULL, 1788962786307);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (27, '16', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', NULL, 1000, 'up', NULL, 1.26006, 1.2582, 33, NULL, 1788962820, NULL, 0, 'demo', NULL, 'lost', NULL, 0, NULL, 1788962820, NULL, 1788962786516);
INSERT OR IGNORE INTO "trades" ("id", "firebase_id", "user_id", "market_id", "asset", "amount", "direction", "type", "entry_price", "exit_price", "duration", "time_left", "expiry_time", "expiration_time", "is_demo", "account_type", "tournament_id", "status", "target_result", "payout_amount", "payout", "settled_at", "updated_at", "created_at") VALUES (28, '17', 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'GBP/USD (OTC)', NULL, 990, 'down', NULL, 1.25485, 1.256, 62, NULL, 1788962940, NULL, 0, 'demo', NULL, 'lost', NULL, 0, NULL, 1788962940, NULL, 1788962877910);

--
-- Table structure for transactions
--

-- Dumping data for table transactions (1 rows)
INSERT OR IGNORE INTO "transactions" ("id", "user_id", "type", "amount", "currency", "status", "method", "tx_hash", "details", "updated_at", "created_at", "order_id") VALUES (1, 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'tournament_entry', 10, 'USD', 'completed', 'wallet', NULL, 'Entry fee for tournament: Weekly Pro Challenge', NULL, 1788962763060, NULL);

--
-- Table structure for audit_logs
--

-- Dumping data for table audit_logs (35 rows)
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (1, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788950768411', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T10-46-08-411Z_1788950768411.sql (0.00 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788950768411);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (2, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788958080746', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T12-48-00-746Z_1788958080746.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788958080746);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (3, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788958369594', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T12-52-49-594Z_1788958369594.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788958369594);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (4, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788959182469', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T13-06-22-469Z_1788959182469.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788959182469);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (5, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788959191258', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T13-06-31-258Z_1788959191258.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788959191258);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (6, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788959820579', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T13-17-00-579Z_1788959820579.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788959820579);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (7, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788959828524', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T13-17-08-524Z_1788959828524.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788959828524);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (8, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788960199896', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T13-23-19-896Z_1788960199896.sql (0.04 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788960199896);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (9, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788960419638', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T13-26-59-638Z_1788960419638.sql (0.04 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788960419638);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (10, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788960431071', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T13-27-11-071Z_1788960431071.sql (0.04 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788960431071);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (11, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788960661046', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T13-31-01-046Z_1788960661046.sql (0.04 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788960661046);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (12, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788961005438', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T13-36-45-438Z_1788961005438.sql (0.04 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788961005438);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (13, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788961012262', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T13-36-52-262Z_1788961012262.sql (0.04 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788961012262);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (14, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788961627807', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T13-47-07-807Z_1788961627807.sql (0.04 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788961627807);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (15, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788962037616', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T13-53-57-616Z_1788962037616.sql (0.04 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788962037616);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (16, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788962698898', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T14-04-58-898Z_1788962698898.sql (0.04 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788962698898);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (17, 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'trade_place', 'trade_place', 0, 0, 0, NULL, 'trade', '7', '{"pair":"GBP/USD (OTC)","amount":1000,"direction":"up","entryPrice":1.26111}', NULL, 1788962789881);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (18, 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'trade_place', 'trade_place', 0, 0, 0, NULL, 'trade', '8', '{"pair":"GBP/USD (OTC)","amount":1000,"direction":"up","entryPrice":1.26101}', NULL, 1788962791121);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (19, 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'trade_place', 'trade_place', 0, 0, 0, NULL, 'trade', '9', '{"pair":"GBP/USD (OTC)","amount":1000,"direction":"up","entryPrice":1.26085}', NULL, 1788962791568);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (20, 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'trade_place', 'trade_place', 0, 0, 0, NULL, 'trade', '10', '{"pair":"GBP/USD (OTC)","amount":1000,"direction":"up","entryPrice":1.26085}', NULL, 1788962792006);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (21, 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'trade_place', 'trade_place', 0, 0, 0, NULL, 'trade', '11', '{"pair":"GBP/USD (OTC)","amount":1000,"direction":"up","entryPrice":1.26047}', NULL, 1788962792452);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (22, 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'trade_place', 'trade_place', 0, 0, 0, NULL, 'trade', '12', '{"pair":"GBP/USD (OTC)","amount":1000,"direction":"up","entryPrice":1.26047}', NULL, 1788962792693);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (23, 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'trade_place', 'trade_place', 0, 0, 0, NULL, 'trade', '13', '{"pair":"GBP/USD (OTC)","amount":1000,"direction":"up","entryPrice":1.26047}', NULL, 1788962793118);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (24, 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'trade_place', 'trade_place', 0, 0, 0, NULL, 'trade', '14', '{"pair":"GBP/USD (OTC)","amount":1000,"direction":"up","entryPrice":1.26047}', NULL, 1788962793322);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (25, 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'trade_place', 'trade_place', 0, 0, 0, NULL, 'trade', '15', '{"pair":"GBP/USD (OTC)","amount":1000,"direction":"up","entryPrice":1.26006}', NULL, 1788962793547);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (26, 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'trade_place', 'trade_place', 0, 0, 0, NULL, 'trade', '16', '{"pair":"GBP/USD (OTC)","amount":1000,"direction":"up","entryPrice":1.26006}', NULL, 1788962793775);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (27, 'WZjBt6SvgaP1RLOmEmi2EOFJnVu2', 'trade_place', 'trade_place', 0, 0, 0, NULL, 'trade', '17', '{"pair":"GBP/USD (OTC)","amount":990,"direction":"down","entryPrice":1.25485}', NULL, 1788962885230);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (28, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788963107775', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T14-11-47-775Z_1788963107775.sql (0.06 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788963107775);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (29, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788963467894', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T14-17-47-894Z_1788963467894.sql (0.06 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788963467894);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (30, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788963824461', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T14-23-44-461Z_1788963824461.sql (0.06 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788963824461);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (31, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788963835788', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T14-23-55-788Z_1788963835788.sql (0.06 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788963835788);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (32, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788963964704', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T14-26-04-704Z_1788963964704.sql (0.06 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788963964704);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (33, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788964359409', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T14-32-39-409Z_1788964359409.sql (0.07 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788964359409);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (34, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788965699770', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T14-54-59-770Z_1788965699770.sql (0.07 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788965699770);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (35, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788967672250', NULL, NULL, 'Database backup created successfully: backup_2026-09-09T15-27-52-250Z_1788967672250.sql (0.07 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788967672250);

--
-- Table structure for system_backups
--

-- Dumping data for table system_backups (24 rows)
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788950768411', 1788950768411, 'backup_2026-09-09T10-46-08-411Z_1788950768411.sql', 1058, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788958080746', 1788958080746, 'backup_2026-09-09T12-48-00-746Z_1788958080746.sql', 32472, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788958369594', 1788958369594, 'backup_2026-09-09T12-52-49-594Z_1788958369594.sql', 33207, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788959182469', 1788959182469, 'backup_2026-09-09T13-06-22-469Z_1788959182469.sql', 33942, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788959191258', 1788959191258, 'backup_2026-09-09T13-06-31-258Z_1788959191258.sql', 34677, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788959820579', 1788959820579, 'backup_2026-09-09T13-17-00-579Z_1788959820579.sql', 35412, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788959828524', 1788959828524, 'backup_2026-09-09T13-17-08-524Z_1788959828524.sql', 36147, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788960199896', 1788960199896, 'backup_2026-09-09T13-23-19-896Z_1788960199896.sql', 36882, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788960419638', 1788960419638, 'backup_2026-09-09T13-26-59-638Z_1788960419638.sql', 38237, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788960431071', 1788960431071, 'backup_2026-09-09T13-27-11-071Z_1788960431071.sql', 38972, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788960661046', 1788960661046, 'backup_2026-09-09T13-31-01-046Z_1788960661046.sql', 40260, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788961005438', 1788961005438, 'backup_2026-09-09T13-36-45-438Z_1788961005438.sql', 40996, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788961012262', 1788961012262, 'backup_2026-09-09T13-36-52-262Z_1788961012262.sql', 41732, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788961627807', 1788961627807, 'backup_2026-09-09T13-47-07-807Z_1788961627807.sql', 42468, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788962037616', 1788962037616, 'backup_2026-09-09T13-53-57-616Z_1788962037616.sql', 44371, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788962698898', 1788962698898, 'backup_2026-09-09T14-04-58-898Z_1788962698898.sql', 46212, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788963107775', 1788963107775, 'backup_2026-09-09T14-11-47-775Z_1788963107775.sql', 59101, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788963467894', 1788963467894, 'backup_2026-09-09T14-17-47-894Z_1788963467894.sql', 65936, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788963824461', 1788963824461, 'backup_2026-09-09T14-23-44-461Z_1788963824461.sql', 66672, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788963835788', 1788963835788, 'backup_2026-09-09T14-23-55-788Z_1788963835788.sql', 67408, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788963964704', 1788963964704, 'backup_2026-09-09T14-26-04-704Z_1788963964704.sql', 68144, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788964359409', 1788964359409, 'backup_2026-09-09T14-32-39-409Z_1788964359409.sql', 68880, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788965699770', 1788965699770, 'backup_2026-09-09T14-54-59-770Z_1788965699770.sql', 69616, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788967672250', 1788967672250, 'backup_2026-09-09T15-27-52-250Z_1788967672250.sql', 70352, 'success', 21, 'system_pre_boot');

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
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m31', 'Prime_Bull_31', '🇩🇪', 88, 289338, 62);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m32', 'Alpha_Signals_32', '🇨🇦', 92, 470601, 72);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m33', 'Nova_Strategy_33', '🇬🇧', 89, 131898, 88);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m34', 'Prime_Bull_34', '🇺🇸', 87, 262714, 110);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m35', 'Ultra_Bull_35', '🇩🇪', 75, 129751, 91);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m36', 'Super_Bull_36', '🇺🇸', 75, 277338, 41);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m37', 'Apex_Gold_37', '🇻🇳', 70, 202270, 56);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m38', 'Elite_Profit_38', '🇹🇷', 72, 51675, 41);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m39', 'Elite_Forex_39', '🇸🇦', 73, 456714, 23);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m40', 'Max_Bull_40', '🇮🇹', 96, 477708, 20);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m41', 'Smart_Quantum_41', '🇬🇧', 87, 79255, 3);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m42', 'Global_Strategy_42', '🇮🇳', 83, 70427, 89);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m43', 'Max_Strategy_43', '🇧🇩', 88, 157308, 63);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m44', 'Nova_Flow_44', '🇩🇪', 70, 296071, 27);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m45', 'Neo_Wealth_45', '🇰🇼', 88, 83108, 55);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m46', 'Smart_Bull_46', '🇦🇪', 81, 324150, 4);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m47', 'Swift_Forex_47', '🇶🇦', 72, 46739, 84);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m48', 'Global_Trader_48', '🇺🇸', 71, 411223, 15);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m49', 'Expert_Profit_49', '🇳🇬', 95, 15704, 16);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m50', 'Hyper_Flow_50', '🇮🇩', 88, 216006, 96);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m51', 'Hyper_King_51', '🇰🇼', 96, 72890, 31);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m52', 'Super_Bull_52', '🇧🇩', 78, 26614, 76);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m53', 'Prime_Quantum_53', '🇲🇾', 66, 333017, 27);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m54', 'Global_Wealth_54', '🇰🇼', 76, 125446, 38);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m55', 'Ultra_Trader_55', '🇶🇦', 92, 290066, 40);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m56', 'Smart_King_56', '🇧🇩', 86, 89944, 74);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m57', 'Hyper_Trader_57', '🇯🇵', 94, 465006, 92);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m58', 'Nova_Trader_58', '🇦🇺', 72, 445477, 31);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m59', 'Apex_Flow_59', '🇵🇭', 82, 323720, 78);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m60', 'Ultra_Market_60', '🇶🇦', 91, 438222, 19);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m61', 'Ultra_Wealth_61', '🇺🇸', 86, 28372, 50);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m62', 'Elite_Flow_62', '🇰🇷', 65, 236184, 83);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m63', 'Neo_Bull_63', '🇪🇸', 79, 25414, 98);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m64', 'Global_Market_64', '🇦🇪', 76, 98111, 20);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m65', 'Master_Strategy_65', '🇧🇷', 91, 102564, 116);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m66', 'Smart_Market_66', '🇦🇪', 78, 391334, 54);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m67', 'Alpha_Signals_67', '🇿🇦', 66, 86959, 59);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m68', 'Swift_Signals_68', '🇲🇽', 94, 288301, 22);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m69', 'Prime_Scalper_69', '🇰🇼', 65, 97802, 11);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m70', 'Smart_Scalper_70', '🇮🇩', 89, 181193, 67);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m71', 'Apex_Flow_71', '🇺🇸', 69, 290843, 104);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m72', 'Max_Scalper_72', '🇦🇺', 68, 473530, 50);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m73', 'Alpha_Strategy_73', '🇳🇬', 74, 108405, 43);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m74', 'Swift_Profit_74', '🇸🇦', 73, 333352, 9);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m75', 'Pro_Signals_75', '🇬🇧', 92, 296720, 22);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m76', 'Neo_Flow_76', '🇶🇦', 66, 28636, 17);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m77', 'Super_Scalper_77', '🇧🇩', 91, 421357, 118);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m78', 'Hyper_Strategy_78', '🇲🇾', 75, 351148, 69);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m79', 'Nova_Edge_79', '🇲🇾', 67, 163140, 35);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m80', 'Elite_Market_80', '🇳🇬', 85, 394572, 112);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m81', 'Apex_Flow_81', '🇳🇬', 67, 193968, 44);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m82', 'Hyper_Bull_82', '🇷🇺', 74, 326170, 21);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m83', 'Swift_Bull_83', '🇩🇪', 66, 69118, 119);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m84', 'Global_Scalper_84', '🇻🇳', 68, 111526, 6);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m85', 'Apex_Market_85', '🇮🇳', 91, 247306, 72);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m86', 'Alpha_Trader_86', '🇨🇦', 77, 275492, 12);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m87', 'Hyper_Flow_87', '🇻🇳', 94, 444990, 117);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m88', 'Elite_Gold_88', '🇦🇪', 84, 468248, 48);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m89', 'Swift_Trader_89', '🇨🇦', 75, 97299, 43);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m90', 'Prime_Wealth_90', '🇰🇷', 67, 96791, 14);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m91', 'Global_Gold_91', '🇮🇩', 94, 391948, 5);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m92', 'Pro_Flow_92', '🇶🇦', 95, 123775, 28);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m93', 'Super_Bull_93', '🇿🇦', 84, 445468, 107);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m94', 'Pro_Wealth_94', '🇩🇪', 84, 173985, 23);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m95', 'Alpha_Flow_95', '🇧🇩', 67, 417323, 81);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m96', 'Expert_Scalper_96', '🇦🇪', 73, 70180, 30);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m97', 'Pro_Edge_97', '🇬🇧', 86, 325591, 114);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m98', 'Hyper_Edge_98', '🇻🇳', 87, 389419, 83);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m99', 'Nova_Wealth_99', '🇩🇪', 69, 153500, 19);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m100', 'Expert_Wealth_100', '🇯🇵', 79, 211917, 89);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m101', 'Neo_King_101', '🇮🇩', 93, 208797, 88);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m102', 'Smart_King_102', '🇵🇭', 78, 309459, 36);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m103', 'Max_Signals_103', '🇮🇹', 74, 390144, 26);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m104', 'Super_Bull_104', '🇯🇵', 87, 32300, 4);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m105', 'Neo_Bull_105', '🇬🇧', 79, 326406, 84);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m106', 'Max_Quantum_106', '🇺🇸', 80, 470023, 75);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m107', 'Prime_Quantum_107', '🇦🇪', 68, 282086, 95);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m108', 'Ultra_Quantum_108', '🇿🇦', 82, 447420, 72);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m109', 'Ultra_Wizard_109', '🇩🇪', 75, 258474, 42);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m110', 'Hyper_Edge_110', '🇩🇪', 96, 57178, 110);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m111', 'Super_Flow_111', '🇹🇷', 66, 154498, 71);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m112', 'Apex_Profit_112', '🇰🇷', 87, 442950, 22);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m113', 'Neo_Scalper_113', '🇮🇩', 68, 352245, 106);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m114', 'Max_Edge_114', '🇧🇷', 93, 415656, 67);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m115', 'Master_Edge_115', '🇹🇷', 69, 323225, 27);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m116', 'Expert_Signals_116', '🇧🇩', 95, 194344, 29);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m117', 'Swift_Strategy_117', '🇿🇦', 73, 211517, 97);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m118', 'Nova_Forex_118', '🇮🇹', 74, 195227, 57);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m119', 'Neo_Flow_119', '🇫🇷', 82, 443149, 49);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m120', 'Smart_Gold_120', '🇲🇾', 93, 71140, 13);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m121', 'Master_Scalper_121', '🇪🇸', 66, 467720, 75);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m122', 'Ultra_Edge_122', '🇹🇷', 65, 103247, 58);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m123', 'Swift_Strategy_123', '🇪🇸', 85, 66984, 73);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m124', 'Elite_Flow_124', '🇮🇩', 84, 62656, 66);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m125', 'Hyper_Trader_125', '🇦🇺', 68, 231536, 66);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m126', 'Apex_King_126', '🇿🇦', 73, 128665, 63);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m127', 'Alpha_Wizard_127', '🇺🇸', 70, 126503, 2);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m128', 'Global_Edge_128', '🇯🇵', 79, 132261, 94);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m129', 'Swift_Wealth_129', '🇸🇦', 88, 503243, 15);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m130', 'Pro_Market_130', '🇮🇹', 74, 285790, 41);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m131', 'Neo_Profit_131', '🇲🇾', 82, 319820, 80);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m132', 'Apex_Gold_132', '🇦🇺', 85, 463322, 30);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m133', 'Ultra_Wizard_133', '🇨🇦', 79, 340473, 23);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m134', 'Max_Wealth_134', '🇧🇷', 92, 452133, 40);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m135', 'Global_Trader_135', '🇧🇷', 86, 129925, 48);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m136', 'Alpha_Flow_136', '🇰🇷', 68, 44368, 77);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m137', 'Apex_King_137', '🇫🇷', 95, 119690, 78);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m138', 'Nova_King_138', '🇰🇷', 87, 261513, 2);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m139', 'Ultra_Signals_139', '🇩🇪', 76, 224449, 39);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m140', 'Neo_Wealth_140', '🇲🇾', 74, 304324, 37);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m141', 'Neo_Market_141', '🇸🇦', 70, 433577, 41);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m142', 'Apex_Strategy_142', '🇸🇦', 82, 14546, 62);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m143', 'Elite_Strategy_143', '🇮🇩', 90, 296212, 48);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m144', 'Apex_Market_144', '🇪🇸', 72, 359551, 82);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m145', 'Swift_Forex_145', '🇮🇳', 84, 357503, 77);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m146', 'Swift_King_146', '🇺🇸', 79, 199305, 46);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m147', 'Swift_King_147', '🇬🇧', 82, 490329, 54);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m148', 'Smart_Scalper_148', '🇪🇸', 84, 450039, 90);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m149', 'Neo_Strategy_149', '🇮🇳', 92, 365172, 58);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m150', 'Pro_Forex_150', '🇲🇽', 93, 235704, 108);

--
-- Table structure for candles
--


--
-- Table structure for historical_candles
--

