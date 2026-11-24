import { db } from "@/app/db";
import { sites, userSites } from "@/app/db/schema";
import { and, eq } from "drizzle-orm";
import type { Role } from "@/lib/permissions";

export type SiteItem = {
  id: string;
  nom: string;
  actif: boolean;
};

export type SiteWithUsage = SiteItem & {
  nbUtilisateurs: number;
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
 * Récupère tous les sites (actifs et inactifs) avec le nombre d'utilisateurs
 * qui leur sont assignés. Réservé à l'écran Paramètres du gérant.
 */
export async function getAllSitesWithUsage(): Promise<SiteWithUsage[]> {
  const [siteRows, assignments] = await Promise.all([
    db.select().from(sites).orderBy(sites.nom),
    db.select({ siteId: userSites.siteId }).from(userSites),
  ]);

  const counts = new Map<string, number>();
  for (const assignment of assignments) {
    counts.set(assignment.siteId, (counts.get(assignment.siteId) ?? 0) + 1);
  }

  return siteRows.map((site) => ({
    id: site.id,
    nom: site.nom,
    actif: site.actif,
    nbUtilisateurs: counts.get(site.id) ?? 0,
  }));
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
 *   dans `user_sites` ; aucun repli silencieux vers un autre site.
 *
 * Note : pour les non-gérants, le site actif du dashboard est dérivé du
 * planning du jour (voir `getCurrentSite()`), pas de cette liste.
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

  return activeSites.filter((site) => allowedIds.has(site.id));
}
