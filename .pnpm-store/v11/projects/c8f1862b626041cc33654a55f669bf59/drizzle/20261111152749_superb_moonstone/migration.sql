CREATE TYPE "notification_priorite" AS ENUM('normale', 'haute');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"titre" text NOT NULL,
	"corps" text NOT NULL,
	"href" text,
	"entite_type" text,
	"entite_id" text,
	"site_id" text,
	"priorite" "notification_priorite" DEFAULT 'normale'::"notification_priorite" NOT NULL,
	"lu_le" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "notifications_user_unread_idx" ON "notifications" ("user_id","lu_le","created_at");--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_site_id_sites_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE SET NULL;