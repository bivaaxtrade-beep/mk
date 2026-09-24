CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"details" text,
	"ip_address" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "candles" (
	"id" serial PRIMARY KEY NOT NULL,
	"pair" text NOT NULL,
	"type" text NOT NULL,
	"time" bigint NOT NULL,
	"open" numeric NOT NULL,
	"high" numeric NOT NULL,
	"low" numeric NOT NULL,
	"close" numeric NOT NULL,
	"volume" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kyc_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'pending',
	"full_name" text,
	"document_type" text,
	"document_number" text,
	"front_image" text,
	"back_image" text,
	"selfie_image" text,
	"rejection_reason" text,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "login_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"status" text DEFAULT 'success',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ticket_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"user_id" text NOT NULL,
	"message" text NOT NULL,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"last_message" text,
	"status" text DEFAULT 'open',
	"priority" text DEFAULT 'medium',
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" serial PRIMARY KEY NOT NULL,
	"firebase_id" text,
	"user_id" text NOT NULL,
	"market_id" text NOT NULL,
	"asset" text,
	"amount" numeric NOT NULL,
	"direction" text NOT NULL,
	"type" text,
	"entry_price" numeric NOT NULL,
	"exit_price" numeric,
	"duration" integer NOT NULL,
	"time_left" integer,
	"expiry_time" bigint NOT NULL,
	"expiration_time" text,
	"is_demo" boolean DEFAULT true,
	"account_type" text DEFAULT 'demo',
	"tournament_id" text,
	"status" text DEFAULT 'open',
	"payout_amount" numeric,
	"payout" text,
	"settled_at" timestamp,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"amount" numeric NOT NULL,
	"currency" text DEFAULT 'USD',
	"status" text DEFAULT 'pending',
	"method" text DEFAULT 'direct',
	"tx_hash" text,
	"details" text,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"nickname" text,
	"photo_url" text,
	"password_hash" text,
	"real_balance" numeric DEFAULT '0.00',
	"demo_balance" numeric DEFAULT '10000.00',
	"currency" text DEFAULT 'USD',
	"tfa_enabled" boolean DEFAULT false,
	"tfa_mode" text DEFAULT 'app',
	"tfa_secret" text,
	"is_verified" boolean DEFAULT false,
	"is_email_verified" boolean DEFAULT false,
	"is_nid_verified" boolean DEFAULT false,
	"nid_number" text,
	"is_admin" boolean DEFAULT false,
	"phone" text,
	"country" text,
	"first_name" text,
	"last_name" text,
	"gender" text,
	"dob" text,
	"birth_day" text,
	"birth_month" text,
	"birth_year" text,
	"time_zone" text,
	"language" text,
	"newsletter" boolean DEFAULT true,
	"allow_notifications" boolean DEFAULT true,
	"status" text DEFAULT 'Standard',
	"kyc_status" text DEFAULT 'unverified',
	"referred_by_uid" text,
	"referral_code" text,
	"referral_sub_id" text,
	"referral_type" text,
	"affiliate_balance" numeric DEFAULT '0.00',
	"total_affiliate_earnings" numeric DEFAULT '0.00',
	"referral_count" integer DEFAULT 0,
	"custom_affiliate_share" integer,
	"withdrawal_otp" text,
	"withdrawal_otp_expires_at" bigint,
	"total_live_volume" numeric DEFAULT '0.00',
	"manipulation_mode" text DEFAULT 'neutral',
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "pair_type_time_idx" ON "candles" USING btree ("pair","type","time");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "trades" USING btree ("user_id");