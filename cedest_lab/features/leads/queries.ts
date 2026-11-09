import { desc, eq, inArray } from "drizzle-orm";
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
