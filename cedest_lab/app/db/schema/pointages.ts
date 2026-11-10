/**
 * Schéma métier — Pointage.
 *
 * - `arrivee` / `depart` sont des timestamps UTC (heure serveur).
 * - `date` est le jour calendaire de Kinshasa (`YYYY-MM-DD`) au moment du
 *   pointage ; il sert aux requêtes « pointages du jour ».
 * - Un index partiel garantit qu'un employé ne peut avoir qu'un seul pointage
 *   ouvert (`depart IS NULL`) à la fois.
 * - Les champs de correction/validation sont prévus pour une étape ultérieure.
 */
import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { sites } from "./sites";

export const pointages = pgTable(
  "pointages",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    siteId: text("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "restrict" }),
    date: date("date", { mode: "string" }).notNull(),
    arrivee: timestamp("arrivee", { withTimezone: true }).notNull(),
    depart: timestamp("depart", { withTimezone: true }),

    // Correction et validation futures.
    corrigePar: text("corrige_par").references(() => user.id, {
      onDelete: "set null",
    }),
    corrigeLe: timestamp("corrige_le", { withTimezone: true }),
    motifCorrection: text("motif_correction"),
    validePar: text("valide_par").references(() => user.id, {
      onDelete: "set null",
    }),
    valideLe: timestamp("valide_le", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("pointages_user_open_unique")
      .on(table.userId)
      .where(sql`${table.depart} IS NULL`),
    index("pointages_date_site_idx").on(table.date, table.siteId),
    index("pointages_user_date_idx").on(table.userId, table.date),
    check(
      "pointages_depart_apres_arrivee",
      sql`${table.depart} IS NULL OR ${table.depart} >= ${table.arrivee}`
    ),
  ]
);

export type Pointage = typeof pointages.$inferSelect;
export type NewPointage = typeof pointages.$inferInsert;
