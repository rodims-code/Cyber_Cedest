import { and, count, desc, eq, gt, gte, inArray, or } from "drizzle-orm";
import { db } from "@/app/db";
import { leadNotes, leads, user } from "@/app/db/schema";
import { allowedLeadTypes, LeadType, Role } from "@/lib/permissions";

export async function getLeadsForRole(
  role: Role,
  filters?: { type?: string; status?: string }
) {
  const permittedTypes = allowedLeadTypes(role);
  const rows = await db
    .select()
    .from(leads)
    .where(permittedTypes ? inArray(leads.type, permittedTypes) : undefined)
    .orderBy(desc(leads.createdAt));

  return rows.filter((lead) => {
    const typeMatches = !filters?.type || lead.type === filters.type;
    const statusMatches = !filters?.status || lead.status === filters.status;
    return typeMatches && statusMatches;
  });
}

export async function getLeadForRole(id: number, role: Role) {
  const [lead] = await db.select().from(leads).where(eq(leads.id, id));
  if (!lead) return null;

  const permittedTypes = allowedLeadTypes(role);
  if (permittedTypes && !permittedTypes.includes(lead.type as LeadType)) return null;

  const notes = await db
    .select({
      id: leadNotes.id,
      contenu: leadNotes.contenu,
      createdAt: leadNotes.createdAt,
      authorName: user.name,
    })
    .from(leadNotes)
    .leftJoin(user, eq(leadNotes.auteurId, user.id))
    .where(eq(leadNotes.leadId, id))
    .orderBy(desc(leadNotes.createdAt));

  return { lead, notes };
}

/** Compte les demandes faites par une IP dans la dernière heure. */
export async function countLeadsInLastHourByIpHash(ipHash: string): Promise<number> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [res] = await db
    .select({ total: count() })
    .from(leads)
    .where(
      and(
        eq(leads.ipHash, ipHash),
        gte(leads.createdAt, oneHourAgo)
      )
    );
  return Number(res?.total ?? 0);
}

/** Recherche les doublons par numéro de téléphone. */
export async function getOtherLeadsByPhone(telephone: string, currentLeadId: number) {
  return await db
    .select({
      id: leads.id,
      numero: leads.numero,
      type: leads.type,
      status: leads.status,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .where(
      and(
        eq(leads.telephone, telephone),
        desc(leads.createdAt) ? or(gt(leads.id, currentLeadId), inArray(leads.id, [currentLeadId])) : undefined
      )
    );
}
