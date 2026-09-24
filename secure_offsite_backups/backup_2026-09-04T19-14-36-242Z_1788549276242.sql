-- Bivaax Trade Enterprise Backup (Logical Fallback)
-- Generated at: 2026-09-04T19:14:36.242Z
-- Requested by: system_pre_boot
-- Database type: SQLite


--
-- Table structure for app_settings
--

-- Dumping data for table app_settings (21 rows)
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('binancePayQrCode', 'https://i.postimg.cc/Gt5SP1L4/IMG-20260804-141135.png', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('binancePayEnabled', 'true', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('usdtTrc20Address', 'TD73cKwhFQ3i5e43TYyoyMPijvkU4uHVwi', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('usdtTrc20QrCode', 'https://i.postimg.cc/ZKN9zFGL/IMG-20260804-151047.png', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('usdtTrc20Enabled', 'true', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('ethAddress', '0x8e01631855cf57fa2da27ff30c181cca137aefb5', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('ethQrCode', 'https://i.postimg.cc/T3WzTQGD/IMG-20260804-151727.png', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('ethEnabled', 'true', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('btcAddress', '0x8e01631855cf57fa2da27ff30c181cca137aefb5', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('btcQrCode', 'https://i.postimg.cc/GpKwd7Gr/IMG-20260804-235328.png', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('btcEnabled', 'true', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('tonAddress', 'UQCCpPsMUQJZK9DEzR-C51gJ13vBtSfPKNm53h1Wxys3Bof5', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('tonQrCode', 'https://i.postimg.cc/TYcfV9hD/IMG-20260805-120710.png', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('tonEnabled', 'true', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('dogeAddress', 'DQxycdGAx3Je27YSAc87WJ7ANq9McALh4U', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('dogeQrCode', 'https://i.postimg.cc/cCgtKzdX/IMG-20260805-121203.png', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('dogeEnabled', 'true', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('ltcAddress', 'LQ41bM2B892pfDX1suYe15hmsDuozgyZfU', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('ltcQrCode', 'https://i.postimg.cc/9FCX4MCs/IMG-20260805-125156.png', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('ltcEnabled', 'true', 1788548722983, 1788548722983);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('socialTelegram', 'https://t.me/Bivaax_Official', 1788548722983, 1788548722983);

--
-- Table structure for users
--

-- Dumping data for table users (2 rows)
INSERT OR IGNORE INTO "users" ("id", "uid", "email", "display_name", "nickname", "photo_url", "password_hash", "real_balance", "demo_balance", "currency", "tfa_enabled", "tfa_mode", "tfa_secret", "is_verified", "is_email_verified", "is_nid_verified", "nid_number", "is_admin", "phone", "country", "country_code", "first_name", "last_name", "gender", "dob", "birth_day", "birth_month", "birth_year", "time_zone", "language", "newsletter", "allow_notifications", "status", "kyc_status", "referred_by_uid", "referral_code", "referral_sub_id", "referral_type", "affiliate_balance", "total_affiliate_earnings", "referral_count", "custom_affiliate_share", "withdrawal_otp", "withdrawal_otp_expires_at", "total_live_volume", "updated_at", "created_at", "total_deposits", "smart_mode_enabled", "smart_mode_strategy", "manipulation_mode", "password", "bx_coins") VALUES (1, 'admin_seed_jkr99ew2', 'hamproosapport@gmail.com', 'Bivaax Super Admin', 'Admin', NULL, '$2b$10$0XuGBAg4X061DFjR8/PY6.9NIP8N72x/tu5ilzP1Qq8MrwyM5n9mS', 1000, 10000, 'USD', 0, 'app', NULL, 0, 0, 0, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 'Standard', 'unverified', NULL, '7KBKZR', NULL, NULL, 0, 0, 0, NULL, NULL, NULL, 0, NULL, 1788545859199, 0, 0, 'auto_25_percent', 'neutral', NULL, 0);
INSERT OR IGNORE INTO "users" ("id", "uid", "email", "display_name", "nickname", "photo_url", "password_hash", "real_balance", "demo_balance", "currency", "tfa_enabled", "tfa_mode", "tfa_secret", "is_verified", "is_email_verified", "is_nid_verified", "nid_number", "is_admin", "phone", "country", "country_code", "first_name", "last_name", "gender", "dob", "birth_day", "birth_month", "birth_year", "time_zone", "language", "newsletter", "allow_notifications", "status", "kyc_status", "referred_by_uid", "referral_code", "referral_sub_id", "referral_type", "affiliate_balance", "total_affiliate_earnings", "referral_count", "custom_affiliate_share", "withdrawal_otp", "withdrawal_otp_expires_at", "total_live_volume", "updated_at", "created_at", "total_deposits", "smart_mode_enabled", "smart_mode_strategy", "manipulation_mode", "password", "bx_coins") VALUES (2, 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'hasan1@gmail.com', 'hasan1', NULL, NULL, NULL, 0, 10000, 'USD', 0, 'app', NULL, 0, 0, 0, NULL, 1, NULL, 'Bangladesh', 'BD', NULL, NULL, '---', '{"day":"---","month":"---","year":"---"}', '---', '---', '---', 'UTC', 'en', 1, 1, 'Standard', 'unverified', NULL, '', NULL, NULL, 0, 0, 0, NULL, NULL, NULL, 0, NULL, NULL, 0, 0, 'auto_25_percent', 'neutral', NULL, 0);

--
-- Table structure for tournaments
--

-- Dumping data for table tournaments (3 rows)
INSERT OR IGNORE INTO "tournaments" ("id", "type", "title", "description", "banner_url", "prize_pool", "entry_fee", "min_players", "max_players", "start_time", "end_time", "status", "is_locked", "requirements", "created_at") VALUES ('t-daily-free', 'Daily Free', 'Daily Freebie Blast', 'Join the daily free tournament and win real cash prizes! No entry fee required.', 'https://i.postimg.cc/X7V2GwM7/file-0000000098bc8207bad85a8ea8279dc3.png', 100, 0, 10, 1000, 1788549459628, 1788632259628, 'scheduled', 0, '{"minBalance":0}', 1788545859628);
INSERT OR IGNORE INTO "tournaments" ("id", "type", "title", "description", "banner_url", "prize_pool", "entry_fee", "min_players", "max_players", "start_time", "end_time", "status", "is_locked", "requirements", "created_at") VALUES ('t-weekly-pro', 'Weekly', 'Weekly Pro Challenge', 'Compete with the best for a massive prize pool. Show your trading skills!', 'https://i.postimg.cc/Cx5mJSLm/file-000000006d208208a8989dc8d13c649f.png', 5000, 10, 50, 5000, 1788718659628, 1789323459628, 'scheduled', 1, '{"minBalance":100,"kycRequired":true}', 1788545859628);
INSERT OR IGNORE INTO "tournaments" ("id", "type", "title", "description", "banner_url", "prize_pool", "entry_fee", "min_players", "max_players", "start_time", "end_time", "status", "is_locked", "requirements", "created_at") VALUES ('t-prestige-elite', 'Prestige', 'Elite Prestige Cup', 'The ultimate tournament for our VIP traders. High stakes, higher rewards.', 'https://i.postimg.cc/fb05nCdy/file-000000004db08211a55c9e853e4af6fd.png', 25000, 100, 10, 100, 1789150659628, 1789755459628, 'scheduled', 1, '{"minBalance":1000,"statusRequired":"VIP"}', 1788545859628);

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


--
-- Table structure for transactions
--


--
-- Table structure for audit_logs
--

-- Dumping data for table audit_logs (9 rows)
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (1, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788545858943', NULL, NULL, 'Database backup created successfully: backup_2026-09-04T18-17-38-943Z_1788545858943.sql (0.00 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788545858943);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (2, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788546239329', NULL, NULL, 'Database backup created successfully: backup_2026-09-04T18-23-59-329Z_1788546239329.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788546239329);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (3, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788546248482', NULL, NULL, 'Database backup created successfully: backup_2026-09-04T18-24-08-482Z_1788546248482.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788546248482);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (4, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788546738280', NULL, NULL, 'Database backup created successfully: backup_2026-09-04T18-32-18-280Z_1788546738280.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788546738280);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (5, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788546746587', NULL, NULL, 'Database backup created successfully: backup_2026-09-04T18-32-26-587Z_1788546746587.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788546746587);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (6, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788548380682', NULL, NULL, 'Database backup created successfully: backup_2026-09-04T18-59-40-682Z_1788548380682.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788548380682);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (7, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788548389996', NULL, NULL, 'Database backup created successfully: backup_2026-09-04T18-59-49-996Z_1788548389996.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788548389996);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (8, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788549034039', NULL, NULL, 'Database backup created successfully: backup_2026-09-04T19-10-34-039Z_1788549034039.sql (0.04 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788549034039);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (9, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1788549055969', NULL, NULL, 'Database backup created successfully: backup_2026-09-04T19-10-55-969Z_1788549055969.sql (0.04 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1788549055969);

--
-- Table structure for system_backups
--

-- Dumping data for table system_backups (9 rows)
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788545858943', 1788545858943, 'backup_2026-09-04T18-17-38-943Z_1788545858943.sql', 1058, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788546239329', 1788546239329, 'backup_2026-09-04T18-23-59-329Z_1788546239329.sql', 32121, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788546248482', 1788546248482, 'backup_2026-09-04T18-24-08-482Z_1788546248482.sql', 32856, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788546738280', 1788546738280, 'backup_2026-09-04T18-32-18-280Z_1788546738280.sql', 33591, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788546746587', 1788546746587, 'backup_2026-09-04T18-32-26-587Z_1788546746587.sql', 34326, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788548380682', 1788548380682, 'backup_2026-09-04T18-59-40-682Z_1788548380682.sql', 35091, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788548389996', 1788548389996, 'backup_2026-09-04T18-59-49-996Z_1788548389996.sql', 35826, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788549034039', 1788549034039, 'backup_2026-09-04T19-10-34-039Z_1788549034039.sql', 40392, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1788549055969', 1788549055969, 'backup_2026-09-04T19-10-55-969Z_1788549055969.sql', 41127, 'success', 21, 'system_pre_boot');

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

-- Dumping data for table master_traders (151 rows)
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
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m31', 'Super_Signals_31', '🇦🇺', 87, 217256, 27);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m32', 'Max_Strategy_32', '🇰🇼', 89, 50707, 104);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m33', 'Expert_Trader_33', '🇳🇬', 65, 415148, 90);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m34', 'Neo_Wizard_34', '🇻🇳', 86, 334973, 48);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m35', 'Pro_Edge_35', '🇯🇵', 81, 129805, 85);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m36', 'Neo_Wizard_36', '🇵🇭', 87, 135122, 104);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m37', 'Master_Strategy_37', '🇺🇸', 88, 494817, 28);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m38', 'Master_Gold_38', '🇹🇷', 85, 413989, 116);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m39', 'Expert_Gold_39', '🇮🇳', 65, 103308, 28);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m40', 'Expert_Edge_40', '🇸🇬', 79, 196014, 88);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m41', 'Nova_Wizard_41', '🇳🇬', 66, 199427, 95);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m42', 'Hyper_Bull_42', '🇲🇽', 70, 412422, 108);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m43', 'Pro_Forex_43', '🇸🇦', 75, 65031, 29);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m44', 'Pro_Profit_44', '🇬🇧', 78, 479281, 118);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m45', 'Elite_Signals_45', '🇮🇹', 96, 436843, 108);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m46', 'Nova_Bull_46', '🇺🇸', 65, 375687, 61);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m47', 'Apex_Strategy_47', '🇵🇭', 79, 453184, 86);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m48', 'Prime_Signals_48', '🇦🇪', 79, 366452, 29);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m49', 'Ultra_Quantum_49', '🇬🇧', 70, 384661, 85);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m50', 'Max_Bull_50', '🇺🇸', 96, 298626, 80);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m51', 'Prime_Wizard_51', '🇪🇸', 84, 326394, 34);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m52', 'Master_Edge_52', '🇻🇳', 92, 143873, 114);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m53', 'Neo_Wealth_53', '🇳🇬', 67, 69265, 77);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m54', 'Apex_Strategy_54', '🇵🇭', 84, 191672, 51);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m55', 'Prime_Forex_55', '🇺🇸', 89, 405689, 71);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m56', 'Alpha_Market_56', '🇧🇷', 90, 487489, 89);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m57', 'Hyper_Signals_57', '🇨🇦', 84, 359219, 17);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m58', 'Neo_Wizard_58', '🇺🇸', 90, 458424, 8);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m59', 'Prime_King_59', '🇪🇸', 95, 284963, 47);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m60', 'Smart_King_60', '🇷🇺', 93, 357834, 21);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m61', 'Smart_Wealth_61', '🇮🇩', 78, 264982, 109);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m62', 'Alpha_Trader_62', '🇵🇭', 87, 412926, 63);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m63', 'Nova_Bull_63', '🇰🇷', 85, 287266, 14);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m64', 'Nova_Quantum_64', '🇸🇦', 95, 317029, 41);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m65', 'Smart_Forex_65', '🇲🇽', 67, 200135, 62);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m66', 'Hyper_Profit_66', '🇶🇦', 69, 112552, 18);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m67', 'Super_Flow_67', '🇸🇦', 81, 385210, 73);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m68', 'Apex_Gold_68', '🇬🇧', 66, 74134, 25);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m69', 'Prime_Profit_69', '🇮🇳', 67, 444397, 82);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m70', 'Alpha_Strategy_70', '🇳🇬', 74, 109697, 63);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m71', 'Pro_Flow_71', '🇲🇽', 74, 305414, 96);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m72', 'Alpha_Quantum_72', '🇧🇷', 94, 135559, 89);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m73', 'Expert_Edge_73', '🇲🇽', 66, 74569, 31);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m74', 'Hyper_Edge_74', '🇲🇽', 96, 148216, 6);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m75', 'Alpha_Flow_75', '🇰🇷', 82, 350689, 77);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m76', 'Global_Gold_76', '🇩🇪', 80, 205657, 55);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m77', 'Nova_Edge_77', '🇰🇼', 70, 112613, 4);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m78', 'Neo_Profit_78', '🇦🇪', 96, 450299, 118);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m79', 'Nova_Quantum_79', '🇪🇸', 85, 339377, 84);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m80', 'Hyper_Flow_80', '🇫🇷', 94, 293813, 49);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m81', 'Apex_Flow_81', '🇮🇹', 91, 172518, 106);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m82', 'Max_Wizard_82', '🇧🇩', 84, 62030, 106);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m83', 'Elite_Trader_83', '🇺🇸', 74, 329422, 77);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m84', 'Expert_Profit_84', '🇧🇩', 96, 354041, 115);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m85', 'Alpha_Gold_85', '🇨🇦', 92, 274092, 28);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m86', 'Pro_Profit_86', '🇸🇬', 95, 335770, 41);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m87', 'Elite_Signals_87', '🇧🇩', 78, 199363, 83);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m88', 'Global_Strategy_88', '🇲🇾', 68, 261840, 87);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m89', 'Ultra_Gold_89', '🇧🇷', 72, 34400, 101);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m90', 'Expert_Scalper_90', '🇻🇳', 88, 42570, 86);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m91', 'Master_Trader_91', '🇯🇵', 88, 313514, 1);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m92', 'Super_Quantum_92', '🇦🇪', 77, 282084, 24);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m93', 'Elite_Strategy_93', '🇸🇦', 89, 96874, 30);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m94', 'Ultra_Flow_94', '🇮🇳', 86, 409034, 79);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m95', 'Expert_Market_95', '🇯🇵', 95, 479072, 67);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m96', 'Alpha_King_96', '🇶🇦', 76, 80605, 119);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m97', 'Prime_Scalper_97', '🇸🇦', 78, 309244, 79);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m98', 'Master_Bull_98', '🇶🇦', 87, 287067, 70);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m99', 'Prime_Gold_99', '🇯🇵', 79, 41544, 111);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m100', 'Hyper_Forex_100', '🇷🇺', 68, 187389, 116);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m101', 'Nova_Flow_101', '🇯🇵', 73, 42786, 45);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m102', 'Hyper_Edge_102', '🇰🇼', 92, 367750, 53);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m103', 'Max_Trader_103', '🇳🇬', 69, 132486, 101);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m104', 'Smart_Gold_104', '🇦🇺', 92, 88494, 57);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m105', 'Smart_Market_105', '🇮🇩', 79, 310176, 16);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m106', 'Hyper_Gold_106', '🇻🇳', 69, 325920, 80);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m107', 'Pro_Wizard_107', '🇸🇬', 91, 236550, 15);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m108', 'Swift_Forex_108', '🇩🇪', 82, 120484, 49);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m109', 'Master_Profit_109', '🇵🇭', 88, 328012, 13);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m110', 'Hyper_Signals_110', '🇮🇩', 82, 308904, 80);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m111', 'Apex_Gold_111', '🇬🇧', 74, 298065, 20);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m112', 'Expert_Wizard_112', '🇦🇺', 66, 475300, 85);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m113', 'Super_Forex_113', '🇸🇬', 82, 411244, 9);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m114', 'Apex_Bull_114', '🇦🇺', 80, 476964, 99);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m115', 'Neo_Scalper_115', '🇶🇦', 90, 36425, 112);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m116', 'Master_Bull_116', '🇩🇪', 85, 69558, 116);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m117', 'Expert_Edge_117', '🇰🇷', 93, 28722, 19);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m118', 'Nova_Wizard_118', '🇦🇺', 74, 359540, 101);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m119', 'Super_Flow_119', '🇿🇦', 78, 409514, 49);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m120', 'Nova_Wealth_120', '🇧🇷', 94, 166173, 31);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m121', 'Swift_Quantum_121', '🇸🇬', 95, 331111, 71);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m122', 'Global_Edge_122', '🇳🇬', 76, 121917, 63);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m123', 'Pro_Trader_123', '🇻🇳', 90, 28464, 87);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m124', 'Apex_Market_124', '🇨🇦', 93, 280341, 110);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m125', 'Global_Scalper_125', '🇹🇷', 85, 89652, 17);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m126', 'Prime_Wizard_126', '🇺🇸', 74, 207133, 71);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m127', 'Elite_Market_127', '🇧🇩', 83, 307784, 75);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m128', 'Apex_Signals_128', '🇿🇦', 77, 327423, 32);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m129', 'Prime_Trader_129', '🇵🇭', 87, 292355, 4);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m130', 'Swift_Profit_130', '🇧🇩', 95, 65380, 75);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m131', 'Hyper_Market_131', '🇲🇾', 89, 477492, 102);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m132', 'Nova_Flow_132', '🇯🇵', 75, 489944, 117);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m133', 'Max_Flow_133', '🇸🇬', 95, 107422, 95);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m134', 'Master_Wealth_134', '🇬🇧', 73, 249988, 28);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m135', 'Master_Quantum_135', '🇨🇦', 68, 26732, 90);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m136', 'Apex_Forex_136', '🇰🇷', 76, 269755, 1);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m137', 'Neo_Wealth_137', '🇻🇳', 89, 65746, 57);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m138', 'Elite_Signals_138', '🇮🇩', 92, 175858, 117);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m139', 'Elite_Bull_139', '🇯🇵', 67, 464930, 117);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m140', 'Global_Market_140', '🇦🇺', 65, 204992, 9);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m141', 'Nova_Flow_141', '🇸🇦', 83, 408861, 34);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m142', 'Elite_Profit_142', '🇶🇦', 92, 227328, 103);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m143', 'Nova_Forex_143', '🇮🇩', 66, 251020, 5);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m144', 'Neo_Signals_144', '🇷🇺', 81, 294635, 85);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m145', 'Max_Flow_145', '🇩🇪', 77, 363289, 37);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m146', 'Prime_Signals_146', '🇲🇽', 90, 378549, 76);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m147', 'Neo_Flow_147', '🇮🇹', 84, 138291, 94);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m148', 'Apex_Strategy_148', '🇹🇷', 78, 30923, 36);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m149', 'Elite_Trader_149', '🇵🇭', 84, 131355, 92);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m150', 'Ultra_Wizard_150', '🇨🇦', 70, 149514, 23);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m_1788548722995', 'CRISHTTRADER', '🇻🇪', 88, 45000, 6);

--
-- Table structure for candles
--


--
-- Table structure for historical_candles
--

