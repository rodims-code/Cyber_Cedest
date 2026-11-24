CREATE TYPE "whatsapp_bouton" AS ENUM('entete', 'flottant', 'carte-bureautique', 'carte-wifi', 'carte-solaire', 'carte-formation', 'autre');--> statement-breakpoint
CREATE TABLE "whatsapp_clicks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "whatsapp_clicks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"page" varchar(255) NOT NULL,
	"bouton" "whatsapp_bouton" NOT NULL,
	"ip_hash" varchar(64),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "numero" integer GENERATED ALWAYS AS IDENTITY (sequence name "leads_numero_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "source" varchar(50) DEFAULT 'formulaire' NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "ip_hash" varchar(64);--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
DROP TYPE "lead_status";--> statement-breakpoint
CREATE TYPE "lead_status" AS ENUM('nouveau', 'contacte', 'en_cours', 'termine', 'annule');--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "status" SET DATA TYPE "lead_status" USING "status"::"lead_status";--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'nouveau'::"lead_status";--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "lead_type";--> statement-breakpoint
CREATE TYPE "lead_type" AS ENUM('formation', 'wifi', 'solaire', 'contact');--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "type" SET DATA TYPE "lead_type" USING "type"::"lead_type";--> statement-breakpoint
CREATE INDEX "leads_type_status_created_idx" ON "leads" ("type","status","created_at");--> statement-breakpoint
CREATE INDEX "leads_telephone_idx" ON "leads" ("telephone");--> statement-breakpoint
CREATE INDEX "leads_ip_hash_created_idx" ON "leads" ("ip_hash","created_at");--> statement-breakpoint
CREATE INDEX "whatsapp_clicks_created_idx" ON "whatsapp_clicks" ("created_at");