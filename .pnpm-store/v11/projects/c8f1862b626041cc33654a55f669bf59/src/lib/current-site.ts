/**
 * Site actif — point d'entrée unique (`getCurrentSite()`).
 *
 * Règle métier :
 * - gérant : le cookie `site` est respecté s'il vise un site actif autorisé,
 *   sinon « Tous les sites » ;
 * - autre rôle (opérateur, technicien, appui) : le cookie est ignoré,
 *   le site est celui de son poste d'aujourd'hui (date de Kinshasa) ;
 * - autre rôle sans poste aujourd'hui : aucun site (« Aucun poste aujourd'hui »),
 *   jamais un repli silencieux vers un autre site.
 *
 * La partie pure de la résolution vit dans `current-site-resolve.ts` (testable).
 * Ce module est serveur-only : Next.js headers/Drizzle ne doivent pas être
 * importés depuis un composant client.
 */
import { cookies } from "next/headers";

import { getSession } from "@/lib/session";
import { isRole, type Role } from "@/lib/permissions";
import { getSitesForUser } from "@/features/sites/queries";
import { getTodayShiftSite } from "@/features/planning/queries";
import {
  ALL_SITES_LABEL,
  ALL_SITES_VALUE,
  NO_POST_LABEL,
  SITE_COOKIE_NAME,
  type CurrentSite,
  type SiteOption,
} from "@/lib/site-constants";
import { getKinshasaDateIso } from "@/lib/time";
import {
  NONE_CURRENT_SITE,
  resolveCurrentSite,
  type ResolveInput,
  type ShiftSite,
} from "./current-site-resolve";

export { ALL_SITES_LABEL, ALL_SITES_VALUE, SITE_COOKIE_NAME };
export type { CurrentSite, SiteOption, ResolveInput, ShiftSite };
export { resolveCurrentSite, NONE_CURRENT_SITE };

const NO_ACCESS_SITE: CurrentSite = {
  id: null,
  nom: NO_POST_LABEL,
  isAll: false,
  reason: "no_access",
};

export async function getCurrentSite(): Promise<CurrentSite> {
  const session = await getSession();
  if (!session?.user) {
    return NO_ACCESS_SITE;
  }

  const role = isRole(session.user.role) ? session.user.role : null;
  if (!role) {
    return NO_ACCESS_SITE;
  }

  const todayIso = getKinshasaDateIso();

  const [userSites, todayShift] = await Promise.all([
    role === "gerant" ? getSitesForUser(session.user.id, role) : [],
    role === "gerant"
      ? Promise.resolve<ShiftSite | null>(null)
      : getTodayShiftSite(session.user.id, todayIso),
  ]);

  const cookieStore = await cookies();
  const rawSiteCookie = cookieStore.get(SITE_COOKIE_NAME)?.value?.trim();

  return resolveCurrentSite({
    role,
    rawSiteCookie,
    userSites,
    todayShift,
  });
}

/**
 * Options de la sidebar : choix libre pour le gérant (vue cumulée incluse),
 * aucune pour les autres rôles (bloc d'information en lecture seule).
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
      currentSite: NO_ACCESS_SITE,
      canSelectAll: false,
      role: null,
    };
  }

  const role = isRole(session.user.role) ? session.user.role : null;
  if (!role) {
    return {
      sites: [],
      currentSite: NO_ACCESS_SITE,
      canSelectAll: false,
      role: null,
    };
  }

  const todayIso = getKinshasaDateIso();

  const [userSites, todayShift] = await Promise.all([
    role === "gerant" ? getSitesForUser(session.user.id, role) : [],
    role === "gerant"
      ? Promise.resolve<ShiftSite | null>(null)
      : getTodayShiftSite(session.user.id, todayIso),
  ]);

  const cookieStore = await cookies();
  const rawSiteCookie = cookieStore.get(SITE_COOKIE_NAME)?.value?.trim();

  const currentSite = resolveCurrentSite({
    role,
    rawSiteCookie,
    userSites,
    todayShift,
  });
  const canSelectAll = role === "gerant";

  const siteOptions: SiteOption[] = canSelectAll
    ? [{ id: ALL_SITES_VALUE, nom: ALL_SITES_LABEL }]
    : [];

  for (const site of userSites) {
    siteOptions.push({ id: site.id, nom: site.nom });
  }

  return {
    sites: siteOptions,
    currentSite,
    canSelectAll,
    role,
  };
}
