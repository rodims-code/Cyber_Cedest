"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/session";
import { getLeadForRole } from "@/features/leads/queries";
import {
  addLeadNoteForUser,
  changeLeadStatusForUser,
  type LeadStatus,
} from "@/features/leads/mutations";
import type { NotificationItem, NotificationTypeFilter } from "./types";
import {
  listNotifications,
  getNotificationById,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "./queries";
import {
  listNotificationsSchema,
  notificationIdSchema,
  quickLeadStatusSchema,
  quickLeadNoteSchema,
} from "./schemas";
import { notify } from "./notify";

export type ListNotificationsResult =
  | { ok: true; items: NotificationItem[]; nextCursor: string | null }
  | { ok: false; error: string };

export type NotificationResult =
  | {
      ok: true;
      notification: NotificationItem | null;
      changed?: boolean;
    }
  | { ok: false; error: string };

export type MutationResult =
  | { ok: true; changed?: boolean }
  | { ok: false; error: string };

export async function listNotificationsAction(
  input: unknown
): Promise<ListNotificationsResult> {
  const session = await requireRole();

  const parsed = listNotificationsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Filtre invalide." };
  }

  const { tab, type, cursor, limit } = parsed.data;
  const result = await listNotifications(session.user.id, {
    tab,
    type: type as NotificationTypeFilter,
    cursor: cursor ?? null,
    limit,
  });

  return { ok: true, ...result };
}

export async function getNotificationAction(
  input: unknown
): Promise<NotificationResult> {
  const session = await requireRole();

  const parsed = notificationIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Notification invalide." };
  }

  const notification = await getNotificationById(
    session.user.id,
    parsed.data.id
  );

  return { ok: true, notification };
}

export async function markNotificationReadAction(
  input: unknown
): Promise<MutationResult> {
  const session = await requireRole();

  const parsed = notificationIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Notification invalide." };
  }

  const changed = await markNotificationRead(session.user.id, parsed.data.id);

  return { ok: true, changed };
}

export async function markAllNotificationsReadAction(): Promise<MutationResult> {
  const session = await requireRole();
  await markAllNotificationsRead(session.user.id);
  return { ok: true };
}

export async function deleteNotificationAction(
  input: unknown
): Promise<MutationResult> {
  const session = await requireRole();

  const parsed = notificationIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Notification invalide." };
  }

  const deleted = await deleteNotification(session.user.id, parsed.data.id);
  return deleted ? { ok: true } : { ok: false, error: "Notification introuvable." };
}

/** Contexte minimal d'un lead pour les actions rapides (WhatsApp, statut). */
export async function getLeadContextAction(input: unknown) {
  const session = await requireRole();

  const parsed = notificationIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Demande invalide." };
  }

  const found = await getLeadForRole(parsed.data.id, session.role);
  if (!found) {
    return { ok: false as const, error: "Demande introuvable ou non autorisée." };
  }

  const { lead } = found;

  return {
    ok: true as const,
    lead: {
      id: lead.id,
      nom: lead.nom,
      telephone: lead.telephone,
      type: lead.type,
      status: lead.status,
    },
  };
}

export async function quickSetLeadStatusAction(input: unknown) {
  const session = await requireRole();

  const parsed = quickLeadStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Statut invalide." };
  }

  const changed = await changeLeadStatusForUser(
    parsed.data.leadId,
    parsed.data.status as LeadStatus,
    session.role
  );

  if (!changed) {
    return { ok: false as const, error: "Demande introuvable ou non autorisée." };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true as const };
}

export async function quickAddLeadNoteAction(input: unknown) {
  const session = await requireRole();

  const parsed = quickLeadNoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Note invalide.",
    };
  }

  const added = await addLeadNoteForUser(
    parsed.data.leadId,
    parsed.data.contenu,
    session.user.id,
    session.role
  );

  if (!added) {
    return { ok: false as const, error: "Demande introuvable ou non autorisée." };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true as const };
}

/**
 * Bouton « Envoyer une notification de test », réservé au gérant.
 * S'envoie à soi-même : c'est le parcours complet qui est vérifié
 * (toast → drawer → détail).
 */
export async function sendTestNotificationAction() {
  const session = await requireRole(["gerant"]);

  const { created } = await notify({
    type: "test",
    actorId: session.user.id,
  });

  return { ok: true as const, created };
}
