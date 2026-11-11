/**
 * Catalogue des événements de notification.
 *
 * Pour chaque type, décrit : libellé, priorité, destinataires et les textes
 * français de titre/corps. La matrice README est la seule source de vérité :
 * personne ne reçoit une notification sur un domaine auquel il n'a pas accès.
 *
 * Ce module n'importe ni la base ni Next.js : le routage (rôles, sites) se
 * fait dans `resolve.ts` / `notify.ts`.
 */
import type { Role } from "@/lib/permissions";
import type { LeadType } from "@/lib/permissions";
import type { NotificationType, Priorite } from "./types";

export type RecipientRule =
  | "gerant"
  | "gerant_operateur"
  | "gerant_technicien"
  | "operateur_technicien"
  | "self";

export type NotificationData = {
  leadId?: number;
  leadType?: LeadType;
  leadNom?: string;
  leadTelephone?: string;
  employeNom?: string;
  siteNom?: string;
  periode?: "arrivee" | "depart";
  semaineLabel?: string;
  detail?: string;
};

export type NotifyEvent = {
  type: NotificationType;
  data?: NotificationData;
  /** Site concerné, en guise d'id ou de nom ; résolu par `notify()`. */
  siteRef?: string | null;
  entite?: { type: string; id: string } | null;
  /** Auteur de l'action : jamais notifié par sa propre action. */
  actorId?: string | null;
};

export type CatalogEntry = {
  label: string;
  priorite: Priorite;
  recipients: RecipientRule;
  titre: (data: NotificationData) => string;
  corps: (data: NotificationData) => string;
  href: (data: NotificationData, role: Role | null) => string | null;
};

export const LEAD_TYPE_SHORT_LABELS: Record<LeadType, string> = {
  formation: "Formation",
  wifi: "Wi-Fi",
  solaire: "Solaire",
  bureautique: "Bureautique",
  autre: "Contact",
};

export const NOTIFICATION_CATALOG: Record<NotificationType, CatalogEntry> = {
  demande_bureautique: {
    label: "Demande bureautique ou contact",
    priorite: "normale",
    recipients: "gerant_operateur",
    titre: () => "Nouvelle demande bureautique",
    corps: (data) =>
      `${data.leadNom ?? "Client"} · ${data.leadTelephone ?? ""}`.trim(),
    href: (data, role) =>
      data.leadId ? `/dashboard/${role}/demandes/${data.leadId}` : null,
  },
  demande_wifi: {
    label: "Demande Wi-Fi ou solaire",
    priorite: "normale",
    recipients: "gerant_technicien",
    titre: (data) =>
      data.leadType === "solaire"
        ? "Nouvelle demande solaire"
        : "Nouvelle demande Wi-Fi",
    corps: (data) =>
      `${data.leadNom ?? "Client"} · ${data.leadTelephone ?? ""}`.trim(),
    href: (data, role) =>
      data.leadId ? `/dashboard/${role}/demandes/${data.leadId}` : null,
  },
  demande_formation: {
    label: "Demande de formation",
    priorite: "normale",
    recipients: "gerant",
    titre: () => "Nouvelle demande de formation",
    corps: (data) =>
      `${data.leadNom ?? "Client"} · ${data.leadTelephone ?? ""}`.trim(),
    href: (data, role) =>
      data.leadId ? `/dashboard/${role}/demandes/${data.leadId}` : null,
  },
  pointage_validation: {
    label: "Pointage à valider",
    priorite: "normale",
    recipients: "gerant",
    titre: () => "Pointage à valider",
    corps: (data) =>
      `${data.employeNom ?? "Un employé"} — pointage à vérifier${
        data.siteNom ? ` à ${data.siteNom}` : ""
      }.`,
    href: (_data, role) => `/dashboard/${role}/pointage`,
  },
  pointage_rappel: {
    label: "Rappel de pointage",
    priorite: "normale",
    recipients: "operateur_technicien",
    titre: () => "Rappel : pointer",
    corps: (data) =>
      data.periode === "depart"
        ? "N'oubliez pas de pointer votre départ."
        : "N'oubliez pas de pointer votre arrivée.",
    href: (_data, role) => `/dashboard/${role}/pointage`,
  },
  heures_corrigees: {
    label: "Heures corrigées ou validées",
    priorite: "normale",
    recipients: "operateur_technicien",
    titre: () => "Heures corrigées ou validées",
    corps: (data) =>
      data.detail ?? "Vos heures ont été corrigées ou validées par le gérant.",
    href: (_data, role) => `/dashboard/${role}/mon-espace`,
  },
  planning_publie: {
    label: "Planning publié ou modifié",
    priorite: "normale",
    recipients: "operateur_technicien",
    titre: () => "Planning publié",
    corps: (data) =>
      `Le planning de la semaine du ${data.semaineLabel ?? ""} est publié.`.trim(),
    href: (_data, role) => `/dashboard/${role}/mon-espace`,
  },
  planning_non_prepare: {
    label: "Planning non préparé",
    priorite: "haute",
    recipients: "gerant",
    titre: () => "Planning non préparé",
    corps: (data) =>
      `Le planning de la semaine du ${data.semaineLabel ?? ""} n'est pas encore préparé.`.trim(),
    href: () => "/dashboard/gerant/planning?action=generer",
  },
  caisse_non_saisie: {
    label: "Caisse non saisie",
    priorite: "haute",
    recipients: "gerant_operateur",
    titre: () => "Caisse non saisie",
    corps: (data) =>
      `La caisse de ${data.siteNom ?? "au moins un site"} n'a pas été saisie aujourd'hui.`,
    href: (_data, role) => `/dashboard/${role}/caisse`,
  },
  test: {
    label: "Test",
    priorite: "normale",
    recipients: "self",
    titre: () => "Notification de test",
    corps: () => "Le centre de notifications est branché correctement.",
    href: () => null,
  },
};

/** Type d'événement déduit d'un type de lead public. */
export function leadNotificationType(
  type: LeadType
): "demande_bureautique" | "demande_wifi" | "demande_formation" {
  if (type === "formation") return "demande_formation";
  if (type === "wifi" || type === "solaire") return "demande_wifi";
  return "demande_bureautique";
}
