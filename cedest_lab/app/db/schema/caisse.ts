/**
 * Schéma métier — Caisse du jour.
 *
 * Une ligne par mouvement de caisse. Une ligne peut être annulée
 * (statut `annule` avec auteur, date et motif) : elle reste visible
 * mais n'entre plus dans les totaux.
 *
 * Règles :
 * - `montant` est un entier dans l'unité mineure (centimes pour USD,
 *   francs pour CDF), toujours strictement positif.
 * - `devise` est toujours explicite (`CDF` ou `USD`).
 * - La date métier est le jour de Kinshasa au moment de la saisie.
 * - `saisi_par` est toujours l'utilisateur connecté (jamais fourni par le client).
 * - Pas de suppression physique : annulation uniquement.
 */
import {
  check,
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { user } from "./auth";
import { sites } from "./sites";

export const caisseTypeEnum = pgEnum("caisse_type", [
  "recette",
  "depense",
  "fourniture",
]);

export const caisseStatutEnum = pgEnum("caisse_statut", ["valide", "annule"]);

export const caisse = pgTable(
  "caisse",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    siteId: text("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "restrict" }),
    date: date("date", { mode: "string" }).notNull(),
    type: caisseTypeEnum("type").notNull(),
    libelle: text("libelle").notNull(),
    montant: integer("montant").notNull(),
    devise: text("devise").notNull().default("CDF"),
    saisiPar: text("saisi_par")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    statut: caisseStatutEnum("statut").notNull().default("valide"),
    annulePar: text("annule_par").references(() => user.id, {
      onDelete: "set null",
    }),
    motifAnnulation: text("motif_annulation"),
    annuleAt: timestamp("annule_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "caisse_montant_positif",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sql`${table.montant} > 0`
    ),
  ]
);

export type CaisseEntry = typeof caisse.$inferSelect;
export type NewCaisseEntry = typeof caisse.$inferInsert;
