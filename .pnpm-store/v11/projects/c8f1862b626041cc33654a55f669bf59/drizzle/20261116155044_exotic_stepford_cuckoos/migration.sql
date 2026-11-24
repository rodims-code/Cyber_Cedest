CREATE TYPE "caisse_statut" AS ENUM('valide', 'annule');--> statement-breakpoint
CREATE TYPE "caisse_type" AS ENUM('recette', 'depense', 'fourniture');--> statement-breakpoint
CREATE TABLE "caisse" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "caisse_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"site_id" text NOT NULL,
	"date" date NOT NULL,
	"type" "caisse_type" NOT NULL,
	"libelle" text NOT NULL,
	"montant" integer NOT NULL,
	"devise" text DEFAULT 'CDF' NOT NULL,
	"saisi_par" text NOT NULL,
	"statut" "caisse_statut" DEFAULT 'valide'::"caisse_statut" NOT NULL,
	"annule_par" text,
	"motif_annulation" text,
	"annule_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "caisse_montant_positif" CHECK ("montant" > 0)
);
--> statement-breakpoint
ALTER TABLE "caisse" ADD CONSTRAINT "caisse_site_id_sites_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "caisse" ADD CONSTRAINT "caisse_saisi_par_user_id_fkey" FOREIGN KEY ("saisi_par") REFERENCES "user"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "caisse" ADD CONSTRAINT "caisse_annule_par_user_id_fkey" FOREIGN KEY ("annule_par") REFERENCES "user"("id") ON DELETE SET NULL;