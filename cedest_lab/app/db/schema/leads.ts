/**
 * Schéma métier — Leads & Notes
 *
 * lead_type  : type de service demandé
 * lead_status: cycle de vie d'un lead
 */
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const leadTypeEnum = pgEnum("lead_type", [
  "formation",
  "wifi",
  "solaire",
  "bureautique",
  "autre",
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "nouveau",
  "en_cours",
  "converti",
  "annule",
]);

// ---------------------------------------------------------------------------
// leads
// ---------------------------------------------------------------------------
export const leads = pgTable("leads", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  // Classification
  type: leadTypeEnum("type").notNull(),
  status: leadStatusEnum("status").default("nouveau").notNull(),

  // Informations du prospect
  nom: varchar("nom", { length: 255 }).notNull(),
  telephone: varchar("telephone", { length: 30 }).notNull(),
  email: varchar("email", { length: 255 }),
  site: varchar("site", { length: 100 }), // Identifiant du site Cedest

  // Détails libres en JSON (ex: modules souhaités, puissance solaire…)
  details: jsonb("details"),

  // Affectation
  assigneA: text("assigne_a").references(() => user.id, {
    onDelete: "set null",
  }),

  // Horodatage
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// lead_notes
// ---------------------------------------------------------------------------
export const leadNotes = pgTable("lead_notes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  leadId: integer("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  auteurId: text("auteur_id").references(() => user.id, {
    onDelete: "set null",
  }),
  contenu: text("contenu").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
