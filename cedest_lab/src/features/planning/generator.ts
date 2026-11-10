/**
 * Générateur pur de planning hebdomadaire.
 *
 * Règles :
 * - chaque site actif reçoit au moins `MIN_PAR_SITE` opérateur chaque jour ;
 * - les effectifs sont répartis équitablement entre les sites (écart ≤ 1) ;
 * - quand l'effectif est impair, le site qui reçoit la personne en plus alterne
 *   d'un jour à l'autre ;
 * - la rotation tient compte de la semaine précédente pour éviter qu'un
 *   opérateur reste toujours sur le même site ;
 * - les jours de repos sont exclus ;
 * - si l'effectif est insuffisant, le jour n'est pas rempli automatiquement :
 *   un avertissement est renvoyé pour que le gérant choisisse les sites à
 *   couvrir.
 *
 * Aucune dépendance à la base de données ni à React : cette fonction est
 * testable seule.
 */
export const MIN_PAR_SITE = 1;

export type PlanningFonction = "operateur" | "appui";

export type PlanningOperator = {
  id: string;
  nom?: string;
};

export type PlanningSite = {
  id: string;
  nom?: string;
};

export type PreviousShift = {
  date: string;
  siteId: string;
  userId: string;
};

export type GeneratePlanningInput = {
  operators: PlanningOperator[];
  sites: PlanningSite[];
  /** Jours ouvrés au format `YYYY-MM-DD`, dans l'ordre. */
  days: string[];
  /** Jours de repos par identifiant d'opérateur. */
  restDays?: Record<string, string[]>;
  /** Postes de la semaine précédente, pour la rotation. */
  previousWeek?: PreviousShift[];
  /** Nombre minimum d'opérateurs par site et par jour (1 par défaut). */
  minPerSite?: number;
};

export type GeneratedShift = {
  date: string;
  siteId: string;
  userId: string;
  fonction: "operateur";
};

export type PlanningWarningCode =
  | "insufficient_staff"
  | "no_sites"
  | "no_operators";

export type PlanningWarning = {
  /** `null` pour un avertissement global. */
  date: string | null;
  code: PlanningWarningCode;
  message: string;
  available?: number;
  required?: number;
};

export type GeneratePlanningResult = {
  shifts: GeneratedShift[];
  warnings: PlanningWarning[];
  complete: boolean;
};

type CountMap = Map<string, Map<string, number>>;

function bumpCount(map: CountMap, userId: string, siteId: string): void {
  const perSite = map.get(userId) ?? new Map<string, number>();
  perSite.set(siteId, (perSite.get(siteId) ?? 0) + 1);
  map.set(userId, perSite);
}

function countOf(map: CountMap, userId: string, siteId: string): number {
  return map.get(userId)?.get(siteId) ?? 0;
}

/** 0 = lundi … 6 = dimanche, sans dépendre du fuseau local. */
function weekdayIndex(dateIso: string): number {
  return (new Date(`${dateIso}T12:00:00.000Z`).getUTCDay() + 6) % 7;
}

/**
 * Génère une proposition de planning. Le résultat est un brouillon : il n'est
 * jamais enregistré par cette fonction.
 */
export function generatePlanning(
  input: GeneratePlanningInput
): GeneratePlanningResult {
  const {
    operators,
    sites,
    days,
    restDays = {},
    previousWeek = [],
    minPerSite = MIN_PAR_SITE,
  } = input;

  if (sites.length === 0) {
    return {
      shifts: [],
      warnings: [
        {
          date: null,
          code: "no_sites",
          message:
            "Aucun site actif : activez au moins un site avant de générer le planning.",
        },
      ],
      complete: false,
    };
  }

  if (operators.length === 0) {
    return {
      shifts: [],
      warnings: [
        {
          date: null,
          code: "no_operators",
          message:
            "Aucun opérateur actif : ajoutez un opérateur avant de générer le planning.",
        },
      ],
      complete: false,
    };
  }

  const minimum = Math.max(1, Math.floor(minPerSite));
  const siteIds = new Set(sites.map((site) => site.id));
  const operatorIds = new Set(operators.map((operator) => operator.id));

  const previousCounts: CountMap = new Map();
  const previousSameWeekday = new Map<string, string>();
  const lastSiteByUser = new Map<string, string>();
  const lastDateByUser = new Map<string, string>();

  for (const shift of previousWeek) {
    if (!operatorIds.has(shift.userId) || !siteIds.has(shift.siteId)) {
      continue;
    }

    bumpCount(previousCounts, shift.userId, shift.siteId);
    previousSameWeekday.set(
      `${shift.userId}|${weekdayIndex(shift.date)}`,
      shift.siteId
    );

    const lastDate = lastDateByUser.get(shift.userId);
    if (!lastDate || shift.date >= lastDate) {
      lastDateByUser.set(shift.userId, shift.date);
      lastSiteByUser.set(shift.userId, shift.siteId);
    }
  }

  const currentCounts: CountMap = new Map();
  const shifts: GeneratedShift[] = [];
  const warnings: PlanningWarning[] = [];

  days.forEach((date, dayIndex) => {
    const available = operators.filter(
      (operator) => !(restDays[operator.id] ?? []).includes(date)
    );

    const required = sites.length * minimum;

    if (available.length < required) {
      warnings.push({
        date,
        code: "insufficient_staff",
        message: `Effectif insuffisant : ${available.length} opérateur(s) disponible(s) pour ${required} poste(s) minimum. Choisissez manuellement les sites à couvrir.`,
        available: available.length,
        required,
      });
      return;
    }

    // Répartition équilibrée : tout le monde a `base`, puis les sites
    // supplémentaires tournent d'un jour à l'autre.
    const base = Math.floor(available.length / sites.length);
    const extra = available.length % sites.length;
    const extraStart = dayIndex % sites.length;

    const targets = sites.map((_site, index) => {
      const distance = (index - extraStart + sites.length) % sites.length;
      return base + (distance < extra ? 1 : 0);
    });

    const slots: string[] = [];
    for (let offset = 0; offset < sites.length; offset += 1) {
      const siteIndex = (extraStart + offset) % sites.length;
      for (let count = 0; count < targets[siteIndex]; count += 1) {
        slots.push(sites[siteIndex].id);
      }
    }

    const assignedToday = new Set<string>();

    for (const siteId of slots) {
      let selected: PlanningOperator | null = null;
      let selectedScore = Number.POSITIVE_INFINITY;

      for (const operator of available) {
        if (assignedToday.has(operator.id)) continue;

        const score =
          1000 * (lastSiteByUser.get(operator.id) === siteId ? 1 : 0) +
          500 *
            (previousSameWeekday.get(
              `${operator.id}|${weekdayIndex(date)}`
            ) === siteId
              ? 1
              : 0) +
          40 * countOf(previousCounts, operator.id, siteId) +
          30 * countOf(currentCounts, operator.id, siteId);

        if (score < selectedScore) {
          selectedScore = score;
          selected = operator;
        }
      }

      // Ne peut pas arriver : le nombre de créneaux est égal au nombre
      // d'opérateurs disponibles.
      if (!selected) {
        throw new Error(
          "Impossible d'affecter un opérateur : effectif incohérent."
        );
      }

      assignedToday.add(selected.id);
      shifts.push({
        date,
        siteId,
        userId: selected.id,
        fonction: "operateur",
      });
      bumpCount(currentCounts, selected.id, siteId);
      lastSiteByUser.set(selected.id, siteId);
    }
  });

  return {
    shifts,
    warnings,
    complete: warnings.length === 0,
  };
}
