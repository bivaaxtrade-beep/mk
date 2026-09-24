--
-- PostgreSQL database dump
--

\restrict K77nq6FW2tBkLXitd5wGhihFRaborreskbio4jZYDNdOtQPEVVHAdKdB6YGQI9q

-- Dumped from database version 15.19 (Debian 15.19-0+deb12u1)
-- Dumped by pg_dump version 15.19 (Debian 15.19-0+deb12u1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: active_copies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.active_copies (
    id character varying(255) NOT NULL,
    user_id character varying(255) NOT NULL,
    master_id character varying(255) NOT NULL,
    master_name character varying(255),
    country character varying(100),
    amount numeric,
    max_trade_amount numeric DEFAULT 10,
    trades_limit integer,
    stop_loss numeric,
    take_profit numeric,
    current_profit numeric DEFAULT 0,
    win_rate numeric DEFAULT 0,
    copied_trades integer DEFAULT 0,
    status character varying(50) DEFAULT 'active'::character varying,
    started_at bigint
);


ALTER TABLE public.active_copies OWNER TO postgres;

--
-- Name: agent_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agent_profiles (
    user_id character varying(255) NOT NULL,
    name character varying(255),
    email character varying(255),
    role character varying(50) DEFAULT 'support_agent'::character varying,
    is_online integer DEFAULT 1,
    max_chats integer DEFAULT 5,
    active_chats_count integer DEFAULT 0,
    last_active_at bigint
);


ALTER TABLE public.agent_profiles OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id character varying(255) NOT NULL,
    type character varying(100) NOT NULL,
    amount numeric DEFAULT 0,
    old_balance numeric DEFAULT 0,
    new_balance numeric DEFAULT 0,
    reference_id character varying(255),
    details text,
    ip_address character varying(100),
    created_at bigint,
    action character varying(255),
    entity_type character varying(100),
    entity_id character varying(255)
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: candles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candles (
    id integer NOT NULL,
    pair character varying(100) NOT NULL,
    type character varying(50) NOT NULL,
    "time" bigint NOT NULL,
    open numeric NOT NULL,
    high numeric NOT NULL,
    low numeric NOT NULL,
    close numeric NOT NULL,
    volume numeric NOT NULL
);


ALTER TABLE public.candles OWNER TO postgres;

--
-- Name: candles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.candles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.candles_id_seq OWNER TO postgres;

--
-- Name: candles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.candles_id_seq OWNED BY public.candles.id;


--
-- Name: historical_candles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historical_candles (
    id integer NOT NULL,
    market character varying(100) NOT NULL,
    type character varying(50) NOT NULL,
    timeframe character varying(50) NOT NULL,
    open numeric NOT NULL,
    high numeric NOT NULL,
    low numeric NOT NULL,
    close numeric NOT NULL,
    volume numeric NOT NULL,
    "openTime" bigint NOT NULL,
    "closeTime" bigint NOT NULL
);


ALTER TABLE public.historical_candles OWNER TO postgres;

--
-- Name: historical_candles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historical_candles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.historical_candles_id_seq OWNER TO postgres;

--
-- Name: historical_candles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historical_candles_id_seq OWNED BY public.historical_candles.id;


--
-- Name: kyc_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kyc_requests (
    id integer NOT NULL,
    user_id character varying(255) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    full_name character varying(255),
    document_type character varying(100),
    document_number character varying(100),
    front_image text,
    back_image text,
    selfie_image text,
    rejection_reason text,
    updated_at bigint,
    created_at bigint
);


ALTER TABLE public.kyc_requests OWNER TO postgres;

--
-- Name: kyc_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.kyc_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.kyc_requests_id_seq OWNER TO postgres;

--
-- Name: kyc_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kyc_requests_id_seq OWNED BY public.kyc_requests.id;


--
-- Name: leaderboard_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leaderboard_stats (
    user_id character varying(255) NOT NULL,
    total_profit numeric DEFAULT 0,
    total_trades integer DEFAULT 0,
    won_trades integer DEFAULT 0,
    lost_trades integer DEFAULT 0,
    draw_trades integer DEFAULT 0,
    total_volume numeric DEFAULT 0,
    current_streak integer DEFAULT 0,
    max_streak integer DEFAULT 0,
    roi numeric DEFAULT 0,
    last_trade_at bigint
);


ALTER TABLE public.leaderboard_stats OWNER TO postgres;

--
-- Name: login_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_history (
    id integer NOT NULL,
    user_id character varying(255) NOT NULL,
    ip_address character varying(100),
    user_agent text,
    status character varying(50) DEFAULT 'success'::character varying,
    created_at bigint
);


ALTER TABLE public.login_history OWNER TO postgres;

--
-- Name: login_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.login_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.login_history_id_seq OWNER TO postgres;

--
-- Name: login_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.login_history_id_seq OWNED BY public.login_history.id;


--
-- Name: market_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.market_settings (
    pair character varying(100) NOT NULL,
    hidden integer DEFAULT 0,
    payout integer
);


ALTER TABLE public.market_settings OWNER TO postgres;

--
-- Name: master_traders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.master_traders (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    country character varying(100),
    win_rate numeric,
    profit numeric,
    followers integer
);


ALTER TABLE public.master_traders OWNER TO postgres;

--
-- Name: support_canned_responses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.support_canned_responses (
    id character varying(255) NOT NULL,
    shortcut character varying(100) NOT NULL,
    title character varying(255) NOT NULL,
    category character varying(100) DEFAULT 'General'::character varying,
    content text NOT NULL,
    created_by character varying(255),
    created_at bigint
);


ALTER TABLE public.support_canned_responses OWNER TO postgres;

--
-- Name: system_backups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_backups (
    id character varying(255) NOT NULL,
    "timestamp" bigint NOT NULL,
    filename character varying(255) NOT NULL,
    size bigint NOT NULL,
    status character varying(50) NOT NULL,
    tables_count integer NOT NULL,
    created_by character varying(255) NOT NULL
);


ALTER TABLE public.system_backups OWNER TO postgres;

--
-- Name: ticket_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_messages (
    id character varying(255) NOT NULL,
    ticket_id character varying(255) NOT NULL,
    user_id character varying(255) NOT NULL,
    sender_type character varying(50) DEFAULT 'user'::character varying,
    sender_name character varying(255),
    message text NOT NULL,
    attachments text,
    is_internal_note integer DEFAULT 0,
    is_read integer DEFAULT 0,
    is_admin integer DEFAULT 0,
    created_at bigint
);


ALTER TABLE public.ticket_messages OWNER TO postgres;

--
-- Name: tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets (
    id character varying(255) NOT NULL,
    user_id character varying(255) NOT NULL,
    user_name character varying(255),
    user_email character varying(255),
    subject character varying(255) NOT NULL,
    category character varying(100) DEFAULT 'General'::character varying,
    message text NOT NULL,
    last_message text,
    status character varying(50) DEFAULT 'open'::character varying,
    priority character varying(50) DEFAULT 'medium'::character varying,
    assigned_agent_id character varying(255),
    assigned_agent_name character varying(255),
    assigned_agent_email character varying(255),
    channel character varying(50) DEFAULT 'chat'::character varying,
    rating integer,
    rating_feedback text,
    is_ai_handled integer DEFAULT 1,
    closed_at bigint,
    first_response_at bigint,
    resolved_at bigint,
    updated_at bigint,
    created_at bigint
);


ALTER TABLE public.tickets OWNER TO postgres;

--
-- Name: tournament_participants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tournament_participants (
    tournament_id character varying(255) NOT NULL,
    user_id character varying(255) NOT NULL,
    score numeric DEFAULT 0,
    rank integer,
    joined_at bigint
);


ALTER TABLE public.tournament_participants OWNER TO postgres;

--
-- Name: tournament_prizes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tournament_prizes (
    id integer NOT NULL,
    tournament_id character varying(255) NOT NULL,
    rank_from integer NOT NULL,
    rank_to integer NOT NULL,
    prize_amount numeric NOT NULL,
    prize_type character varying(50) DEFAULT 'fixed'::character varying
);


ALTER TABLE public.tournament_prizes OWNER TO postgres;

--
-- Name: tournament_prizes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tournament_prizes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tournament_prizes_id_seq OWNER TO postgres;

--
-- Name: tournament_prizes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tournament_prizes_id_seq OWNED BY public.tournament_prizes.id;


--
-- Name: tournaments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tournaments (
    id character varying(255) NOT NULL,
    type character varying(100) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    banner_url text,
    prize_pool numeric DEFAULT 0,
    entry_fee numeric DEFAULT 0,
    min_players integer DEFAULT 1,
    max_players integer DEFAULT 0,
    start_time bigint NOT NULL,
    end_time bigint NOT NULL,
    status character varying(50) DEFAULT 'scheduled'::character varying,
    is_locked integer DEFAULT 0,
    requirements text,
    created_at bigint
);


ALTER TABLE public.tournaments OWNER TO postgres;

--
-- Name: trades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trades (
    id integer NOT NULL,
    firebase_id character varying(255),
    user_id character varying(255) NOT NULL,
    market_id character varying(255) NOT NULL,
    asset character varying(255),
    amount numeric NOT NULL,
    direction character varying(50) NOT NULL,
    type character varying(50),
    entry_price numeric NOT NULL,
    exit_price numeric,
    duration integer NOT NULL,
    time_left integer,
    expiry_time bigint NOT NULL,
    expiration_time character varying(255),
    is_demo integer DEFAULT 1,
    account_type character varying(50) DEFAULT 'demo'::character varying,
    tournament_id character varying(255),
    status character varying(50) DEFAULT 'open'::character varying,
    payout_amount numeric,
    payout character varying(100),
    settled_at bigint,
    updated_at bigint,
    created_at bigint
);


ALTER TABLE public.trades OWNER TO postgres;

--
-- Name: trades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.trades_id_seq OWNER TO postgres;

--
-- Name: trades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trades_id_seq OWNED BY public.trades.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    user_id character varying(255) NOT NULL,
    type character varying(100) NOT NULL,
    amount numeric NOT NULL,
    currency character varying(50) DEFAULT 'USD'::character varying,
    status character varying(50) DEFAULT 'pending'::character varying,
    method character varying(100) DEFAULT 'direct'::character varying,
    tx_hash text,
    details text,
    order_id character varying(255),
    updated_at bigint,
    created_at bigint
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transactions_id_seq OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    uid character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    display_name character varying(255),
    nickname character varying(255),
    photo_url text,
    password_hash text,
    real_balance numeric DEFAULT 0.00,
    demo_balance numeric DEFAULT 10000.00,
    currency character varying(50) DEFAULT 'USD'::character varying,
    tfa_enabled integer DEFAULT 0,
    tfa_mode character varying(50) DEFAULT 'app'::character varying,
    tfa_secret text,
    is_verified integer DEFAULT 0,
    is_email_verified integer DEFAULT 0,
    is_nid_verified integer DEFAULT 0,
    nid_number character varying(100),
    is_admin integer DEFAULT 0,
    phone character varying(50),
    country character varying(100),
    country_code character varying(20),
    first_name character varying(100),
    last_name character varying(100),
    gender character varying(20),
    dob character varying(50),
    status character varying(50) DEFAULT 'Standard'::character varying,
    kyc_status character varying(50) DEFAULT 'unverified'::character varying,
    referred_by_uid character varying(255),
    referral_code character varying(100),
    referral_sub_id character varying(100),
    referral_type character varying(100),
    affiliate_balance numeric DEFAULT 0.00,
    total_affiliate_earnings numeric DEFAULT 0.00,
    referral_count integer DEFAULT 0,
    custom_affiliate_share integer,
    withdrawal_otp character varying(100),
    withdrawal_otp_expires_at bigint,
    total_live_volume numeric DEFAULT 0.00,
    smart_mode_enabled integer DEFAULT 0,
    smart_mode_strategy character varying(100) DEFAULT 'auto_25_percent'::character varying,
    manipulation_mode character varying(100) DEFAULT 'neutral'::character varying,
    updated_at bigint,
    created_at bigint
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: candles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candles ALTER COLUMN id SET DEFAULT nextval('public.candles_id_seq'::regclass);


--
-- Name: historical_candles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historical_candles ALTER COLUMN id SET DEFAULT nextval('public.historical_candles_id_seq'::regclass);


--
-- Name: kyc_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kyc_requests ALTER COLUMN id SET DEFAULT nextval('public.kyc_requests_id_seq'::regclass);


--
-- Name: login_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_history ALTER COLUMN id SET DEFAULT nextval('public.login_history_id_seq'::regclass);


--
-- Name: tournament_prizes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tournament_prizes ALTER COLUMN id SET DEFAULT nextval('public.tournament_prizes_id_seq'::regclass);


--
-- Name: trades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trades ALTER COLUMN id SET DEFAULT nextval('public.trades_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: active_copies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.active_copies (id, user_id, master_id, master_name, country, amount, max_trade_amount, trades_limit, stop_loss, take_profit, current_profit, win_rate, copied_trades, status, started_at) FROM stdin;
\.


--
-- Data for Name: agent_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agent_profiles (user_id, name, email, role, is_online, max_chats, active_chats_count, last_active_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, type, amount, old_balance, new_balance, reference_id, details, ip_address, created_at, action, entity_type, entity_id) FROM stdin;
1	system_pre_boot	DATABASE_BACKUP	0	0	0	bk_1787244846877	Database backup created successfully: backup_2026-08-20T16-54-06-877Z_1787244846877.sql (0.03 MB). Type: pg_dump. Synced to secure off-site backup storage.	\N	1787244846877	\N	\N	\N
2	system_pre_boot	DATABASE_BACKUP	0	0	0	bk_1787244924489	Database backup created successfully: backup_2026-08-20T16-55-24-489Z_1787244924489.sql (0.03 MB). Type: pg_dump. Synced to secure off-site backup storage.	\N	1787244924489	\N	\N	\N
\.


--
-- Data for Name: candles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candles (id, pair, type, "time", open, high, low, close, volume) FROM stdin;
\.


--
-- Data for Name: historical_candles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historical_candles (id, market, type, timeframe, open, high, low, close, volume, "openTime", "closeTime") FROM stdin;
\.


--
-- Data for Name: kyc_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kyc_requests (id, user_id, status, full_name, document_type, document_number, front_image, back_image, selfie_image, rejection_reason, updated_at, created_at) FROM stdin;
\.


--
-- Data for Name: leaderboard_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leaderboard_stats (user_id, total_profit, total_trades, won_trades, lost_trades, draw_trades, total_volume, current_streak, max_streak, roi, last_trade_at) FROM stdin;
\.


--
-- Data for Name: login_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login_history (id, user_id, ip_address, user_agent, status, created_at) FROM stdin;
\.


--
-- Data for Name: market_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.market_settings (pair, hidden, payout) FROM stdin;
\.


--
-- Data for Name: master_traders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.master_traders (id, name, country, win_rate, profit, followers) FROM stdin;
m1	CRISHTTRADER	🇻🇪	88	45000	6
m2	OBOROTEN	🇺🇦	81	86000	13
m3	GEOVANNY	🇨🇴	74	12000	5
m4	ALEX FOREX	🇬🇧	92	125000	38
m5	BINANCE WHALE	🇸🇬	85	240000	71
m6	TRADEMINATOR	🇧🇩	89	155000	42
\.


--
-- Data for Name: support_canned_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.support_canned_responses (id, shortcut, title, category, content, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: system_backups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_backups (id, "timestamp", filename, size, status, tables_count, created_by) FROM stdin;
bk_1787244846877	1787244846877	backup_2026-08-20T16-54-06-877Z_1787244846877.sql	31631	success	20	system_pre_boot
bk_1787244924489	1787244924489	backup_2026-08-20T16-55-24-489Z_1787244924489.sql	33712	success	20	system_pre_boot
\.


--
-- Data for Name: ticket_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ticket_messages (id, ticket_id, user_id, sender_type, sender_name, message, attachments, is_internal_note, is_read, is_admin, created_at) FROM stdin;
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets (id, user_id, user_name, user_email, subject, category, message, last_message, status, priority, assigned_agent_id, assigned_agent_name, assigned_agent_email, channel, rating, rating_feedback, is_ai_handled, closed_at, first_response_at, resolved_at, updated_at, created_at) FROM stdin;
\.


--
-- Data for Name: tournament_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tournament_participants (tournament_id, user_id, score, rank, joined_at) FROM stdin;
\.


--
-- Data for Name: tournament_prizes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tournament_prizes (id, tournament_id, rank_from, rank_to, prize_amount, prize_type) FROM stdin;
1	t-daily-free	1	1	50	fixed
2	t-daily-free	2	2	20	fixed
3	t-daily-free	3	3	10	fixed
4	t-weekly-pro	1	1	2500	fixed
5	t-weekly-pro	2	2	1000	fixed
6	t-weekly-pro	3	3	500	fixed
7	t-prestige-elite	1	1	12500	fixed
8	t-prestige-elite	2	2	5000	fixed
9	t-prestige-elite	3	3	2500	fixed
\.


--
-- Data for Name: tournaments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tournaments (id, type, title, description, banner_url, prize_pool, entry_fee, min_players, max_players, start_time, end_time, status, is_locked, requirements, created_at) FROM stdin;
t-daily-free	Daily Free	Daily Freebie Blast	Join the daily free tournament and win real cash prizes! No entry fee required.	https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000	100	0	10	1000	1787248450016	1787331250016	scheduled	0	{"minBalance":0}	1787244850016
t-weekly-pro	Weekly	Weekly Pro Challenge	Compete with the best for a massive prize pool. Show your trading skills!	https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=1000	5000	10	50	5000	1787417650016	1788022450016	scheduled	1	{"minBalance":100,"kycRequired":true}	1787244850016
t-prestige-elite	Prestige	Elite Prestige Cup	The ultimate tournament for our VIP traders. High stakes, higher rewards.	https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1000	25000	100	10	100	1787849650016	1788454450016	scheduled	1	{"minBalance":1000,"statusRequired":"VIP"}	1787244850016
\.


--
-- Data for Name: trades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trades (id, firebase_id, user_id, market_id, asset, amount, direction, type, entry_price, exit_price, duration, time_left, expiry_time, expiration_time, is_demo, account_type, tournament_id, status, payout_amount, payout, settled_at, updated_at, created_at) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, user_id, type, amount, currency, status, method, tx_hash, details, order_id, updated_at, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, uid, email, display_name, nickname, photo_url, password_hash, real_balance, demo_balance, currency, tfa_enabled, tfa_mode, tfa_secret, is_verified, is_email_verified, is_nid_verified, nid_number, is_admin, phone, country, country_code, first_name, last_name, gender, dob, status, kyc_status, referred_by_uid, referral_code, referral_sub_id, referral_type, affiliate_balance, total_affiliate_earnings, referral_count, custom_affiliate_share, withdrawal_otp, withdrawal_otp_expires_at, total_live_volume, smart_mode_enabled, smart_mode_strategy, manipulation_mode, updated_at, created_at) FROM stdin;
1	admin_seed_1wv66l1a	hamproosapport@gmail.com	Bivaax Super Admin	Admin	\N	$2b$10$QgkAESV2y57nxK8yoTPF3OUttLjUQ9uFDadVCt.Ne4D2AXiwxMmB2	1000	10000	USD	0	app	\N	0	0	0	\N	1	\N	\N	\N	\N	\N	\N	\N	Standard	unverified	\N	3NQS8C	\N	\N	0.00	0.00	0	\N	\N	\N	0.00	0	auto_25_percent	neutral	\N	1787244849271
2	P0H1JYBZHJWlquOQ4yyfdjSy3Kc2	hasan1@gmail.com	hasan1	\N	\N	\N	0	10000	USD	0	app	\N	0	0	0	\N	1	\N	Bangladesh	BD	\N	\N	\N	\N	Standard	unverified			\N	\N	0	0	0	\N	\N	\N	0.00	0	auto_25_percent	neutral	\N	\N
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 2, true);


--
-- Name: candles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candles_id_seq', 1, false);


--
-- Name: historical_candles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historical_candles_id_seq', 1, false);


--
-- Name: kyc_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kyc_requests_id_seq', 1, false);


--
-- Name: login_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.login_history_id_seq', 1, false);


--
-- Name: tournament_prizes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tournament_prizes_id_seq', 9, true);


--
-- Name: trades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trades_id_seq', 1, false);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: active_copies active_copies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.active_copies
    ADD CONSTRAINT active_copies_pkey PRIMARY KEY (id);


--
-- Name: agent_profiles agent_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_profiles
    ADD CONSTRAINT agent_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: candles candles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candles
    ADD CONSTRAINT candles_pkey PRIMARY KEY (id);


--
-- Name: historical_candles historical_candles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historical_candles
    ADD CONSTRAINT historical_candles_pkey PRIMARY KEY (id);


--
-- Name: kyc_requests kyc_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kyc_requests
    ADD CONSTRAINT kyc_requests_pkey PRIMARY KEY (id);


--
-- Name: leaderboard_stats leaderboard_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaderboard_stats
    ADD CONSTRAINT leaderboard_stats_pkey PRIMARY KEY (user_id);


--
-- Name: login_history login_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_history
    ADD CONSTRAINT login_history_pkey PRIMARY KEY (id);


--
-- Name: market_settings market_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_settings
    ADD CONSTRAINT market_settings_pkey PRIMARY KEY (pair);


--
-- Name: master_traders master_traders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_traders
    ADD CONSTRAINT master_traders_pkey PRIMARY KEY (id);


--
-- Name: support_canned_responses support_canned_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_canned_responses
    ADD CONSTRAINT support_canned_responses_pkey PRIMARY KEY (id);


--
-- Name: support_canned_responses support_canned_responses_shortcut_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_canned_responses
    ADD CONSTRAINT support_canned_responses_shortcut_key UNIQUE (shortcut);


--
-- Name: system_backups system_backups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_backups
    ADD CONSTRAINT system_backups_pkey PRIMARY KEY (id);


--
-- Name: ticket_messages ticket_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: tournament_participants tournament_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tournament_participants
    ADD CONSTRAINT tournament_participants_pkey PRIMARY KEY (tournament_id, user_id);


--
-- Name: tournament_prizes tournament_prizes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tournament_prizes
    ADD CONSTRAINT tournament_prizes_pkey PRIMARY KEY (id);


--
-- Name: tournaments tournaments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tournaments
    ADD CONSTRAINT tournaments_pkey PRIMARY KEY (id);


--
-- Name: trades trades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_uid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_uid_key UNIQUE (uid);


--
-- Name: active_copies_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX active_copies_user_id_idx ON public.active_copies USING btree (user_id);


--
-- Name: audit_logs_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_user_id_idx ON public.audit_logs USING btree (user_id);


--
-- Name: login_history_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX login_history_user_id_idx ON public.login_history USING btree (user_id);


--
-- Name: pair_type_time_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX pair_type_time_idx ON public.candles USING btree (pair, type, "time");


--
-- Name: trades_settled_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX trades_settled_at_idx ON public.trades USING btree (settled_at);


--
-- Name: trades_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX trades_status_idx ON public.trades USING btree (status);


--
-- Name: trades_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX trades_user_id_idx ON public.trades USING btree (user_id);


--
-- Name: transactions_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transactions_user_id_idx ON public.transactions USING btree (user_id);


--
-- PostgreSQL database dump complete
--

\unrestrict K77nq6FW2tBkLXitd5wGhihFRaborreskbio4jZYDNdOtQPEVVHAdKdB6YGQI9q

