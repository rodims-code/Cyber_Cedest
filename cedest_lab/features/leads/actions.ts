"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/app/db";
import { leadNotes, leads } from "@/app/db/schema";
import { canAccessLead } from "@/lib/permissions";
import { requireRole } from "@/lib/session";
import { leadNoteSchema, leadSchema, leadStatusSchema } from "./schemas";

const attemptsByIp = new Map<string, { count: number; resetAt: number }>();

async function enforceLeadRateLimit() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const attempt = attemptsByIp.get(ip);

  if (!attempt || attempt.resetAt <= now) {
    attemptsByIp.set(ip, { count: 1, resetAt: now + 10 * 60 * 1_000 });
    return true;
  }

  if (attempt.count >= 5) return false;
  attempt.count += 1;
  return true;
}

export async function createLead(input: unknown) {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success || parsed.data.website) {
    const errorMsg = !parsed.success
      ? parsed.error.issues[0]?.message ?? "Demande invalide."
      : "Demande invalide.";
    return { ok: false, error: errorMsg };
  }

  if (!(await enforceLeadRateLimit())) {
    return { ok: false, error: "Trop de demandes envoyées. Réessayez dans quelques minutes." };
  }

  const { details, website, ...data } = parsed.data;
  void website;

  const [lead] = await db
    .insert(leads)
    .values({
      ...data,
      email: data.email || null,
      site: data.site || null,
      details: details ? { message: details } : null,
    })
    .returning({ id: leads.id });

  return { ok: true, id: lead.id };
}

export async function updateLeadStatus(formData: FormData) {
  const parsed = leadStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const { role } = await requireRole();
  const [lead] = await db
    .select({ type: leads.type })
    .from(leads)
    .where(eq(leads.id, parsed.data.leadId));

  if (!lead || !canAccessLead(role, lead.type)) return;

  await db
    .update(leads)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(and(eq(leads.id, parsed.data.leadId), eq(leads.type, lead.type)));
  revalidatePath("/dashboard", "layout");
}

export async function addLeadNote(formData: FormData) {
  const parsed = leadNoteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const session = await requireRole();
  const [lead] = await db
    .select({ type: leads.type })
    .from(leads)
    .where(eq(leads.id, parsed.data.leadId));

  if (!lead || !canAccessLead(session.role, lead.type)) return;

  await db.insert(leadNotes).values({
    leadId: parsed.data.leadId,
    auteurId: session.user.id,
    contenu: parsed.data.contenu,
  });
  revalidatePath("/dashboard", "layout");
}
