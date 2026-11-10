import { db } from "@/app/db";
import { sites, userSites } from "@/app/db/schema";
import { and, eq } from "drizzle-orm";
import type { Role } from "@/lib/permissions";

export type SiteItem = {
  id: string;
  nom: string;
  actif: boolean;
};

/**
 * Récupère tous les sites actifs enregistrés en base, triés par nom.
 */
export async function getAllActiveSites(): Promise<SiteItem[]> {
  return db
    .select({
      id: sites.id,
      nom: sites.nom,
      actif: sites.actif,
    })
    .from(sites)
    .where(eq(sites.actif, true))
    .orderBy(sites.nom);
}

/**
 * Récupère un site actif par son identifiant.
 * Retourne null si le site n'existe pas ou s'il est désactivé.
 */
export async function getActiveSiteById(
  siteId: string
): Promise<SiteItem | null> {
  const rows = await db
    .select({
      id: sites.id,
      nom: sites.nom,
      actif: sites.actif,
    })
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.actif, true)))
    .limit(1);

  return rows[0] ?? null;
}

/**
 * Récupère les sites autorisés pour un utilisateur donné selon son rôle.
 * - Le gérant a accès à tous les sites actifs.
 * - L'opérateur et le technicien n'ont accès qu'aux sites qui leur sont assignés
 *   dans user_sites.
 *
 * Repli de démarrage : tant qu'aucune interface d'attribution n'existe, un
 * utilisateur sans assignation obtient le premier site actif (KIMIALA). Ce repli
 * ne lui donne jamais accès à un autre site et ne contourne donc pas le cookie.
 */
export async function getSitesForUser(
  userId: string,
  role: Role
): Promise<SiteItem[]> {
  const activeSites = await getAllActiveSites();

  if (role === "gerant") {
    return activeSites;
  }

  const assignments = await db
    .select({ siteId: userSites.siteId })
    .from(userSites)
    .where(eq(userSites.userId, userId));

  const allowedIds = new Set(assignments.map((assignment) => assignment.siteId));
  const userAllowedSites = activeSites.filter((site) => allowedIds.has(site.id));

  if (userAllowedSites.length === 0 && activeSites.length > 0) {
    return [activeSites[0]];
  }

  return userAllowedSites;
}
