// src/features/mon-espace/data.ts
//
// Données personnelles réelles : le planning vient de la table `shifts`,
// les pointages et les heures de la table `pointages`.

import { getPersonalWeekShifts } from "@/features/planning/queries";
import { getLeadsForRole } from "@/features/leads/queries";
import {
  getMyHoursSummary,
  getMyPointages,
  getOpenPointageForUser,
} from "@/features/pointage/queries";
import {
  getKinshasaDateIso,
  getKinshasaWeekStartIso,
  getWeekdayIndex,
  getWorkWeekDays,
  isoDateToUtcNoon,
} from "@/lib/time";
import type { Role } from "@/lib/permissions";

export type Fonction = "operateur" | "appui";

export type DayShift = {
  siteId: string;
  site: string;
  fonction: Fonction;
} | null;

export type MonEspace = {
  /** Lundi à samedi (le dimanche reste à confirmer avec le gérant) */
  week: { shift: DayShift; hours: number }[];
  /** Index du jour courant dans `week` (0 = lundi), ou null le dimanche */
  todayIndex: number | null;
  weekStart: Date;
  pointage:
    | { state: "absent" }
    | { state: "en_poste"; since: string; site: string }
    | { state: "termine"; from: string; to: string; site: string };
  monthHours: number;
  pending: {
    heuresAValider: number;
    nouvellesDemandes: number;
    caisseManquante: string[];
  };
};

export async function getMonEspace(
  userId: string,
  role: Role
): Promise<MonEspace> {
  const todayIso = getKinshasaDateIso();
  const weekStartIso = getKinshasaWeekStartIso();
  const days = getWorkWeekDays(weekStartIso);
  const todayIndex = getWeekdayIndex(todayIso);

  const [personalShifts, leads, openPointage, hoursSummary, latestPointages] =
    await Promise.all([
      getPersonalWeekShifts(userId, weekStartIso),
      getLeadsForRole(role),
      getOpenPointageForUser(userId),
      getMyHoursSummary(userId, weekStartIso),
      getMyPointages(userId, 1),
    ]);

  const shiftsByDate = new Map(
    personalShifts.map((shift) => [shift.date, shift])
  );

  const week = days.map((date) => {
    const shift = shiftsByDate.get(date);
    return {
      shift: shift
        ? {
            siteId: shift.siteId,
            site: shift.siteNom,
            fonction: shift.fonction,
          }
        : null,
      // Les heures viennent des pointages réels du jour, pas du planning :
      // les horaires des postes ne sont pas encore définis dans le README.
      hours: hoursSummary.weekByDate.get(date) ?? 0,
    };
  });

  const closedToday = latestPointages.find(
    (pointage) => pointage.date === todayIso && !pointage.enCours
  );

  let pointage: MonEspace["pointage"] = { state: "absent" };
  if (openPointage) {
    pointage = {
      state: "en_poste",
      since: openPointage.arriveeLabel,
      site: openPointage.siteNom,
    };
  } else if (closedToday) {
    pointage = {
      state: "termine",
      from: closedToday.arriveeLabel,
      to: closedToday.departLabel ?? "—",
      site: closedToday.siteNom,
    };
  }

  return {
    weekStart: isoDateToUtcNoon(weekStartIso),
    todayIndex: todayIndex <= 5 ? todayIndex : null,
    week,
    pointage,
    monthHours: hoursSummary.monthHours,
    pending: {
      heuresAValider: 0,
      nouvellesDemandes: leads.filter((lead) => lead.status === "nouveau")
        .length,
      caisseManquante: [],
    },
  };
}
