"use server";
import { db } from "@/app/db";
import { leads } from "@/app/db/schema";
import { leadSchema } from "./schemas";
export async function createLead(input: unknown) {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success || parsed.data.website) return { ok: false, error: "Demande invalide." };
  const { website: _website, details, ...data } = parsed.data;
  const [lead] = await db.insert(leads).values({ ...data, email: data.email || null, details: details ? { message: details } : null }).returning({ id: leads.id });
  return { ok: true, id: lead.id };
}
