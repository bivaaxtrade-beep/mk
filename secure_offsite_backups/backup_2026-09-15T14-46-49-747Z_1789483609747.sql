-- Bivaax Trade Enterprise Backup (Logical Fallback)
-- Generated at: 2026-09-15T14:46:49.747Z
-- Requested by: admin_test_run
-- Database type: SQLite


--
-- Table structure & data for app_settings
--

INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('auto_market_config', '{"enabled":false,"lossRate":80,"winRate":20,"maxConcurrentTrades":10,"realOnly":true}', 1789483394272, 1789483394272);
INSERT OR IGNORE INTO "app_settings" ("key", "value", "updated_at", "created_at") VALUES ('announcementBanner', '{"enabled":true,"version":1789483393803,"title":"Join Our Official Telegram Channel! 🚀","description":"Get the latest updates, news, and exclusive offers — all in one place!","imageUrl":"https://i.postimg.cc/FHYff3bQ/59ccd73e-cacb-477b-956a-045a348ff838.png","buttonText":"Join Now","buttonUrl":"https://t.me/Bivaax_Official","actionType":"external_link","allowClose":true,"theme":"blue"}', 1789483395279, 1789483395279);

--
-- Table structure & data for users
--

INSERT OR IGNORE INTO "users" ("id", "uid", "email", "display_name", "nickname", "photo_url", "password_hash", "real_balance", "demo_balance", "currency", "tfa_enabled", "tfa_mode", "tfa_secret", "is_verified", "is_email_verified", "is_nid_verified", "nid_number", "is_admin", "phone", "country", "country_code", "first_name", "last_name", "gender", "dob", "birth_day", "birth_month", "birth_year", "time_zone", "language", "newsletter", "allow_notifications", "status", "kyc_status", "referred_by_uid", "referral_code", "referral_sub_id", "referral_type", "affiliate_balance", "total_affiliate_earnings", "referral_count", "custom_affiliate_share", "withdrawal_otp", "withdrawal_otp_expires_at", "total_live_volume", "updated_at", "created_at", "total_deposits", "smart_mode_enabled", "smart_mode_strategy", "manipulation_mode", "bx_coins", "risk_free_trades", "password") VALUES (1, 'admin_seed_vhlgcfwd', 'hamproosapport@gmail.com', 'Bivaax Super Admin', 'Admin', NULL, '$2b$10$nvYIJ26q1Bhn/Q30CrhOD.AOjOcMjrcrD3YKPciaBVf199NAv2yma', 1000, 10000, 'USD', 0, 'app', NULL, 0, 0, 0, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 'Standard', 'unverified', NULL, 'I7EK3R', NULL, NULL, 0, 0, 0, NULL, NULL, NULL, 0, NULL, 1789483388675, 0, 0, 'auto_25_percent', 'neutral', 0, 0, NULL);
INSERT OR IGNORE INTO "users" ("id", "uid", "email", "display_name", "nickname", "photo_url", "password_hash", "real_balance", "demo_balance", "currency", "tfa_enabled", "tfa_mode", "tfa_secret", "is_verified", "is_email_verified", "is_nid_verified", "nid_number", "is_admin", "phone", "country", "country_code", "first_name", "last_name", "gender", "dob", "birth_day", "birth_month", "birth_year", "time_zone", "language", "newsletter", "allow_notifications", "status", "kyc_status", "referred_by_uid", "referral_code", "referral_sub_id", "referral_type", "affiliate_balance", "total_affiliate_earnings", "referral_count", "custom_affiliate_share", "withdrawal_otp", "withdrawal_otp_expires_at", "total_live_volume", "updated_at", "created_at", "total_deposits", "smart_mode_enabled", "smart_mode_strategy", "manipulation_mode", "bx_coins", "risk_free_trades", "password") VALUES (2, 'P0H1JYBZHJWlquOQ4yyfdjSy3Kc2', 'hasan1@gmail.com', 'hasan1', NULL, NULL, NULL, 0, 10000, 'USD', 0, 'app', NULL, 0, 0, 0, NULL, 1, NULL, 'Bangladesh', 'BD', NULL, NULL, '---', '{"day":"---","month":"---","year":"---"}', '---', '---', '---', 'UTC', 'en', 1, 1, 'Standard', 'unverified', NULL, '', NULL, NULL, 0, 0, 0, NULL, NULL, NULL, 0, NULL, NULL, 0, 0, 'auto_25_percent', 'neutral', 0, 0, NULL);

--
-- Table structure & data for tournaments
--

INSERT OR IGNORE INTO "tournaments" ("id", "type", "title", "description", "banner_url", "prize_pool", "entry_fee", "min_players", "max_players", "start_time", "end_time", "status", "is_locked", "requirements", "created_at") VALUES ('t-daily-free', 'Daily Free', 'Daily Freebie Blast', 'Join the daily free tournament and win real cash prizes! No entry fee required.', 'https://i.postimg.cc/X7V2GwM7/file-0000000098bc8207bad85a8ea8279dc3.png', 100, 0, 10, 1000, 1789476189258, 1789562589258, 'active', 0, '{"minBalance":0}', 1789483389258);
INSERT OR IGNORE INTO "tournaments" ("id", "type", "title", "description", "banner_url", "prize_pool", "entry_fee", "min_players", "max_players", "start_time", "end_time", "status", "is_locked", "requirements", "created_at") VALUES ('t-weekly-pro', 'Weekly', 'Weekly Pro Challenge', 'Compete with the best for a massive prize pool. Show your trading skills!', 'https://i.postimg.cc/Cx5mJSLm/file-000000006d208208a8989dc8d13c649f.png', 5000, 10, 50, 5000, 1789396989258, 1790001789258, 'active', 1, '{"minBalance":100,"kycRequired":true}', 1789483389258);
INSERT OR IGNORE INTO "tournaments" ("id", "type", "title", "description", "banner_url", "prize_pool", "entry_fee", "min_players", "max_players", "start_time", "end_time", "status", "is_locked", "requirements", "created_at") VALUES ('t-prestige-elite', 'Prestige', 'Elite Prestige Cup', 'The ultimate tournament for our VIP traders. High stakes, higher rewards.', 'https://i.postimg.cc/fb05nCdy/file-000000004db08211a55c9e853e4af6fd.png', 25000, 100, 10, 100, 1790088189258, 1790692989258, 'scheduled', 1, '{"minBalance":1000,"statusRequired":"VIP"}', 1789483389258);

--
-- Table structure & data for tournament_participants
--


--
-- Table structure & data for tournament_prizes
--

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
-- Table structure & data for leaderboard_stats
--


--
-- Table structure & data for trades
--


--
-- Table structure & data for transactions
--


--
-- Table structure & data for audit_logs
--

INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (1, 'system_pre_boot', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1789483388482', NULL, NULL, 'Database backup created successfully: backup_2026-09-15T14-43-08-482Z_1789483388482.sql (0.00 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1789483388482);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (2, 'test_admin', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1789483518125', NULL, NULL, 'Database backup created successfully: backup_2026-09-15T14-45-18-125Z_1789483518125.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1789483518125);
INSERT OR IGNORE INTO "audit_logs" ("id", "user_id", "action", "type", "amount", "old_balance", "new_balance", "reference_id", "entity_type", "entity_id", "details", "ip_address", "created_at") VALUES (3, 'test_admin', NULL, 'DATABASE_BACKUP', 0, 0, 0, 'bk_1789483541461', NULL, NULL, 'Database backup created successfully: backup_2026-09-15T14-45-41-461Z_1789483541461.sql (0.03 MB). Type: logical_dumper. Synced to secure off-site backup storage.', NULL, 1789483541461);

--
-- Table structure & data for system_backups
--

INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1789483388482', 1789483388482, 'backup_2026-09-15T14-43-08-482Z_1789483388482.sql', 1058, 'success', 21, 'system_pre_boot');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1789483518125', 1789483518125, 'backup_2026-09-15T14-45-18-125Z_1789483518125.sql', 33003, 'success', 21, 'test_admin');
INSERT OR IGNORE INTO "system_backups" ("id", "timestamp", "filename", "size", "status", "tables_count", "created_by") VALUES ('bk_1789483541461', 1789483541461, 'backup_2026-09-15T14-45-41-461Z_1789483541461.sql', 33728, 'success', 21, 'test_admin');

--
-- Table structure & data for login_history
--


--
-- Table structure & data for kyc_requests
--


--
-- Table structure & data for tickets
--


--
-- Table structure & data for ticket_messages
--


--
-- Table structure & data for support_canned_responses
--


--
-- Table structure & data for agent_profiles
--


--
-- Table structure & data for active_copies
--


--
-- Table structure & data for master_traders
--

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
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m31', 'Nova_Bull_31', '🇳🇬', 80, 224999, 109);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m32', 'Apex_Flow_32', '🇲🇽', 82, 422745, 116);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m33', 'Swift_Forex_33', '🇷🇺', 75, 117483, 75);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m34', 'Max_Flow_34', '🇮🇹', 81, 213718, 87);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m35', 'Global_Market_35', '🇰🇼', 73, 183654, 65);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m36', 'Smart_Signals_36', '🇩🇪', 85, 456536, 94);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m37', 'Master_Bull_37', '🇷🇺', 80, 145606, 66);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m38', 'Super_Flow_38', '🇯🇵', 90, 177305, 98);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m39', 'Nova_Wealth_39', '🇮🇹', 81, 44697, 70);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m40', 'Hyper_Wizard_40', '🇲🇽', 77, 398649, 109);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m41', 'Alpha_King_41', '🇻🇳', 74, 60796, 60);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m42', 'Elite_Trader_42', '🇩🇪', 79, 344266, 57);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m43', 'Hyper_Signals_43', '🇸🇬', 96, 492037, 55);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m44', 'Super_Flow_44', '🇫🇷', 71, 368614, 47);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m45', 'Super_Profit_45', '🇮🇳', 73, 96552, 116);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m46', 'Neo_Gold_46', '🇶🇦', 75, 308069, 87);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m47', 'Global_Signals_47', '🇲🇾', 94, 89298, 29);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m48', 'Alpha_Signals_48', '🇦🇪', 83, 468423, 14);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m49', 'Super_Gold_49', '🇲🇽', 65, 291053, 114);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m50', 'Alpha_King_50', '🇸🇦', 83, 472700, 106);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m51', 'Super_Wizard_51', '🇧🇷', 70, 75054, 117);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m52', 'Global_Trader_52', '🇰🇼', 83, 254548, 69);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m53', 'Expert_Wealth_53', '🇷🇺', 81, 496627, 43);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m54', 'Alpha_Wizard_54', '🇯🇵', 94, 414656, 109);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m55', 'Master_Forex_55', '🇰🇼', 69, 345811, 68);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m56', 'Neo_Wealth_56', '🇯🇵', 79, 272737, 110);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m57', 'Apex_Gold_57', '🇯🇵', 71, 72677, 31);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m58', 'Swift_Wealth_58', '🇰🇷', 84, 121505, 75);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m59', 'Max_Signals_59', '🇮🇩', 89, 347452, 75);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m60', 'Pro_Market_60', '🇿🇦', 95, 300761, 70);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m61', 'Pro_Strategy_61', '🇩🇪', 77, 416962, 4);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m62', 'Prime_Scalper_62', '🇲🇽', 89, 150145, 57);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m63', 'Hyper_Bull_63', '🇧🇷', 93, 361177, 114);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m64', 'Hyper_Market_64', '🇻🇳', 88, 194302, 22);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m65', 'Expert_Gold_65', '🇨🇦', 74, 351668, 97);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m66', 'Swift_Quantum_66', '🇰🇼', 92, 229076, 62);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m67', 'Hyper_Quantum_67', '🇻🇳', 76, 260513, 112);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m68', 'Expert_Quantum_68', '🇿🇦', 71, 150917, 93);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m69', 'Global_Wealth_69', '🇰🇼', 81, 409102, 27);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m70', 'Swift_Wizard_70', '🇳🇬', 77, 335754, 86);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m71', 'Pro_Forex_71', '🇯🇵', 79, 95849, 19);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m72', 'Pro_Scalper_72', '🇹🇷', 92, 173045, 12);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m73', 'Elite_Strategy_73', '🇮🇹', 72, 462735, 82);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m74', 'Super_Trader_74', '🇮🇩', 75, 501959, 85);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m75', 'Max_Profit_75', '🇬🇧', 69, 439521, 87);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m76', 'Prime_Quantum_76', '🇸🇬', 89, 116935, 29);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m77', 'Prime_Strategy_77', '🇰🇷', 79, 394003, 59);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m78', 'Apex_Gold_78', '🇳🇬', 78, 447886, 57);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m79', 'Max_King_79', '🇮🇩', 88, 178282, 38);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m80', 'Neo_King_80', '🇮🇩', 84, 444789, 26);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m81', 'Neo_Market_81', '🇹🇷', 69, 499451, 19);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m82', 'Hyper_Wealth_82', '🇳🇬', 73, 226766, 34);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m83', 'Swift_Trader_83', '🇧🇷', 85, 177136, 39);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m84', 'Global_Strategy_84', '🇶🇦', 74, 314114, 71);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m85', 'Master_Market_85', '🇿🇦', 89, 297129, 71);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m86', 'Smart_Market_86', '🇦🇪', 67, 125602, 24);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m87', 'Neo_Forex_87', '🇰🇼', 87, 404279, 99);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m88', 'Swift_Edge_88', '🇹🇷', 74, 224324, 33);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m89', 'Expert_Edge_89', '🇻🇳', 78, 143906, 40);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m90', 'Max_Gold_90', '🇷🇺', 81, 331606, 108);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m91', 'Prime_Trader_91', '🇦🇪', 66, 443007, 53);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m92', 'Max_Profit_92', '🇸🇦', 67, 124115, 1);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m93', 'Pro_Edge_93', '🇺🇸', 68, 391255, 59);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m94', 'Expert_Signals_94', '🇦🇪', 82, 153845, 107);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m95', 'Hyper_Scalper_95', '🇹🇷', 85, 128162, 55);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m96', 'Elite_Edge_96', '🇪🇸', 69, 55990, 94);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m97', 'Hyper_Wizard_97', '🇻🇳', 91, 259978, 43);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m98', 'Expert_Market_98', '🇶🇦', 76, 294603, 58);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m99', 'Elite_Scalper_99', '🇲🇾', 81, 188720, 119);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m100', 'Hyper_Market_100', '🇵🇭', 74, 80478, 33);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m101', 'Ultra_King_101', '🇩🇪', 84, 159027, 84);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m102', 'Global_Market_102', '🇹🇷', 67, 470397, 9);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m103', 'Elite_King_103', '🇲🇽', 84, 209817, 42);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m104', 'Swift_Scalper_104', '🇯🇵', 90, 91963, 17);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m105', 'Global_Gold_105', '🇮🇹', 71, 450691, 56);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m106', 'Max_Wealth_106', '🇰🇼', 73, 238382, 16);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m107', 'Ultra_Wizard_107', '🇷🇺', 79, 477102, 32);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m108', 'Neo_Bull_108', '🇷🇺', 79, 227008, 74);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m109', 'Pro_Edge_109', '🇦🇪', 93, 396705, 32);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m110', 'Neo_Bull_110', '🇸🇬', 95, 256754, 37);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m111', 'Hyper_Gold_111', '🇨🇦', 69, 327853, 77);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m112', 'Apex_King_112', '🇦🇪', 69, 452125, 85);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m113', 'Super_Wealth_113', '🇧🇩', 87, 47038, 109);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m114', 'Expert_Forex_114', '🇮🇹', 93, 403433, 11);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m115', 'Max_Gold_115', '🇿🇦', 72, 243093, 64);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m116', 'Super_Market_116', '🇩🇪', 74, 507821, 86);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m117', 'Pro_Edge_117', '🇬🇧', 87, 207226, 49);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m118', 'Nova_Wealth_118', '🇸🇦', 85, 472679, 84);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m119', 'Elite_Scalper_119', '🇳🇬', 83, 484009, 76);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m120', 'Elite_Market_120', '🇻🇳', 86, 440299, 13);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m121', 'Hyper_Gold_121', '🇹🇷', 66, 441949, 36);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m122', 'Neo_Profit_122', '🇵🇭', 85, 435798, 102);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m123', 'Alpha_King_123', '🇸🇬', 72, 159586, 5);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m124', 'Apex_King_124', '🇶🇦', 67, 59045, 34);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m125', 'Pro_Market_125', '🇳🇬', 69, 182278, 115);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m126', 'Neo_Strategy_126', '🇳🇬', 84, 322380, 100);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m127', 'Global_Forex_127', '🇧🇷', 76, 251205, 0);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m128', 'Pro_Flow_128', '🇰🇷', 76, 174588, 95);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m129', 'Hyper_Scalper_129', '🇯🇵', 81, 171280, 23);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m130', 'Global_Bull_130', '🇸🇬', 69, 28095, 62);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m131', 'Apex_Profit_131', '🇹🇷', 76, 264996, 70);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m132', 'Ultra_Strategy_132', '🇪🇸', 85, 281470, 1);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m133', 'Elite_Gold_133', '🇸🇦', 91, 336120, 81);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m134', 'Swift_Scalper_134', '🇹🇷', 94, 354846, 99);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m135', 'Super_Forex_135', '🇫🇷', 89, 128796, 95);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m136', 'Smart_Forex_136', '🇧🇩', 91, 179902, 89);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m137', 'Apex_Flow_137', '🇨🇦', 82, 289339, 6);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m138', 'Nova_Forex_138', '🇿🇦', 73, 180911, 110);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m139', 'Neo_Strategy_139', '🇫🇷', 80, 105426, 69);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m140', 'Pro_Market_140', '🇩🇪', 70, 34721, 8);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m141', 'Expert_Wizard_141', '🇳🇬', 88, 293568, 43);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m142', 'Nova_Quantum_142', '🇮🇩', 91, 363839, 9);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m143', 'Elite_Flow_143', '🇧🇷', 68, 337460, 82);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m144', 'Alpha_Wizard_144', '🇲🇽', 71, 270227, 19);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m145', 'Swift_Scalper_145', '🇲🇾', 88, 401261, 87);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m146', 'Alpha_Bull_146', '🇦🇺', 88, 499154, 6);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m147', 'Ultra_Wizard_147', '🇩🇪', 87, 488867, 0);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m148', 'Neo_Strategy_148', '🇰🇷', 87, 291522, 118);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m149', 'Nova_Flow_149', '🇩🇪', 85, 479584, 30);
INSERT OR IGNORE INTO "master_traders" ("id", "name", "country", "win_rate", "profit", "followers") VALUES ('m150', 'Master_Strategy_150', '🇿🇦', 86, 190676, 72);
