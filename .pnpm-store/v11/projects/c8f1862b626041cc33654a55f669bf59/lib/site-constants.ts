/**
 * Constantes et types partagés entre le serveur et le client.
 *
 * Ce fichier ne doit importer aucune API serveur (`next/headers`, Drizzle, etc.)
 * afin de pouvoir être utilisé dans les composants clients (TeamSwitcher).
 */

export const SITE_COOKIE_NAME = "site";
export const ALL_SITES_VALUE = "ALL";
export const ALL_SITES_LABEL = "Tous les sites";
export const NO_SITE_LABEL = "Aucun site";
export const NO_POST_LABEL = "Aucun poste aujourd'hui";

export type CurrentSite = {
  /**
   * null = « Tous les sites » (gérant uniquement), ou aucun poste
   * pour les autres rôles. Voir `reason`.
   */
  id: string | null;
  /** Nom du site courant, ou libellé d'absence. */
  nom: string;
  isAll: boolean;
  /**
   * Renseignée quand aucun site n'est actif :
   * - `aucun_poste` : aucun poste planifié aujourd'hui ;
   * - `site_indisponible` : le site du poste est inactif/inconnu.
   */
  reason?: "aucun_poste" | "site_indisponible" | "no_access";
};

export type SiteOption = {
  /** Identifiant du site ou `ALL_SITES_VALUE`. */
  id: string;
  nom: string;
};
