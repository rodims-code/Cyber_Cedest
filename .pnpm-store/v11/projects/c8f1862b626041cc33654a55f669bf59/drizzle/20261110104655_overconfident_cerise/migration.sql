CREATE TABLE "sites" (
	"id" text PRIMARY KEY,
	"nom" text NOT NULL UNIQUE,
	"actif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sites" (
	"user_id" text,
	"site_id" text,
	CONSTRAINT "user_sites_pkey" PRIMARY KEY("user_id","site_id")
);
--> statement-breakpoint
ALTER TABLE "user_sites" ADD CONSTRAINT "user_sites_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_sites" ADD CONSTRAINT "user_sites_site_id_sites_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE;