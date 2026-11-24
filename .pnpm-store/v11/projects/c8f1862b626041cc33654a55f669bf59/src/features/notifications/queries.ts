/**
 * Requêtes du centre de notifications.
 *
 * Chaque requête est strictement limitée aux lignes de l'utilisateur courant
 * (`user_id = userId`) : c'est la seule barrière contre la lecture des
 * notifications d'un autre.
 */
import {
  and,
  count,
  desc,
  eq,
  gt,
  isNull,
  lt,
  or,
} from "drizzle-orm";

import { db } from "@/app/db";
import { notifications, sites } from "@/app/db/schema";
import {
  NOTIFICATION_TYPE_LABELS,
  type NotificationFeed,
  type NotificationItem,
  type NotificationType,
  type NotificationTypeFilter,
  type Priorite,
} from "./types";

type Tab = "all" | "unread";

function toItem(row: {
  id: number;
  type: string;
  titre: string;
  corps: string;
  href: string | null;
  priorite: string;
  luLe: Date | null;
  siteId: string | null;
  entiteType: string | null;
  entiteId: string | null;
  createdAt: Date;
  siteNom: string | null;
}): NotificationItem {
  const type = row.type as NotificationType;

  return {
    id: row.id,
    type,
    typeLabel: NOTIFICATION_TYPE_LABELS[type] ?? row.type,
    titre: row.titre,
    corps: row.corps,
    href: row.href,
    priorite: row.priorite as Priorite,
    lu: row.luLe !== null,
    siteId: row.siteId,
    siteNom: row.siteNom,
    entiteType: row.entiteType,
    entiteId: row.entiteId,
    createdAtIso: row.createdAt.toISOString(),
  };
}

const itemColumns = {
  id: notifications.id,
  type: notifications.type,
  titre: notifications.titre,
  corps: notifications.corps,
  href: notifications.href,
  priorite: notifications.priorite,
  luLe: notifications.luLe,
  siteId: notifications.siteId,
  entiteType: notifications.entiteType,
  entiteId: notifications.entiteId,
  createdAt: notifications.createdAt,
  siteNom: sites.nom,
};

function makeCursor(row: { createdAt: Date; id: number }): string {
  return `${row.createdAt.toISOString()}~${row.id}`;
}

function parseCursor(cursor: string): { date: Date; id: number } | null {
  const separator = cursor.lastIndexOf("~");
  if (separator <= 0) return null;

  const date = new Date(cursor.slice(0, separator));
  const id = Number(cursor.slice(separator + 1));

  if (Number.isNaN(date.getTime()) || !Number.isInteger(id)) return null;
  return { date, id };
}

export async function listNotifications(
  userId: string,
  options: {
    tab: Tab;
    type: NotificationTypeFilter;
    cursor: string | null;
    limit: number;
  }
): Promise<{ items: NotificationItem[]; nextCursor: string | null }> {
  const { tab, type, cursor, limit } = options;

  const conditions = [eq(notifications.userId, userId)];

  if (tab === "unread") {
    conditions.push(isNull(notifications.luLe));
  }
  if (type !== "all") {
    conditions.push(eq(notifications.type, type));
  }

  const parsedCursor = cursor ? parseCursor(cursor) : null;
  if (cursor && !parsedCursor) {
    return { items: [], nextCursor: null };
  }
  if (parsedCursor) {
    conditions.push(
      or(
        lt(notifications.createdAt, parsedCursor.date),
        and(
          eq(notifications.createdAt, parsedCursor.date),
          lt(notifications.id, parsedCursor.id)
        )
      )!
    );
  }

  const rows = await db
    .select(itemColumns)
    .from(notifications)
    .leftJoin(sites, eq(notifications.siteId, sites.id))
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt), desc(notifications.id))
    .limit(limit + 1);

  const page = rows.slice(0, limit);
  const hasMore = rows.length > limit;

  return {
    items: page.map(toItem),
    nextCursor:
      hasMore && page.length > 0 ? makeCursor(page[page.length - 1]) : null,
  };
}

export async function getUnreadCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), isNull(notifications.luLe))
    );

  return row?.value ?? 0;
}

/**
 * Flux pour le polling : nouveautés depuis `since` (curseur client) et
 * nombre total de non lues. Sans curseur (première interrogation de la
 * session), aucune ligne de nouveauté n'est renvoyée — le client ne doit
 * afficher de toast que pour les arrivées postérieures.
 *
 * Le curseur est l'id de la dernière notification connue (atomique,
 * indépendant de la précision horloge de Postgres) : `created_at` en µs
 * n'étant pas comparable à un Date JS tronqué à la ms, un curseur temporel
 * renverrait toujours les mêmes lignes. Un curseur hérité non numérique
 * est traité comme un état initial.
 */
export async function getNotificationFeed(
  userId: string,
  since: string | null
): Promise<NotificationFeed> {
  const unreadCount = await getUnreadCount(userId);

  const sinceId =
    since && /^\d+$/.test(since.trim()) ? Number(since.trim()) : null;

  if (since === null || since === "" || sinceId === null) {
    const [maxRow] = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.id))
      .limit(1);

    return {
      items: [],
      unreadCount,
      cursor: String(maxRow?.id ?? 0),
    };
  }

  const rows = await db
    .select(itemColumns)
    .from(notifications)
    .leftJoin(sites, eq(notifications.siteId, sites.id))
    .where(and(eq(notifications.userId, userId), gt(notifications.id, sinceId)))
    .orderBy(notifications.id)
    .limit(50);

  const items = rows.map(toItem);

  return {
    items,
    unreadCount,
    cursor:
      items.length > 0 ? String(items[items.length - 1].id) : String(sinceId),
  };
}

export async function getNotificationById(
  userId: string,
  id: number
): Promise<NotificationItem | null> {
  const [row] = await db
    .select(itemColumns)
    .from(notifications)
    .leftJoin(sites, eq(notifications.siteId, sites.id))
    .where(and(eq(notifications.userId, userId), eq(notifications.id, id)))
    .limit(1);

  return row ? toItem(row) : null;
}

/** Marque comme lue ; retourne true si l'état a changé. */
export async function markNotificationRead(
  userId: string,
  id: number
): Promise<boolean> {
  const updated = await db
    .update(notifications)
    .set({ luLe: new Date() })
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.id, id),
        isNull(notifications.luLe)
      )
    )
    .returning({ id: notifications.id });

  return updated.length > 0;
}

export async function markAllNotificationsRead(
  userId: string
): Promise<number> {
  const updated = await db
    .update(notifications)
    .set({ luLe: new Date() })
    .where(
      and(eq(notifications.userId, userId), isNull(notifications.luLe))
    )
    .returning({ id: notifications.id });

  return updated.length;
}

export async function deleteNotification(
  userId: string,
  id: number
): Promise<boolean> {
  const deleted = await db
    .delete(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.id, id)))
    .returning({ id: notifications.id });

  return deleted.length > 0;
}
