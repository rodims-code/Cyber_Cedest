/**
 * Schéma métier — Planning hebdomadaire.
 *
 * `shifts` représente un poste planifié pour un employé, un jour et un site.
 * Les dates sont des jours calendaires de Kinshasa au format `YYYY-MM-DD`.
 */
import {
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { sites } from "./sites";

export const shiftFonctionEnum = pgEnum("shift_fonction", [
  "operateur",
  "appui",
]);

export const shifts = pgTable(
  "shifts",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    date: date("date", { mode: "string" }).notNull(),
    siteId: text("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "restrict" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    fonction: shiftFonctionEnum("fonction").notNull().default("operateur"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    // Un employé ne peut avoir qu'un seul poste par jour.
    uniqueIndex("shifts_date_user_unique").on(table.date, table.userId),
    index("shifts_date_site_idx").on(table.date, table.siteId),
  ]
);

export type Shift = typeof shifts.$inferSelect;
export type NewShift = typeof shifts.$inferInsert;
