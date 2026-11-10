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

export type CurrentSite = {
  /** null = vue cumulée « Tous les sites » (gérant uniquement). */
  id: string | null;
  nom: string;
  isAll: boolean;
};

export type SiteOption = {
  /** Identifiant du site ou `ALL_SITES_VALUE`. */
  id: string;
  nom: string;
};
