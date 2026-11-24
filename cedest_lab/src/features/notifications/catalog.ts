/**
 * Catalogue des événements de notification.
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
  leadNumero?: number;
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
  contact: "Contact",
};

export const NOTIFICATION_CATALOG: Record<NotificationType, CatalogEntry> = {
  demande_bureautique: {
    label: "Demande de contact",
    priorite: "normale",
    recipients: "gerant_operateur",
    titre: (data) =>
      `Nouvelle demande ${data.leadNumero ? `CED-${String(data.leadNumero).padStart(4, "0")}` : ""} : Contact – ${data.leadNom ?? "Client"}`,
    corps: (data) =>
      `${data.leadNom ?? "Client"} · ${data.leadTelephone ?? ""}`.trim(),
    href: (data, role) =>
      data.leadId ? `/dashboard/${role}/demandes/${data.leadId}` : null,
  },
  demande_wifi: {
    label: "Demande Wi-Fi ou solaire",
    priorite: "normale",
    recipients: "gerant_technicien",
    titre: (data) => {
      const srv = data.leadType === "solaire" ? "Solaire" : "Wi-Fi";
      const num = data.leadNumero ? `CED-${String(data.leadNumero).padStart(4, "0")}` : "";
      return `Nouvelle demande ${num} : ${srv} – ${data.leadNom ?? "Client"}`;
    },
    corps: (data) =>
      `${data.leadNom ?? "Client"} · ${data.leadTelephone ?? ""}`.trim(),
    href: (data, role) =>
      data.leadId ? `/dashboard/${role}/demandes/${data.leadId}` : null,
  },
  demande_formation: {
    label: "Demande de formation",
    priorite: "normale",
    recipients: "gerant",
    titre: (data) =>
      `Nouvelle demande ${data.leadNumero ? `CED-${String(data.leadNumero).padStart(4, "0")}` : ""} : Formation – ${data.leadNom ?? "Client"}`,
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
