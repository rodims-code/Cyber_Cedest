/**
 * Point d'entrée unique des notifications : `notify(event)`.
 *
 * Les appels sont volontairement non bloquants côté appelant : un échec de
 * notification ne doit jamais faire échouer l'action métier déclencheuse.
 * Utiliser `notifySafely` pour ce cas (try/catch inclus).
 */
import { db } from "@/app/db";
import { notifications } from "@/app/db/schema";
import type { LeadType } from "@/lib/permissions";
import {
  NOTIFICATION_CATALOG,
  leadNotificationType,
  type NotifyEvent,
} from "./catalog";
import { resolveRecipients, resolveSite } from "./resolve";

export type NotifyResult = { created: number };

export async function notify(event: NotifyEvent): Promise<NotifyResult> {
  const entry = NOTIFICATION_CATALOG[event.type];
  const data = event.data ?? {};

  const site = await resolveSite(event.siteRef);
  const siteNom = site?.nom ?? data.siteNom ?? null;

  const recipients = await resolveRecipients(
    entry.recipients,
    site?.id ?? null,
    event.actorId ?? null
  );

  if (recipients.length === 0) {
    return { created: 0 };
  }

  const rows = recipients.map((recipient) => ({
    userId: recipient.id,
    type: event.type,
    titre: entry.titre(data),
    corps: entry.corps({ ...data, siteNom: siteNom ?? undefined }),
    href: entry.href(data, recipient.role),
    entiteType: event.entite?.type ?? null,
    entiteId: event.entite?.id ?? null,
    siteId: site?.id ?? null,
    priorite: entry.priorite,
  }));

  await db.insert(notifications).values(rows);

  return { created: rows.length };
}

/** Comme `notify`, mais avale l'erreur (logge seulement). */
export async function notifySafely(event: NotifyEvent): Promise<void> {
  try {
    await notify(event);
  } catch (error) {
    console.error("Erreur notify():", error);
  }
}

/** Déclencheur « nouvelle demande » (seul module métier branché pour l'instant). */
export async function notifyLeadCreated(lead: {
  id: number;
  type: LeadType;
  nom: string;
  telephone: string;
  site: string | null;
}): Promise<void> {
  await notifySafely({
    type: leadNotificationType(lead.type),
    data: {
      leadId: lead.id,
      leadType: lead.type,
      leadNom: lead.nom,
      leadTelephone: lead.telephone,
    },
    siteRef: lead.site,
    entite: { type: "lead", id: String(lead.id) },
  });
}

export { NOTIFICATION_CATALOG };
