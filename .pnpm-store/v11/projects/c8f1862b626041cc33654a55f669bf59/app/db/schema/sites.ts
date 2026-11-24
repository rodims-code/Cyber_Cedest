import {
  pgTable,
  text,
  boolean,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const sites = pgTable("sites", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  nom: text("nom").notNull().unique(),
  actif: boolean("actif").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userSites = pgTable(
  "user_sites",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    siteId: text("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.siteId] })]
);
