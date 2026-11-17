import { and, asc, desc, eq, isNull, or } from "drizzle-orm";

import { db } from "@/app/db";
import { caisse, shifts, sites, user, userSites } from "@/app/db/schema";
import { getActiveSiteById } from "@/features/sites/queries";
import type { Role } from "@/lib/permissions";

export type CaisseEntry = {
  id: number;
  siteId: string;
  siteNom: string;
  date: string;
  type: "recette" | "depense" | "fourniture";
  libelle: string;
  montant: number;
  devise: "CDF" | "USD";
  saisiPar: string;
  saisiParNom: string;
  statut: "valide" | "annule";
  annulePar: string | null;
  motifAnnulation: string | null;
  annuleAt: string | null;
  createdAt: string;
};

export type CaisseJourTotals = {
  devise: "CDF" | "USD";
  recettes: number;
  depenses: number;
  fournitures: number;
  solde: number;
  nombreOperations: number;
};

/**
 * Récupère les entrées de caisse du jour pour un site.
 * Uniquement les lignes avec statut "valide" sont incluses dans les totaux.
 */
export async function getCaisseEntriesForDay(
  siteId: string,
  dateIso: string
): Promise<CaisseEntry[]> {
  const rows = await db
    .select({
      id: caisse.id,
      siteId: caisse.siteId,
      siteNom: sites.nom,
      date: caisse.date,
      type: caisse.type,
      libelle: caisse.libelle,
      montant: caisse.montant,
      devise: caisse.devise,
      saisiPar: caisse.saisiPar,
      saisiParNom: user.name,
      statut: caisse.statut,
      annulePar: caisse.annulePar,
      motifAnnulation: caisse.motifAnnulation,
      annuleAt: caisse.annuleAt,
      createdAt: caisse.createdAt,
    })
    .from(caisse)
    .innerJoin(sites, eq(caisse.siteId, sites.id))
    .innerJoin(user, eq(caisse.saisiPar, user.id))
    .where(
      and(
        eq(caisse.siteId, siteId),
        eq(caisse.date, dateIso),
        eq(sites.actif, true)
      )
    )
    .orderBy(asc(caisse.createdAt));

  return rows.map((row) => ({
    id: row.id,
    siteId: row.siteId,
    siteNom: row.siteNom,
    date: row.date,
    type: row.type,
    libelle: row.libelle,
    montant: row.montant,
    devise: row.devise as "CDF" | "USD",
    saisiPar: row.saisiPar,
    saisiParNom: row.saisiParNom,
    statut: row.statut,
    annulePar: row.annulePar,
    motifAnnulation: row.motifAnnulation,
    annuleAt: row.annuleAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}

/**
 * Récupère les totaux de caisse du jour pour un site, par devise.
 * Uniquement les lignes avec statut "valide" sont comptabilisées.
 */
export async function getCaisseJourTotals(
  siteId: string,
  dateIso: string
): Promise<CaisseJourTotals[]> {
  const rows = await db
    .select({
      devise: caisse.devise,
      type: caisse.type,
      montant: caisse.montant,
    })
    .from(caisse)
    .innerJoin(sites, eq(caisse.siteId, sites.id))
    .where(
      and(
        eq(caisse.siteId, siteId),
        eq(caisse.date, dateIso),
        eq(caisse.statut, "valide"),
        eq(sites.actif, true)
      )
    );

  const byDevise = new Map<string, CaisseJourTotals>();

  for (const row of rows) {
    if (!byDevise.has(row.devise)) {
      byDevise.set(row.devise, {
        devise: row.devise as "CDF" | "USD",
        recettes: 0,
        depenses: 0,
        fournitures: 0,
        solde: 0,
        nombreOperations: 0,
      });
    }

    const totals = byDevise.get(row.devise)!;
    totals.nombreOperations += 1;

    if (row.type === "recette") {
      totals.recettes += row.montant;
      totals.solde += row.montant;
    } else if (row.type === "depense") {
      totals.depenses += row.montant;
      totals.solde -= row.montant;
    } else if (row.type === "fourniture") {
      totals.fournitures += row.montant;
      totals.solde -= row.montant;
    }
  }

  return Array.from(byDevise.values());
}

/**
 * Récupère une entrée de caisse par son ID, avec vérification d'accès.
 */
export async function getCaisseEntryById(
  id: number
): Promise<CaisseEntry | null> {
  const rows = await db
    .select({
      id: caisse.id,
      siteId: caisse.siteId,
      siteNom: sites.nom,
      date: caisse.date,
      type: caisse.type,
      libelle: caisse.libelle,
      montant: caisse.montant,
      devise: caisse.devise,
      saisiPar: caisse.saisiPar,
      saisiParNom: user.name,
      statut: caisse.statut,
      annulePar: caisse.annulePar,
      motifAnnulation: caisse.motifAnnulation,
      annuleAt: caisse.annuleAt,
      createdAt: caisse.createdAt,
    })
    .from(caisse)
    .innerJoin(sites, eq(caisse.siteId, sites.id))
    .innerJoin(user, eq(caisse.saisiPar, user.id))
    .where(eq(caisse.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    siteId: row.siteId,
    siteNom: row.siteNom,
    date: row.date,
    type: row.type,
    libelle: row.libelle,
    montant: row.montant,
    devise: row.devise as "CDF" | "USD",
    saisiPar: row.saisiPar,
    saisiParNom: row.saisiParNom,
    statut: row.statut,
    annulePar: row.annulePar,
    motifAnnulation: row.motifAnnulation,
    annuleAt: row.annuleAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * Récupère les sites autorisés pour la caisse selon le rôle.
 * - Gérant : tous les sites actifs.
 * - Opérateur : uniquement les sites assignés où il a un poste aujourd'hui.
 * - Technicien : aucun site (pas d'accès à la caisse).
 */
export async function getCaisseAccessibleSites(
  userId: string,
  role: Role
): Promise<{ id: string; nom: string }[]> {
  if (role === "gerant") {
    const rows = await db
      .select({ id: sites.id, nom: sites.nom })
      .from(sites)
      .where(eq(sites.actif, true))
      .orderBy(asc(sites.nom));
    return rows;
  }

  if (role === "operateur") {
    // L'opérateur ne peut accéder qu'à ses sites assignés avec un poste aujourd'hui
    const [userAssignments, todayShift] = await Promise.all([
      db
        .select({ siteId: userSites.siteId })
        .from(userSites)
        .where(eq(userSites.userId, userId)),
      getTodayShiftSiteForCaisse(userId),
    ]);

    const allowedSiteIds = new Set(userAssignments.map((a) => a.siteId));

    if (!todayShift || !allowedSiteIds.has(todayShift.siteId)) {
      return [];
    }

    const rows = await db
      .select({ id: sites.id, nom: sites.nom })
      .from(sites)
      .where(
        and(eq(sites.id, todayShift.siteId), eq(sites.actif, true))
      );
    return rows;
  }

  // Technicien : aucun accès à la caisse
  return [];
}

/**
 * Récupère le poste d'aujourd'hui pour un utilisateur (spécifique à la caisse).
 */
async function getTodayShiftSiteForCaisse(userId: string) {
  const { getKinshasaDateIso } = await import("@/lib/time");
  const todayIso = getKinshasaDateIso();

  const rows = await db
    .select({
      siteId: shifts.siteId,
    })
    .from(shifts)
    .innerJoin(sites, eq(shifts.siteId, sites.id))
    .where(
      and(
        eq(shifts.userId, userId),
        eq(shifts.date, todayIso),
        eq(sites.actif, true)
      )
    )
    .limit(1);

  return rows[0] ?? null;
}
