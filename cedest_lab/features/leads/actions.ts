"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/app/db";
import { leads } from "@/app/db/schema";
import { requireRole } from "@/lib/session";
import { leadNoteSchema, leadSchema, leadStatusSchema } from "./schemas";
import {
  addLeadNoteForUser,
  changeLeadStatusForUser,
} from "./mutations";
import { notifyLeadCreated } from "@/src/features/notifications/notify";

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

  await notifyLeadCreated({
    id: lead.id,
    type: data.type,
    nom: data.nom,
    telephone: data.telephone,
    site: data.site || null,
  });

  return { ok: true, id: lead.id };
}

export async function updateLeadStatus(formData: FormData) {
  const parsed = leadStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const { role } = await requireRole();
  await changeLeadStatusForUser(parsed.data.leadId, parsed.data.status, role);
  revalidatePath("/dashboard", "layout");
}

export async function addLeadNote(formData: FormData) {
  const parsed = leadNoteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  const session = await requireRole();
  await addLeadNoteForUser(
    parsed.data.leadId,
    parsed.data.contenu,
    session.user.id,
    session.role
  );
  revalidatePath("/dashboard", "layout");
}
