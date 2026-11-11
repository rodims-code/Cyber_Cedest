/**
 * Resolver pur de site actif.
 *
 * Ce module ne dépend ni de Next.js ni de la base de données : la fonction
 * `resolveCurrentSite` reçoit toutes ses entrées et est intégralement testable.
 *
 * Règle métier (source de vérité : `getCurrentSite()`) :
 * - gérant : le cookie `site` est respecté s'il correspond à un site actif
 *   autorisé, sinon « Tous les sites » ;
 * - autre rôle : le cookie est totalement ignoré ; le site est le site actif
 *   du poste d'aujourd'hui (planning, date de Kinshasa) ;
 * - autre rôle sans poste aujourd'hui : `{ id: null, reason: "aucun_poste" }` ;
 * - autre rôle dont le site du poste est inactif/inconnu : null +
 *   `site_indisponible`.
 */
import type { Role } from "@/lib/permissions";
import {
  ALL_SITES_LABEL,
  ALL_SITES_VALUE,
  NO_POST_LABEL,
  type CurrentSite,
} from "@/lib/site-constants";

export type ShiftSite = {
  siteId: string;
  siteNom: string;
  /** Site actif en base au moment de la requête. */
  siteActif: boolean;
};

export type ResolveInput = {
  role: Role | null;
  rawSiteCookie: string | undefined;
  /** Sites actifs autorisés pour l'utilisateur (gérant = tous les actifs). */
  userSites: { id: string; nom: string; actif: boolean }[];
  /** Poste d'aujourd'hui du non-gérant, ou null. */
  todayShift: ShiftSite | null;
};

export const NONE_CURRENT_SITE: CurrentSite = {
  id: null,
  nom: NO_POST_LABEL,
  isAll: false,
  reason: "aucun_poste",
};

/**
 * Résolution pure. Aucune lecture de cookie ni requête SQL.
 */
export function resolveCurrentSite(input: ResolveInput): CurrentSite {
  const { role, rawSiteCookie, userSites, todayShift } = input;

  // Gérant : cookie d'abord (validé), sinon vue cumulée.
  if (role === "gerant") {
    if (rawSiteCookie === ALL_SITES_VALUE || !rawSiteCookie) {
      return { id: null, nom: ALL_SITES_LABEL, isAll: true };
    }

    const matched = userSites.find(
      (site) => site.id === rawSiteCookie && site.actif
    );

    if (matched) {
      return { id: matched.id, nom: matched.nom, isAll: false };
    }

    // Cookie invalide ou site désactivé : on retombe sur la vue cumulée.
    return { id: null, nom: ALL_SITES_LABEL, isAll: true };
  }

  // Autre rôle : le cookie est ignoré. Le poste d'aujourd'hui impose le site.
  if (todayShift) {
    if (!todayShift.siteActif) {
      return {
        id: null,
        nom: NO_POST_LABEL,
        isAll: false,
        reason: "site_indisponible",
      };
    }

    return { id: todayShift.siteId, nom: todayShift.siteNom, isAll: false };
  }

  return { ...NONE_CURRENT_SITE };
}
