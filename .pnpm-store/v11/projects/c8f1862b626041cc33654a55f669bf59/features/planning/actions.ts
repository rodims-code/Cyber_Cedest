"use server";

import { and, eq, inArray, isNull, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/app/db";
import { shifts, sites, user } from "@/app/db/schema";
import { requireRole } from "@/lib/session";
import { getWeekdayIndex, getWorkWeekDays } from "@/lib/time";
import { savePlanningSchema } from "@/features/planning/schemas";

export type SavePlanningState = {
  ok?: boolean;
  error?: string;
  message?: string;
};

function revalidatePlanning() {
  // Rafraîchit notamment la sidebar (site actif des non-gérants, dérivé
  // du planning du jour) pour tous les utilisateurs.
  revalidatePath("/", "layout");
  revalidatePath("/dashboard/gerant/planning");
  revalidatePath("/dashboard/gerant");
  revalidatePath("/dashboard/gerant/mon-espace");
  revalidatePath("/dashboard/operateur/mon-espace");
  revalidatePath("/dashboard/technicien/mon-espace");
}

/**
 * Enregistre le brouillon du planning pour une semaine.
 *
 * Le périmètre est le site sélectionné, ou tous les sites en vue cumulée.
 * Les postes de la semaine dans ce périmètre sont remplacés en une transaction.
 */
export async function savePlanningAction(
  input: unknown
): Promise<SavePlanningState> {
  await requireRole(["gerant"]);

  const parsed = savePlanningSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Planning invalide.",
    };
  }

  const { weekStart, scopeSiteId, shifts: draft } = parsed.data;

  if (getWeekdayIndex(weekStart) !== 0) {
    return {
      ok: false,
      error: "La semaine doit commencer un lundi.",
    };
  }

  const days = getWorkWeekDays(weekStart);
  const daySet = new Set(days);
  const seen = new Set<string>();

  for (const shift of draft) {
    if (!daySet.has(shift.date)) {
      return {
        ok: false,
        error: "Une date du planning ne correspond pas à la semaine choisie.",
      };
    }

    if (scopeSiteId && shift.siteId !== scopeSiteId) {
      return {
        ok: false,
        error: "Un poste appartient à un autre site que le site sélectionné.",
      };
    }

    const key = `${shift.date}|${shift.userId}`;
    if (seen.has(key)) {
      return {
        ok: false,
        error: "Un employé est planifié deux fois le même jour.",
      };
    }
    seen.add(key);
  }

  const siteIds = [...new Set(draft.map((shift) => shift.siteId))];
  const userIds = [...new Set(draft.map((shift) => shift.userId))];

  if (scopeSiteId) {
    const scopedSite = await db
      .select({ id: sites.id })
      .from(sites)
      .where(and(eq(sites.id, scopeSiteId), eq(sites.actif, true)))
      .limit(1);

    if (scopedSite.length === 0) {
      return {
        ok: false,
        error: "Le site sélectionné est inactif ou n'existe plus.",
      };
    }
  }

  const [validSites, validUsers, activeSites] = await Promise.all([
    siteIds.length > 0
      ? db
          .select({ id: sites.id })
          .from(sites)
          .where(and(inArray(sites.id, siteIds), eq(sites.actif, true)))
      : Promise.resolve([]),
    userIds.length > 0
      ? db
          .select({ id: user.id })
          .from(user)
          .where(
            and(
              inArray(user.id, userIds),
              eq(user.role, "operateur"),
              or(eq(user.banned, false), isNull(user.banned))
            )
          )
      : Promise.resolve([]),
    scopeSiteId
      ? Promise.resolve([{ id: scopeSiteId }])
      : db.select({ id: sites.id }).from(sites).where(eq(sites.actif, true)),
  ]);

  if (validSites.length !== siteIds.length) {
    return {
      ok: false,
      error: "Un site est inactif ou n'existe plus. Rechargez la page.",
    };
  }

  if (validUsers.length !== userIds.length) {
    return {
      ok: false,
      error:
        "Un employé est inactif ou n'est pas un opérateur. Rechargez la page.",
    };
  }

  await db.transaction(async (tx) => {
    const activeSiteIds = activeSites.map((site) => site.id);

    if (activeSiteIds.length > 0) {
      await tx
        .delete(shifts)
        .where(
          and(
            inArray(shifts.date, days),
            scopeSiteId
              ? eq(shifts.siteId, scopeSiteId)
              : inArray(shifts.siteId, activeSiteIds)
          )
        );
    }

    if (draft.length > 0) {
      await tx.insert(shifts).values(
        draft.map((shift) => ({
          date: shift.date,
          siteId: shift.siteId,
          userId: shift.userId,
          fonction: shift.fonction,
        }))
      );
    }
  });

  revalidatePlanning();

  return {
    ok: true,
    message: "Le planning de la semaine a été enregistré.",
  };
}
