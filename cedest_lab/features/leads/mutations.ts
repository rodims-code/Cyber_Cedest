/**
 * Mutations leads partagées entre les Server Actions de `features/leads`
 * et les actions rapides du centre de notifications.
 *
 * Chaque fonction revérifie le droit `canAccessLead` côté serveur :
 * aucune mutation n'existe sans contrôle de rôle.
 */
import { and, eq } from "drizzle-orm";

import { db } from "@/app/db";
import { leadNotes, leads } from "@/app/db/schema";
import { canAccessLead, type LeadType, type Role } from "@/lib/permissions";

export type LeadStatus = "nouveau" | "en_cours" | "converti" | "annule";

/** Change le statut d'un lead si l'acteur y a accès. Retourne false sinon. */
export async function changeLeadStatusForUser(
  leadId: number,
  status: LeadStatus,
  actorRole: Role
): Promise<boolean> {
  const [lead] = await db
    .select({ type: leads.type })
    .from(leads)
    .where(eq(leads.id, leadId));

  if (!lead || !canAccessLead(actorRole, lead.type as LeadType)) {
    return false;
  }

  await db
    .update(leads)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(leads.id, leadId), eq(leads.type, lead.type)));

  return true;
}

/** Ajoute une note interne à un lead si l'auteur y a accès. */
export async function addLeadNoteForUser(
  leadId: number,
  contenu: string,
  auteurId: string,
  actorRole: Role
): Promise<boolean> {
  const [lead] = await db
    .select({ type: leads.type })
    .from(leads)
    .where(eq(leads.id, leadId));

  if (!lead || !canAccessLead(actorRole, lead.type as LeadType)) {
    return false;
  }

  await db.insert(leadNotes).values({
    leadId,
    auteurId,
    contenu,
  });

  return true;
}
