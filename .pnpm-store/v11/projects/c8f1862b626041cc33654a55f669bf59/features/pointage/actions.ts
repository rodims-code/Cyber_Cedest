"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/app/db";
import { pointages, sites } from "@/app/db/schema";
import { getActiveSiteById } from "@/features/sites/queries";
import { canPunchFromHere } from "@/lib/pointage-policy";
import { requireRole } from "@/lib/session";
import { getCurrentSite } from "@/lib/current-site";
import {
  diffHeures,
  formatDuree,
  formatHeureKinshasa,
  getKinshasaDateIso,
} from "@/lib/time";

export type PunchState = {
  ok?: boolean;
  error?: string;
  message?: string;
};

const PUNCH_ROLES = ["gerant", "operateur", "technicien"] as const;

function revalidatePointage() {
  for (const role of PUNCH_ROLES) {
    revalidatePath(`/dashboard/${role}`);
    revalidatePath(`/dashboard/${role}/pointage`);
    revalidatePath(`/dashboard/${role}/mon-espace`);
  }
}

async function getPunchContext() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");

  return {
    ip: forwarded?.split(",")[0]?.trim() ?? headerList.get("x-real-ip"),
    userAgent: headerList.get("user-agent"),
  };
}

/**
 * Pointage d'arrivée.
 *
 * - L'heure vient exclusivement de `new Date()` côté serveur.
 * - Le site est résolu côté serveur via `getCurrentSite()` : le planning
 *   pour opérateur/technicien, le site choisi dans le sélecteur pour le
 *   gérant. Aucun champ envoyé par le client ne peut définir le site.
 * - Sans site actif (aucun poste aujourd'hui, ou vue cumulée pour le
 *   gérant), l'arrivée est refusée.
 * - Un seul pointage peut être ouvert à la fois (index partiel en base).
 */
export async function punchInAction(): Promise<PunchState> {
  const session = await requireRole([...PUNCH_ROLES]);

  const now = new Date();
  const todayIso = getKinshasaDateIso(now);

  const existing = await db
    .select({
      id: pointages.id,
      arrivee: pointages.arrivee,
      siteNom: sites.nom,
    })
    .from(pointages)
    .innerJoin(sites, eq(pointages.siteId, sites.id))
    .where(and(eq(pointages.userId, session.user.id), isNull(pointages.depart)))
    .limit(1);

  const open = existing[0];
  if (open) {
    return {
      ok: false,
      error: `Vous avez déjà un pointage ouvert depuis ${formatHeureKinshasa(
        open.arrivee
      )} à ${open.siteNom}. Pointez d'abord le départ.`,
    };
  }

  const policy = canPunchFromHere(await getPunchContext());
  if (!policy.allowed) {
    return {
      ok: false,
      error:
        policy.reason ??
        "Le pointage n'est pas autorisé depuis ce poste de travail.",
    };
  }

  // Source unique de vérité : résolution côté serveur, jamais le client.
  const resolved = await getCurrentSite();
  const site = resolved.id ? await getActiveSiteById(resolved.id) : null;

  if (!site) {
    return {
      ok: false,
      error:
        session.role === "gerant"
          ? "Choisissez un site précis dans le sélecteur pour pointer votre arrivée."
          : "Aucun poste aujourd'hui. Vous ne pouvez pas pointer.",
    };
  }

  try {
    await db.insert(pointages).values({
      userId: session.user.id,
      siteId: site.id,
      date: todayIso,
      arrivee: now,
    });
  } catch (error) {
    // Course entre deux clics : l'index partiel a déjà bloqué un pointage ouvert.
    if ((error as { code?: string }).code === "23505") {
      return {
        ok: false,
        error:
          "Un pointage vient d'être ouvert. Rechargez la page avant de réessayer.",
      };
    }

    console.error("Erreur pointage arrivée:", error);
    return {
      ok: false,
      error: "Le pointage de l'arrivée a échoué. Réessayez.",
    };
  }

  revalidatePointage();

  return {
    ok: true,
    message: `Arrivée pointée à ${formatHeureKinshasa(now)} · ${site.nom}.`,
  };
}

/**
 * Pointage de départ.
 *
 * Le départ est impossible sans arrivée : on met à jour le pointage ouvert,
 * jamais un autre. L'heure reste celle du serveur.
 */
export async function punchOutAction(): Promise<PunchState> {
  const session = await requireRole([...PUNCH_ROLES]);

  const policy = canPunchFromHere(await getPunchContext());
  if (!policy.allowed) {
    return {
      ok: false,
      error:
        policy.reason ??
        "Le pointage n'est pas autorisé depuis ce poste de travail.",
    };
  }

  const now = new Date();

  const existing = await db
    .select({
      id: pointages.id,
      arrivee: pointages.arrivee,
      siteNom: sites.nom,
    })
    .from(pointages)
    .innerJoin(sites, eq(pointages.siteId, sites.id))
    .where(and(eq(pointages.userId, session.user.id), isNull(pointages.depart)))
    .limit(1);

  const open = existing[0];
  if (!open) {
    return {
      ok: false,
      error:
        "Aucune arrivée pointée. Pointez d'abord votre arrivée pour pouvoir partir.",
    };
  }

  const updated = await db
    .update(pointages)
    .set({ depart: now, updatedAt: now })
    .where(and(eq(pointages.id, open.id), isNull(pointages.depart)))
    .returning({ id: pointages.id });

  if (updated.length === 0) {
    return {
      ok: false,
      error: "Ce pointage est déjà clôturé. Rechargez la page.",
    };
  }

  revalidatePointage();

  const heures = diffHeures(open.arrivee, now);

  return {
    ok: true,
    message: `Départ pointé à ${formatHeureKinshasa(
      now
    )} · ${formatDuree(heures)} travaillées à ${open.siteNom}.`,
  };
}
