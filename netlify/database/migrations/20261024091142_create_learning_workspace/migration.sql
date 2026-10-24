CREATE TABLE "friendships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"sender" text NOT NULL,
	"recipient" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY,
	"username" text NOT NULL UNIQUE,
	"preferences" jsonb DEFAULT '{}' NOT NULL,
	"privacy" text DEFAULT 'private' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"data" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage" (
	"user_id" text NOT NULL,
	"minute" text NOT NULL,
	"count" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "friend_pair" ON "friendships" ("sender","recipient");--> statement-breakpoint
CREATE INDEX "records_owner_kind" ON "learning_records" ("user_id","kind");--> statement-breakpoint
CREATE UNIQUE INDEX "usage_user_minute" ON "ai_usage" ("user_id","minute");--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_sender_profiles_id_fkey" FOREIGN KEY ("sender") REFERENCES "profiles"("id");--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_recipient_profiles_id_fkey" FOREIGN KEY ("recipient") REFERENCES "profiles"("id");--> statement-breakpoint
ALTER TABLE "learning_records" ADD CONSTRAINT "learning_records_user_id_profiles_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE;