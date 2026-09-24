CREATE TABLE "active_copies" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"master_id" text NOT NULL,
	"master_name" text,
	"max_trade_amount" numeric DEFAULT '10.00',
	"trades_limit" integer DEFAULT 0,
	"copied_trades" integer DEFAULT 0,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "master_traders" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" text,
	"win_rate" integer DEFAULT 0,
	"profit" numeric DEFAULT '0.00',
	"followers" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
