/**
 * Schéma métier — Notifications.
 *
 * `notifications` stocke une ligne par destinataire : chaque personne reçoit
 * sa propre copie, ce qui simplifie la lecture, la suppression et les
 * permissions (un utilisateur ne voit jamais les lignes d'un autre).
 *
 * Règles :
 * - `created_at` / `lu_le` sont des timestamps UTC (timestamptz) ;
 * - `type` est un texte libre validé par `NOTIFICATION_CATALOG` ;
 * - `site_id` est nullable (notification globale ou site inconnu) et passe à
 *   NULL si le site est désactivé/supprimé ;
 * - les lues de plus de 30 jours pourront être purgées plus tard : pas de
 *   tâche planifiée ici, seul l'index sert la future purge.
 */
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "../../../app/db/schema/auth";
import { sites } from "../../../app/db/schema/sites";

export const notificationPrioriteEnum = pgEnum("notification_priorite", [
  "normale",
  "haute",
]);

export const notifications = pgTable(
  "notifications",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    titre: text("titre").notNull(),
    corps: text("corps").notNull(),
    href: text("href"),
    entiteType: text("entite_type"),
    entiteId: text("entite_id"),
    siteId: text("site_id").references(() => sites.id, {
      onDelete: "set null",
    }),
    priorite: notificationPrioriteEnum("priorite")
      .notNull()
      .default("normale"),
    luLe: timestamp("lu_le", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("notifications_user_unread_idx").on(
      table.userId,
      table.luLe,
      table.createdAt
    ),
  ]
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
