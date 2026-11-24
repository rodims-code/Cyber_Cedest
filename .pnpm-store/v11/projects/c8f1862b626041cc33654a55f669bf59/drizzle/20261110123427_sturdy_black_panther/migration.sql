CREATE TABLE "pointages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pointages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"site_id" text NOT NULL,
	"date" date NOT NULL,
	"arrivee" timestamp with time zone NOT NULL,
	"depart" timestamp with time zone,
	"corrige_par" text,
	"corrige_le" timestamp with time zone,
	"motif_correction" text,
	"valide_par" text,
	"valide_le" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pointages_depart_apres_arrivee" CHECK ("depart" IS NULL OR "depart" >= "arrivee")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "pointages_user_open_unique" ON "pointages" ("user_id") WHERE "depart" IS NULL;--> statement-breakpoint
CREATE INDEX "pointages_date_site_idx" ON "pointages" ("date","site_id");--> statement-breakpoint
CREATE INDEX "pointages_user_date_idx" ON "pointages" ("user_id","date");--> statement-breakpoint
ALTER TABLE "pointages" ADD CONSTRAINT "pointages_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "pointages" ADD CONSTRAINT "pointages_site_id_sites_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "pointages" ADD CONSTRAINT "pointages_corrige_par_user_id_fkey" FOREIGN KEY ("corrige_par") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "pointages" ADD CONSTRAINT "pointages_valide_par_user_id_fkey" FOREIGN KEY ("valide_par") REFERENCES "user"("id") ON DELETE SET NULL;