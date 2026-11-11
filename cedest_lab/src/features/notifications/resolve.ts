/**
 * Résolution des destinataires d'une notification.
 *
 * - gérant : tous les gérants actifs (tous les sites) ;
 * - opérateur / technicien : les actifs de son rôle, restreints à ses sites
 *   quand l'événement concerne un site précis ;
 * - `self` : uniquement l'auteur (notification de test) ;
 * - l'auteur d'une action n'est jamais notifié par cette action.
 */
import { and, eq, inArray, isNull, or, sql } from "drizzle-orm";

import { db } from "@/app/db";
import { sites, user, userSites } from "@/app/db/schema";
import type { Role } from "@/lib/permissions";
import type { RecipientRule } from "./catalog";

export type ResolvedSite = { id: string; nom: string };

/** Résout une référence de site (id exact, ou nom insensible à la casse). */
export async function resolveSite(
  siteRef: string | null | undefined
): Promise<ResolvedSite | null> {
  const ref = siteRef?.trim();
  if (!ref) return null;

  const byId = await db
    .select({ id: sites.id, nom: sites.nom })
    .from(sites)
    .where(eq(sites.id, ref))
    .limit(1);

  if (byId[0]) return byId[0];

  const byName = await db
    .select({ id: sites.id, nom: sites.nom })
    .from(sites)
    .where(sql`lower(${sites.nom}) = lower(${ref})`)
    .limit(1);

  return byName[0] ?? null;
}

async function getActiveUserIdsByRole(role: Role): Promise<string[]> {
  const rows = await db
    .select({ id: user.id })
    .from(user)
    .where(
      and(
        eq(user.role, role),
        or(eq(user.banned, false), isNull(user.banned))
      )
    );

  return rows.map((row) => row.id);
}

/**
 * Ids des utilisateurs d'un rôle actifs, restreints à `siteId` si fourni.
 * Sans site précis, tout le rôle reçoit la notification.
 */
async function getScopedUserIdsByRole(
  role: Role,
  siteId: string | null
): Promise<string[]> {
  const userIds = await getActiveUserIdsByRole(role);
  if (!siteId || userIds.length === 0) return userIds;

  const assignments = await db
    .select({ userId: userSites.userId })
    .from(userSites)
    .where(
      and(eq(userSites.siteId, siteId), inArray(userSites.userId, userIds))
    );

  const allowed = new Set(assignments.map((row) => row.userId));
  return userIds.filter((id) => allowed.has(id));
}

export async function resolveRecipients(
  rule: RecipientRule,
  siteId: string | null,
  actorId: string | null
): Promise<{ id: string; role: Role | null }[]> {
  let recipients: { id: string; role: Role | null }[] = [];

  switch (rule) {
    case "gerant":
      recipients = (await getActiveUserIdsByRole("gerant")).map((id) => ({
        id,
        role: "gerant",
      }));
      break;
    case "gerant_operateur":
      recipients = [
        ...(await getActiveUserIdsByRole("gerant")).map((id) => ({
          id,
          role: "gerant" as const,
        })),
        ...(await getScopedUserIdsByRole("operateur", siteId)).map((id) => ({
          id,
          role: "operateur" as const,
        })),
      ];
      break;
    case "gerant_technicien":
      recipients = [
        ...(await getActiveUserIdsByRole("gerant")).map((id) => ({
          id,
          role: "gerant" as const,
        })),
        ...(await getScopedUserIdsByRole("technicien", siteId)).map((id) => ({
          id,
          role: "technicien" as const,
        })),
      ];
      break;
    case "operateur_technicien":
      recipients = [
        ...(await getScopedUserIdsByRole("operateur", siteId)).map((id) => ({
          id,
          role: "operateur" as const,
        })),
        ...(await getScopedUserIdsByRole("technicien", siteId)).map((id) => ({
          id,
          role: "technicien" as const,
        })),
      ];
      break;
    case "self":
      recipients = actorId ? [{ id: actorId, role: null }] : [];
      break;
  }

  // L'auteur d'une action ne reçoit pas la notification qu'il a déclenchée.
  // Exception : la règle `self` (notification de test) vise précisément l'auteur.
  if (!actorId || rule === "self") return recipients;

  return recipients.filter((recipient) => recipient.id !== actorId);
}
