"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/app/db";
import { leads } from "@/app/db/schema";
import { requireRole } from "@/lib/session";
import {
  createLeadSchema,
  leadNoteSchema,
  leadStatusSchema,
} from "./schemas";
import {
  addLeadNoteForUser,
  changeLeadStatusForUser,
} from "./mutations";
import { countLeadsInLastHourByIpHash } from "./queries";
import { notifyLeadCreated } from "@/src/features/notifications/notify";
import { getClientIpHmac } from "@/src/lib/ip-hash";

export async function createLead(input: unknown) {
  const parsed = createLeadSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message ?? "Demande invalide.";
    return { ok: false, error: errorMsg };
  }

  // Champ piège rempli = faux succès sans rien enregistrer
  if (parsed.data.website) {
    return { ok: true, numero: "CED-0000" };
  }

  // Calcul HMAC-SHA256 de l'IP
  const ipHash = await getClientIpHmac();

  // Limite : 5 demandes par heure et par ip_hash comptées en base
  const countInHour = await countLeadsInLastHourByIpHash(ipHash);
  if (countInHour >= 5) {
    return {
      ok: false,
      error: "Trop de demandes. Réessayez plus tard ou écrivez-nous sur WhatsApp.",
    };
  }

  const {
    nom,
    telephone,
    type,
    message,
    site,
    website: _w,
    ...specificDetails
  } = parsed.data;

  const detailsPayload: Record<string, unknown> = {
    ...specificDetails,
  };
  if (message) {
    detailsPayload.message = message;
  }

  const [inserted] = await db
    .insert(leads)
    .values({
      type,
      nom,
      telephone,
      site: site || null,
      status: "nouveau",
      source: "formulaire",
      ipHash,
      details: Object.keys(detailsPayload).length > 0 ? detailsPayload : null,
    })
    .returning({ id: leads.id, numero: leads.numero });

  const numFormat = `CED-${String(inserted.numero).padStart(4, "0")}`;

  await notifyLeadCreated({
    id: inserted.id,
    numero: inserted.numero,
    type,
    nom,
    telephone,
    site: site || null,
  });

  return { ok: true, numero: numFormat };
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
