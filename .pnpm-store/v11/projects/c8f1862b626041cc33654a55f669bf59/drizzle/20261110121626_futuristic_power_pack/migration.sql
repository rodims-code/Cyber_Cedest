CREATE TYPE "shift_fonction" AS ENUM('operateur', 'appui');--> statement-breakpoint
CREATE TABLE "shifts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "shifts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"date" date NOT NULL,
	"site_id" text NOT NULL,
	"user_id" text NOT NULL,
	"fonction" "shift_fonction" DEFAULT 'operateur'::"shift_fonction" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "shifts_date_user_unique" ON "shifts" ("date","user_id");--> statement-breakpoint
CREATE INDEX "shifts_date_site_idx" ON "shifts" ("date","site_id");--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_site_id_sites_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;