import { and, asc, desc, eq, gte, isNull, lte, or } from "drizzle-orm";

import { db } from "@/app/db";
import { pointages, shifts, sites, user } from "@/app/db/schema";
import { getActiveSiteById, getSitesForUser } from "@/features/sites/queries";
import { getShiftForUserOnDate } from "@/features/planning/queries";
import { ALL_SITES_LABEL, type SiteOption } from "@/lib/site-constants";
import type { Role } from "@/lib/permissions";
import {
  diffHeures,
  formatDateLongueIso,
  formatHeureKinshasa,
  getKinshasaDateIso,
  getKinshasaMonthEndIso,
  getKinshasaMonthStartIso,
  getWorkWeekDays,
} from "@/lib/time";

export type PointageStatut = "present" | "retard" | "absent";

export type PointageEntry = {
  id: string;
  site: string;
  employe: string;
  fonction: string;
  arrivee: string | null;
  depart: string | null;
  statut: PointageStatut;
  heures: number;
};

export type PointageJour = {
  siteId: string | null;
  siteNom: string;
  isAll: boolean;
  dateKinshasa: string;
  entries: PointageEntry[];
  totals: {
    presents: number;
    retards: number;
    absents: number;
    heures: number;
  };
};

export type OpenPointage = {
  id: number;
  siteId: string;
  siteNom: string;
  date: string;
  arriveeIso: string;
  arriveeLabel: string;
};

export type MyPointage = {
  id: number;
  date: string;
  siteNom: string;
  arriveeLabel: string;
  departLabel: string | null;
  heures: number;
  enCours: boolean;
};

export type MyPointageHours = {
  date: string;
  heures: number;
  enCours: boolean;
};

const fonctionLabels = {
  operateur: "Opérateur",
  appui: "Appui",
} as const;

/**
 * Pointage ouvert d'un employé (départ non pointé), s'il existe.
 * L'index partiel `pointages_user_open_unique` garantit l'unicité en base.
 */
export async function getOpenPointageForUser(
  userId: string
): Promise<OpenPointage | null> {
  const rows = await db
    .select({
      id: pointages.id,
      siteId: pointages.siteId,
      siteNom: sites.nom,
      date: pointages.date,
      arrivee: pointages.arrivee,
    })
    .from(pointages)
    .innerJoin(sites, eq(pointages.siteId, sites.id))
    .where(and(eq(pointages.userId, userId), isNull(pointages.depart)))
    .orderBy(desc(pointages.arrivee))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    siteId: row.siteId,
    siteNom: row.siteNom,
    date: row.date,
    arriveeIso: row.arrivee.toISOString(),
    arriveeLabel: formatHeureKinshasa(row.arrivee),
  };
}

/** Pointages récents d'un employé. Aucun accès à ceux des autres. */
export async function getMyPointages(
  userId: string,
  limit = 20
): Promise<MyPointage[]> {
  const rows = await db
    .select({
      id: pointages.id,
      date: pointages.date,
      siteNom: sites.nom,
      arrivee: pointages.arrivee,
      depart: pointages.depart,
    })
    .from(pointages)
    .innerJoin(sites, eq(pointages.siteId, sites.id))
    .where(eq(pointages.userId, userId))
    .orderBy(desc(pointages.arrivee))
    .limit(limit);

  return rows.map((row) => {
    const end = row.depart ?? new Date();
    return {
      id: row.id,
      date: row.date,
      siteNom: row.siteNom,
      arriveeLabel: formatHeureKinshasa(row.arrivee),
      departLabel: row.depart ? formatHeureKinshasa(row.depart) : null,
      heures: diffHeures(row.arrivee, end),
      enCours: row.depart === null,
    };
  });
}

async function getMyPointageHoursBetween(
  userId: string,
  startIso: string,
  endIso: string
): Promise<MyPointageHours[]> {
  const rows = await db
    .select({
      date: pointages.date,
      arrivee: pointages.arrivee,
      depart: pointages.depart,
    })
    .from(pointages)
    .where(
      and(
        eq(pointages.userId, userId),
        gte(pointages.date, startIso),
        lte(pointages.date, endIso)
      )
    );

  return rows.map((row) => {
    const end = row.depart ?? new Date();
    return {
      date: row.date,
      heures: diffHeures(row.arrivee, end),
      enCours: row.depart === null,
    };
  });
}

/**
 * Heures personnelles de la semaine et du mois.
 * Les pointages ouverts comptent jusqu'à l'instant du rendu serveur.
 */
export async function getMyHoursSummary(
  userId: string,
  weekStart: string
): Promise<{
  weekByDate: Map<string, number>;
  weekHours: number;
  monthHours: number;
}> {
  const weekDays = getWorkWeekDays(weekStart);
  const monthStart = getKinshasaMonthStartIso();
  const monthEnd = getKinshasaMonthEndIso();

  const [weekRows, monthRows] = await Promise.all([
    getMyPointageHoursBetween(userId, weekDays[0], weekDays[weekDays.length - 1]),
    getMyPointageHoursBetween(userId, monthStart, monthEnd),
  ]);

  const weekByDate = new Map<string, number>();
  for (const row of weekRows) {
    weekByDate.set(row.date, (weekByDate.get(row.date) ?? 0) + row.heures);
  }

  return {
    weekByDate,
    weekHours: weekRows.reduce((total, row) => total + row.heures, 0),
    monthHours: monthRows.reduce((total, row) => total + row.heures, 0),
  };
}

/**
 * Pointages du jour pour un site, ou pour tous les sites actifs.
 *
 * Les employés planifiés aujourd'hui mais sans pointage sont ajoutés en
 * « absent ». Le retard reste à 0 tant que les horaires d'un poste ne sont pas
 * définis dans le README.
 */
export async function getPointagesDuJour(
  siteId: string | null
): Promise<PointageJour> {
  const todayIso = getKinshasaDateIso();
  const site = siteId ? await getActiveSiteById(siteId) : null;

  const [pointageRows, shiftRows] = await Promise.all([
    db
      .select({
        id: pointages.id,
        userId: pointages.userId,
        siteNom: sites.nom,
        employe: user.name,
        fonction: shifts.fonction,
        arrivee: pointages.arrivee,
        depart: pointages.depart,
      })
      .from(pointages)
      .innerJoin(user, eq(pointages.userId, user.id))
      .innerJoin(sites, eq(pointages.siteId, sites.id))
      .leftJoin(
        shifts,
        and(
          eq(shifts.userId, pointages.userId),
          eq(shifts.date, pointages.date)
        )
      )
      .where(
        and(
          eq(pointages.date, todayIso),
          eq(sites.actif, true),
          siteId ? eq(pointages.siteId, siteId) : undefined
        )
      )
      .orderBy(asc(pointages.arrivee)),
    db
      .select({
        id: shifts.id,
        userId: shifts.userId,
        siteNom: sites.nom,
        employe: user.name,
        fonction: shifts.fonction,
      })
      .from(shifts)
      .innerJoin(user, eq(shifts.userId, user.id))
      .innerJoin(sites, eq(shifts.siteId, sites.id))
      .where(
        and(
          eq(shifts.date, todayIso),
          eq(sites.actif, true),
          or(eq(user.banned, false), isNull(user.banned)),
          siteId ? eq(shifts.siteId, siteId) : undefined
        )
      )
      .orderBy(asc(sites.nom), asc(user.name)),
  ]);

  const pointageUserIds = new Set(
    pointageRows.map((row) => row.userId)
  );

  const entries: PointageEntry[] = pointageRows.map((row) => {
    const end = row.depart ?? new Date();
    return {
      id: String(row.id),
      site: row.siteNom,
      employe: row.employe,
      fonction: row.fonction ? fonctionLabels[row.fonction] : "—",
      arrivee: formatHeureKinshasa(row.arrivee),
      depart: row.depart ? formatHeureKinshasa(row.depart) : null,
      statut: "present",
      heures: diffHeures(row.arrivee, end),
    };
  });

  for (const shift of shiftRows) {
    if (pointageUserIds.has(shift.userId)) continue;
    entries.push({
      id: `absent-${shift.id}`,
      site: shift.siteNom,
      employe: shift.employe,
      fonction: fonctionLabels[shift.fonction],
      arrivee: null,
      depart: null,
      statut: "absent",
      heures: 0,
    });
  }

  entries.sort((left, right) => {
    if (left.statut !== right.statut) {
      return left.statut === "present" ? -1 : 1;
    }
    return left.employe.localeCompare(right.employe, "fr");
  });

  const presents = entries.filter((entry) => entry.statut === "present").length;
  const absents = entries.filter((entry) => entry.statut === "absent").length;
  const heures = entries.reduce((total, entry) => total + entry.heures, 0);

  return {
    siteId: site?.id ?? null,
    siteNom: site ? site.nom : ALL_SITES_LABEL,
    isAll: siteId === null,
    dateKinshasa: formatDateLongueIso(todayIso),
    entries,
    totals: {
      presents,
      retards: 0,
      absents,
      heures,
    },
  };
}

/** Totaux légers pour la carte « Pointages du jour » du tableau de bord. */
export async function getPointageStatsDuJour(siteId: string | null): Promise<{
  presents: number;
  retards: number;
  absents: number;
}> {
  const data = await getPointagesDuJour(siteId);
  return {
    presents: data.totals.presents,
    retards: data.totals.retards,
    absents: data.totals.absents,
  };
}

export type PunchContextData = {
  openPointage: OpenPointage | null;
  /** Site imposé par le planning du jour, ou null. */
  todayShift: { siteId: string; siteNom: string } | null;
  /** Sites actifs que l'utilisateur est autorisé à pointer. */
  sites: SiteOption[];
};

/**
 * Tout ce dont la carte « Pointage » a besoin pour un utilisateur :
 * pointage ouvert, poste planifié aujourd'hui (site imposé) et sites
 * autorisés quand aucun poste n'est prévu.
 */
export async function getPunchContextForUser(
  userId: string,
  role: Role
): Promise<PunchContextData> {
  const todayIso = getKinshasaDateIso();

  const [openPointage, plannedShift, allowedSites] = await Promise.all([
    getOpenPointageForUser(userId),
    getShiftForUserOnDate(userId, todayIso),
    getSitesForUser(userId, role),
  ]);

  const plannedSite = plannedShift
    ? await getActiveSiteById(plannedShift.siteId)
    : null;

  return {
    openPointage,
    todayShift: plannedSite
      ? { siteId: plannedSite.id, siteNom: plannedSite.nom }
      : null,
    sites: allowedSites.map((site) => ({ id: site.id, nom: site.nom })),
  };
}
