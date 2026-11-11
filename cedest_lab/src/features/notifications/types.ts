/**
 * Types partagés du centre de notifications (client + serveur).
 * Ce module n'importe ni la base ni Next.js.
 */

export const NOTIFICATION_TYPES = [
  "demande_bureautique",
  "demande_wifi",
  "demande_formation",
  "pointage_validation",
  "pointage_rappel",
  "heures_corrigees",
  "planning_publie",
  "planning_non_prepare",
  "caisse_non_saisie",
  "test",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
export type NotificationTypeFilter = NotificationType | "all";

export type Priorite = "normale" | "haute";

export type NotificationItem = {
  id: number;
  type: NotificationType;
  typeLabel: string;
  titre: string;
  corps: string;
  href: string | null;
  priorite: Priorite;
  lu: boolean;
  siteId: string | null;
  siteNom: string | null;
  entiteType: string | null;
  entiteId: string | null;
  /** ISO 8601 UTC, à afficher en `Africa/Kinshasa`. */
  createdAtIso: string;
};

export type NotificationFeed = {
  items: NotificationItem[];
  unreadCount: number;
  /** Curseur à renvoyer à la prochaine interrogation. */
  cursor: string | null;
};

/** Libellés affichés (catalogue), utilisés pour les filtres. */
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  demande_bureautique: "Demande bureautique ou contact",
  demande_wifi: "Demande Wi-Fi ou solaire",
  demande_formation: "Demande de formation",
  pointage_validation: "Pointage à valider",
  pointage_rappel: "Rappel de pointage",
  heures_corrigees: "Heures corrigées ou validées",
  planning_publie: "Planning publié ou modifié",
  planning_non_prepare: "Planning non préparé",
  caisse_non_saisie: "Caisse non saisie",
  test: "Test",
};
