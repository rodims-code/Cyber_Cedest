import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { isRole, type Role } from "@/lib/permissions";
import { getSitesForUser, type SiteItem } from "@/features/sites/queries";
import {
  ALL_SITES_LABEL,
  ALL_SITES_VALUE,
  NO_SITE_LABEL,
  SITE_COOKIE_NAME,
  type CurrentSite,
  type SiteOption,
} from "@/lib/site-constants";

export { ALL_SITES_LABEL, ALL_SITES_VALUE, SITE_COOKIE_NAME };
export type { CurrentSite, SiteOption };

function noSite(): CurrentSite {
  return { id: null, nom: NO_SITE_LABEL, isAll: false };
}

/**
 * Résout le site actif à partir du cookie et de la liste des sites autorisés.
 * Fonction pure : aucune lecture de cookie, ce qui la rend facile à tester.
 */
function resolveCurrentSite(
  userSites: SiteItem[],
  role: Role,
  rawSiteCookie: string | undefined
): CurrentSite {
  // Le gérant peut choisir un site précis ou la vue cumulée.
  if (role === "gerant") {
    if (!rawSiteCookie || rawSiteCookie === ALL_SITES_VALUE) {
      return { id: null, nom: ALL_SITES_LABEL, isAll: true };
    }

    const matchedSite = userSites.find(
      (site) => site.id === rawSiteCookie && site.actif
    );

    if (matchedSite) {
      return { id: matchedSite.id, nom: matchedSite.nom, isAll: false };
    }

    // Cookie invalide : on retombe sur la vue cumulée, jamais sur un site inconnu.
    return { id: null, nom: ALL_SITES_LABEL, isAll: true };
  }

  // Opérateur / technicien : jamais de vue cumulée, uniquement un site autorisé.
  if (rawSiteCookie && rawSiteCookie !== ALL_SITES_VALUE) {
    const matchedSite = userSites.find(
      (site) => site.id === rawSiteCookie && site.actif
    );

    if (matchedSite) {
      return { id: matchedSite.id, nom: matchedSite.nom, isAll: false };
    }
  }

  const defaultSite = userSites[0];
  if (defaultSite) {
    return { id: defaultSite.id, nom: defaultSite.nom, isAll: false };
  }

  return noSite();
}

/**
 * Récupère le site actif actuel en vérifiant rigoureusement les droits côté serveur.
 *
 * - Cookie absent, falsifié, site inactif ou non autorisé → site par défaut.
 * - Un opérateur / technicien ne peut jamais obtenir « Tous les sites ».
 * - Un utilisateur non authentifié n'obtient aucun site.
 */
export async function getCurrentSite(): Promise<CurrentSite> {
  const session = await getSession();
  if (!session?.user) {
    return noSite();
  }

  const role = isRole(session.user.role) ? session.user.role : null;
  if (!role) {
    return noSite();
  }

  const userSites = await getSitesForUser(session.user.id, role);
  const cookieStore = await cookies();
  const rawSiteCookie = cookieStore.get(SITE_COOKIE_NAME)?.value?.trim();

  return resolveCurrentSite(userSites, role, rawSiteCookie);
}

/**
 * Récupère les options de sites sélectionnables pour l'utilisateur connecté.
 * La vue « Tous les sites » n'est ajoutée que pour le gérant.
 */
export async function getSelectableSites(): Promise<{
  sites: SiteOption[];
  currentSite: CurrentSite;
  canSelectAll: boolean;
  role: Role | null;
}> {
  const session = await getSession();
  if (!session?.user) {
    return {
      sites: [],
      currentSite: noSite(),
      canSelectAll: false,
      role: null,
    };
  }

  const role = isRole(session.user.role) ? session.user.role : null;
  if (!role) {
    return {
      sites: [],
      currentSite: noSite(),
      canSelectAll: false,
      role: null,
    };
  }

  const userSites = await getSitesForUser(session.user.id, role);
  const cookieStore = await cookies();
  const rawSiteCookie = cookieStore.get(SITE_COOKIE_NAME)?.value?.trim();
  const currentSite = resolveCurrentSite(userSites, role, rawSiteCookie);
  const canSelectAll = role === "gerant";

  const siteOptions: SiteOption[] = canSelectAll
    ? [{ id: ALL_SITES_VALUE, nom: ALL_SITES_LABEL }]
    : [];

  for (const site of userSites) {
    siteOptions.push({ id: site.id, nom: site.nom });
  }

  return { sites: siteOptions, currentSite, canSelectAll, role };
}
