import { and, count, desc, eq, gt, gte, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/app/db";
import { leadNotes, leads, user, whatsappClicks } from "@/app/db/schema";
import { allowedLeadTypes, LeadType, Role } from "@/lib/permissions";
import { getKinshasaDateIso } from "@/src/lib/time";

export type GetLeadsOptions = {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function getLeadsForRole(
  role: Role,
  filters?: GetLeadsOptions
) {
  const permittedTypes = allowedLeadTypes(role);
  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.max(1, filters?.pageSize ?? 20);
  const offset = (page - 1) * pageSize;

  const conditions = [];

  // Filtrage par type selon le rôle
  if (permittedTypes) {
    conditions.push(inArray(leads.type, permittedTypes));
  }

  // Filtre par type explicite
  if (filters?.type && (!permittedTypes || permittedTypes.includes(filters.type as LeadType))) {
    conditions.push(eq(leads.type, filters.type as any));
  }

  // Filtre par statut
  if (filters?.status) {
    conditions.push(eq(leads.status, filters.status as any));
  }

  // Recherche (nom, téléphone, référence CED-...)
  if (filters?.search && filters.search.trim()) {
    const term = filters.search.trim();
    const referenceMatch = term.match(/^CED-(\d+)$/i);
    const parsedNum = referenceMatch ? Number(referenceMatch[1]) : Number.NaN;

    const searchConditions = [
      ilike(leads.nom, `%${term}%`),
      ilike(leads.telephone, `%${term}%`),
    ];
    if (!isNaN(parsedNum)) {
      searchConditions.push(eq(leads.numero, parsedNum));
    }
    conditions.push(or(...searchConditions));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ total: count() })
    .from(leads)
    .where(whereClause);

  const total = Number(totalResult?.total ?? 0);

  const rows = await db
    .select()
    .from(leads)
    .where(whereClause)
    .orderBy(desc(leads.createdAt))
    .limit(pageSize)
    .offset(offset);

  return {
    leads: rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
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

/** Nombre de demandes avec statut "nouveau" selon les types accessibles pour le rôle. */
export async function getNewLeadsCountForRole(role: Role): Promise<number> {
  const permittedTypes = allowedLeadTypes(role);
  const conditions = [eq(leads.status, "nouveau")];

  if (permittedTypes) {
    conditions.push(inArray(leads.type, permittedTypes));
  }

  const [res] = await db
    .select({ total: count() })
    .from(leads)
    .where(and(...conditions));

  return Number(res?.total ?? 0);
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
export async function getOtherLeadsByPhone(
  telephone: string,
  currentLeadId: number,
  role: Role
) {
  const permittedTypes = allowedLeadTypes(role);
  const conditions = [
    eq(leads.telephone, telephone),
    sql`${leads.id} != ${currentLeadId}`,
  ];

  if (permittedTypes) {
    conditions.push(inArray(leads.type, permittedTypes));
  }

  return await db
    .select({
      id: leads.id,
      numero: leads.numero,
      type: leads.type,
      status: leads.status,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .where(and(...conditions))
    .orderBy(desc(leads.createdAt));
}

/** Activité WhatsApp : clics aujourd'hui et sur 7 jours. */
export async function getWhatsAppClicksStats() {
  const startOfToday = new Date(`${getKinshasaDateIso()}T00:00:00+01:00`);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const clicks7d = await db
    .select()
    .from(whatsappClicks)
    .where(gte(whatsappClicks.createdAt, sevenDaysAgo))
    .orderBy(desc(whatsappClicks.createdAt));

  const totalAujourdhui = clicks7d.filter(
    (c) => c.createdAt >= startOfToday
  ).length;

  const total7Jours = clicks7d.length;

  const parBouton: Record<string, number> = {};
  const parPage: Record<string, number> = {};

  for (const c of clicks7d) {
    parBouton[c.bouton] = (parBouton[c.bouton] || 0) + 1;
    parPage[c.page] = (parPage[c.page] || 0) + 1;
  }

  return {
    totalAujourdhui,
    total7Jours,
    parBouton,
    parPage,
    listeRecente: clicks7d.slice(0, 50),
  };
}
