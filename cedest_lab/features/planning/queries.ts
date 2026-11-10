import { and, asc, eq, inArray, isNull, or } from "drizzle-orm";

import { db } from "@/app/db";
import { shifts, sites, user } from "@/app/db/schema";
import { getAllActiveSites } from "@/features/sites/queries";
import {
  getPreviousWeekStartIso,
  getWorkWeekDays,
} from "@/lib/time";

export type PlanningOperator = {
  id: string;
  nom: string;
};

export type PlanningSiteOption = {
  id: string;
  nom: string;
};

export type PlanningShiftRow = {
  id: number;
  date: string;
  siteId: string;
  userId: string;
  fonction: "operateur" | "appui";
  userName: string;
};

export type PlanningWeekData = {
  weekStart: string;
  days: string[];
  sites: PlanningSiteOption[];
  operators: PlanningOperator[];
  shifts: PlanningShiftRow[];
  previousShifts: PlanningShiftRow[];
  scopeSiteId: string | null;
};

export type PersonalShift = {
  date: string;
  siteId: string;
  siteNom: string;
  fonction: "operateur" | "appui";
};

/**
 * Opérateurs actifs (non bannis) pouvant être planifiés.
 * Le rôle « appui » est une fonction du poste, pas un rôle de compte.
 */
export async function getActiveOperators(): Promise<PlanningOperator[]> {
  const rows = await db
    .select({ id: user.id, nom: user.name })
    .from(user)
    .where(
      and(
        eq(user.role, "operateur"),
        or(eq(user.banned, false), isNull(user.banned))
      )
    )
    .orderBy(asc(user.name));

  return rows;
}

async function getShiftRows(
  days: string[],
  scopeSiteId: string | null
): Promise<PlanningShiftRow[]> {
  if (days.length === 0) return [];

  const rows = await db
    .select({
      id: shifts.id,
      date: shifts.date,
      siteId: shifts.siteId,
      userId: shifts.userId,
      fonction: shifts.fonction,
      userName: user.name,
    })
    .from(shifts)
    .innerJoin(user, eq(shifts.userId, user.id))
    .innerJoin(sites, eq(shifts.siteId, sites.id))
    .where(
      and(
        inArray(shifts.date, days),
        eq(sites.actif, true),
        scopeSiteId ? eq(shifts.siteId, scopeSiteId) : undefined
      )
    )
    .orderBy(asc(shifts.date), asc(user.name));

  return rows;
}

/**
 * Charge tout ce qu'il faut pour préparer une semaine :
 * sites actifs, opérateurs actifs, postes déjà enregistrés et postes de la
 * semaine précédente (rotation / copie).
 */
export async function getPlanningWeek(
  weekStart: string,
  scopeSiteId: string | null
): Promise<PlanningWeekData> {
  const days = getWorkWeekDays(weekStart);
  const previousDays = getWorkWeekDays(getPreviousWeekStartIso(weekStart));

  const [activeSites, operators, currentShifts, previousShifts] =
    await Promise.all([
      getAllActiveSites(),
      getActiveOperators(),
      getShiftRows(days, scopeSiteId),
      getShiftRows(previousDays, scopeSiteId),
    ]);

  const scopedSites = scopeSiteId
    ? activeSites.filter((site) => site.id === scopeSiteId)
    : activeSites;

  return {
    weekStart,
    days,
    sites: scopedSites.map((site) => ({ id: site.id, nom: site.nom })),
    operators,
    shifts: currentShifts,
    previousShifts,
    scopeSiteId,
  };
}

/** Planning personnel d'un employé pour une semaine donnée. */
export async function getPersonalWeekShifts(
  userId: string,
  weekStart: string
): Promise<PersonalShift[]> {
  const days = getWorkWeekDays(weekStart);

  return db
    .select({
      date: shifts.date,
      siteId: shifts.siteId,
      siteNom: sites.nom,
      fonction: shifts.fonction,
    })
    .from(shifts)
    .innerJoin(sites, eq(shifts.siteId, sites.id))
    .where(and(eq(shifts.userId, userId), inArray(shifts.date, days)))
    .orderBy(asc(shifts.date));
}

/** Poste prévu pour un employé à une date donnée, s'il existe. */
export async function getShiftForUserOnDate(
  userId: string,
  dateIso: string
): Promise<PersonalShift | null> {
  const rows = await db
    .select({
      date: shifts.date,
      siteId: shifts.siteId,
      siteNom: sites.nom,
      fonction: shifts.fonction,
    })
    .from(shifts)
    .innerJoin(sites, eq(shifts.siteId, sites.id))
    .where(and(eq(shifts.userId, userId), eq(shifts.date, dateIso)))
    .limit(1);

  return rows[0] ?? null;
}
