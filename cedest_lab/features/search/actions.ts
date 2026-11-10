"use server";

import { and, ilike, inArray, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/app/db";
import { leads } from "@/app/db/schema";
import { allowedLeadTypes, isRole } from "@/lib/permissions";
import { getSession } from "@/lib/session";

const querySchema = z.string().trim().min(2).max(60);

export type LeadSearchResult = {
  id: number;
  nom: string;
  telephone: string;
  type: string;
  status: string;
};

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

/**
 * Recherche de demandes par nom ou téléphone.
 * Les types de leads sont filtrés selon le rôle : un opérateur ne peut pas
 * retrouver une demande Wi-Fi/Solaire, même via la palette de commandes.
 */
export async function searchLeads(query: string): Promise<LeadSearchResult[]> {
  const session = await getSession();
  const role = isRole(session?.user.role) ? session.user.role : null;
  if (!session?.user || !role) return [];

  const parsed = querySchema.safeParse(query);
  if (!parsed.success) return [];

  const pattern = `%${escapeLike(parsed.data)}%`;
  const permittedTypes = allowedLeadTypes(role);

  const rows = await db
    .select({
      id: leads.id,
      nom: leads.nom,
      telephone: leads.telephone,
      type: leads.type,
      status: leads.status,
    })
    .from(leads)
    .where(
      and(
        permittedTypes ? inArray(leads.type, permittedTypes) : undefined,
        or(ilike(leads.nom, pattern), ilike(leads.telephone, pattern))
      )
    )
    .limit(8);

  return rows;
}
