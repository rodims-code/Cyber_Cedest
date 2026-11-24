/**
 * Schéma métier — Leads & Notes & WhatsApp Clicks
 *
 * lead_type  : formation | wifi | solaire | contact
 * lead_status: nouveau | contacte | en_cours | termine | annule
 */
import {
  index,
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
  "contact",
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "nouveau",
  "contacte",
  "en_cours",
  "termine",
  "annule",
]);

export const whatsappBoutonEnum = pgEnum("whatsapp_bouton", [
  "entete",
  "flottant",
  "carte-bureautique",
  "carte-wifi",
  "carte-solaire",
  "carte-formation",
  "autre",
]);

// ---------------------------------------------------------------------------
// leads
// ---------------------------------------------------------------------------
export const leads = pgTable(
  "leads",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    numero: integer("numero").generatedAlwaysAsIdentity(),

    // Classification
    type: leadTypeEnum("type").notNull(),
    status: leadStatusEnum("status").default("nouveau").notNull(),
    source: varchar("source", { length: 50 }).default("formulaire").notNull(),

    // Informations du prospect
    nom: varchar("nom", { length: 255 }).notNull(),
    telephone: varchar("telephone", { length: 30 }).notNull(),
    email: varchar("email", { length: 255 }),
    site: varchar("site", { length: 100 }), // Identifiant du site Cedest

    // Détails libres en JSON (ex: modules souhaités, puissance solaire…)
    details: jsonb("details"),

    // Anti-spam & empreinte réseau
    ipHash: varchar("ip_hash", { length: 64 }),

    // Affectation
    assigneA: text("assigne_a").references(() => user.id, {
      onDelete: "set null",
    }),

    // Horodatage
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("leads_type_status_created_idx").on(
      table.type,
      table.status,
      table.createdAt
    ),
    index("leads_telephone_idx").on(table.telephone),
    index("leads_ip_hash_created_idx").on(table.ipHash, table.createdAt),
  ]
);

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

// ---------------------------------------------------------------------------
// whatsapp_clicks
// ---------------------------------------------------------------------------
export const whatsappClicks = pgTable(
  "whatsapp_clicks",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    page: varchar("page", { length: 255 }).notNull(),
    bouton: whatsappBoutonEnum("bouton").notNull(),
    ipHash: varchar("ip_hash", { length: 64 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("whatsapp_clicks_created_idx").on(table.createdAt),
  ]
);
