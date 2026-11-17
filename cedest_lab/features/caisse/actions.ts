"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/app/db";
import { caisse, sites } from "@/app/db/schema";
import { requireRole } from "@/lib/session";
import type { Role } from "@/lib/permissions";
import {
  createCaisseEntrySchema,
  cancelCaisseEntrySchema,
  type CreateCaisseEntryInput,
  type CancelCaisseEntryInput,
} from "@/features/caisse/schemas";
import {
  getCaisseEntryById,
  getCaisseAccessibleSites,
  getCaisseEntriesForDay,
  getCaisseJourTotals,
  type CaisseEntry,
  type CaisseJourTotals,
} from "@/features/caisse/queries";
import { getKinshasaDateIso } from "@/lib/time";

export type CaisseActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
};

function revalidateCaisse() {
  revalidatePath("/dashboard/gerant/caisse");
  revalidatePath("/dashboard/operateur/caisse");
  revalidatePath("/dashboard", "layout");
}

/**
 * Récupère les entrées et totaux de caisse du jour pour un site.
 */
export async function getCaisseEntriesAndTotalsAction(siteId: string): Promise<{
  ok: boolean;
  error?: string;
  entries: CaisseEntry[];
  totals: CaisseJourTotals[];
}> {
  try {
    const session = await requireRole(["gerant", "operateur"]);

    const allowedSites = await getCaisseAccessibleSites(
      session.user.id,
      session.role
    );
    if (!allowedSites.some((s) => s.id === siteId)) {
      return {
        ok: false,
        error: "Vous n'êtes pas autorisé à consulter la caisse pour ce site.",
        entries: [],
        totals: [],
      };
    }

    const todayIso = getKinshasaDateIso();
    const [entries, totals] = await Promise.all([
      getCaisseEntriesForDay(siteId, todayIso),
      getCaisseJourTotals(siteId, todayIso),
    ]);

    return {
      ok: true,
      entries,
      totals,
    };
  } catch (err) {
    console.error("Erreur getCaisseEntriesAndTotalsAction:", err);
    return {
      ok: false,
      error: "Impossible de charger les données de caisse.",
      entries: [],
      totals: [],
    };
  }
}

/**
 * Ajoute une ligne de caisse (recette, dépense ou fourniture).
 * Vérifie que l'utilisateur a accès au site.
 * L'heure et la date viennent du serveur (fuseau Kinshasa).
 */
export async function createCaisseEntryAction(
  input: unknown
): Promise<CaisseActionState> {
  const session = await requireRole(["gerant", "operateur"]);

  const parsed = createCaisseEntrySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Informations invalides.",
    };
  }

  const { siteId, type, libelle, montant, devise } = parsed.data;

  // Vérifier que l'utilisateur a accès à ce site pour la caisse
  const allowedSites = await getCaisseAccessibleSites(
    session.user.id,
    session.role
  );
  if (!allowedSites.some((s) => s.id === siteId)) {
    return {
      ok: false,
      error: "Vous n'êtes pas autorisé à saisir la caisse pour ce site.",
    };
  }

  // Récupérer le site pour valider qu'il est actif
  const site = await db
    .select({ id: sites.id, actif: sites.actif })
    .from(sites)
    .where(eq(sites.id, siteId))
    .limit(1);

  if (!site[0] || !site[0].actif) {
    return {
      ok: false,
      error: "Ce site n'existe pas ou a été désactivé.",
    };
  }

  // Insérer la ligne de caisse
  await db.insert(caisse).values({
    siteId,
    date: getKinshasaDateIso(),
    type,
    libelle,
    montant,
    devise,
    saisiPar: session.user.id,
    statut: "valide",
  });

  revalidateCaisse();

  return {
    ok: true,
    message: "Ligne de caisse enregistrée.",
  };
}

/**
 * Annule une ligne de caisse.
 * - L'opérateur ne peut annuler que ses propres lignes du jour.
 * - Le gérant peut annuler toute ligne avec un motif.
 */
export async function cancelCaisseEntryAction(
  input: unknown
): Promise<CaisseActionState> {
  const session = await requireRole(["gerant", "operateur"]);

  const parsed = cancelCaisseEntrySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Informations invalides.",
    };
  }

  const { id, motifAnnulation } = parsed.data;

  // Récupérer l'entrée pour vérifier les permissions
  const entry = await getCaisseEntryById(id);
  if (!entry) {
    return {
      ok: false,
      error: "Cette ligne de caisse n'existe pas.",
    };
  }

  // Vérifier les permissions
  if (session.role === "operateur") {
    // L'opérateur ne peut annuler que ses propres lignes du jour
    if (entry.saisiPar !== session.user.id) {
      return {
        ok: false,
        error: "Vous ne pouvez annuler que vos propres lignes de caisse.",
      };
    }

    // Vérifier que c'est bien aujourd'hui
    const todayIso = getKinshasaDateIso();
    if (entry.date !== todayIso) {
      return {
        ok: false,
        error: "Vous ne pouvez annuler que les lignes de la journée en cours.",
      };
    }

    // Vérifier que la ligne n'est pas déjà annulée
    if (entry.statut === "annule") {
      return {
        ok: false,
        error: "Cette ligne de caisse est déjà annulée.",
      };
    }

    // Vérifier que l'opérateur a toujours accès au site
    const allowedSites = await getCaisseAccessibleSites(
      session.user.id,
      session.role
    );
    if (!allowedSites.some((s) => s.id === entry.siteId)) {
      return {
        ok: false,
        error: "Vous n'avez plus accès à ce site.",
      };
    }
  }

  // Annuler la ligne
  await db
    .update(caisse)
    .set({
      statut: "annule",
      annulePar: session.user.id,
      motifAnnulation,
      annuleAt: new Date(),
    })
    .where(eq(caisse.id, id));

  revalidateCaisse();

  return {
    ok: true,
    message: "Ligne de caisse annulée.",
  };
}
