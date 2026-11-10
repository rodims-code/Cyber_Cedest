import { ALL_SITES_LABEL } from "@/lib/site-constants";
import {
  getActiveSiteById,
  getAllActiveSites,
} from "@/features/sites/queries";

export type PlanningShift = {
  id: string;
  site: string;
  employe: string;
  fonction: string;
  debut: string;
  fin: string;
  poste: string;
};

export type PlanningDay = {
  jourLabel: string;
  dateLabel: string;
  isToday: boolean;
  shifts: PlanningShift[];
};

export type PlanningSemaine = {
  siteId: string | null;
  siteNom: string;
  isAll: boolean;
  days: PlanningDay[];
};

type ShiftTemplate = Omit<PlanningShift, "id" | "site">;

/**
 * Planning de démonstration par site.
 * Les tables shifts / planning seront branchées à l'étape dédiée ; en attendant,
 * les données restent strictement indexées par site pour que le switcher soit réel.
 */
const PLANNING_TEMPLATES: Record<string, ShiftTemplate[][]> = {
  KIMIALA: [
    [
      {
        employe: "Christelle M.",
        fonction: "Opérateur",
        debut: "08:00",
        fin: "16:00",
        poste: "Accueil",
      },
      {
        employe: "Jean K.",
        fonction: "Appui",
        debut: "10:00",
        fin: "18:00",
        poste: "Bureautique",
      },
    ],
    [
      {
        employe: "Christelle M.",
        fonction: "Opérateur",
        debut: "08:00",
        fin: "16:00",
        poste: "Accueil",
      },
      {
        employe: "Patrick L.",
        fonction: "Opérateur",
        debut: "08:00",
        fin: "14:00",
        poste: "Cyber",
      },
    ],
    [
      {
        employe: "Jean K.",
        fonction: "Appui",
        debut: "10:00",
        fin: "18:00",
        poste: "Bureautique",
      },
      {
        employe: "Patrick L.",
        fonction: "Opérateur",
        debut: "14:00",
        fin: "20:00",
        poste: "Cyber",
      },
    ],
    [
      {
        employe: "Christelle M.",
        fonction: "Opérateur",
        debut: "08:00",
        fin: "16:00",
        poste: "Accueil",
      },
      {
        employe: "Jean K.",
        fonction: "Appui",
        debut: "10:00",
        fin: "18:00",
        poste: "Bureautique",
      },
    ],
    [
      {
        employe: "Patrick L.",
        fonction: "Opérateur",
        debut: "08:00",
        fin: "14:00",
        poste: "Cyber",
      },
      {
        employe: "Christelle M.",
        fonction: "Opérateur",
        debut: "14:00",
        fin: "20:00",
        poste: "Accueil",
      },
    ],
    [
      {
        employe: "Jean K.",
        fonction: "Appui",
        debut: "09:00",
        fin: "15:00",
        poste: "Bureautique",
      },
      {
        employe: "Christelle M.",
        fonction: "Opérateur",
        debut: "09:00",
        fin: "15:00",
        poste: "Accueil",
      },
    ],
  ],
  SHELL: [
    [
      {
        employe: "Sarah T.",
        fonction: "Technicien",
        debut: "08:00",
        fin: "16:00",
        poste: "Wi-Fi",
      },
      {
        employe: "David N.",
        fonction: "Technicien",
        debut: "10:00",
        fin: "18:00",
        poste: "Solaire",
      },
    ],
    [
      {
        employe: "Sarah T.",
        fonction: "Technicien",
        debut: "08:00",
        fin: "16:00",
        poste: "Wi-Fi",
      },
      {
        employe: "Michel B.",
        fonction: "Appui",
        debut: "08:00",
        fin: "14:00",
        poste: "Technique",
      },
    ],
    [
      {
        employe: "David N.",
        fonction: "Technicien",
        debut: "10:00",
        fin: "18:00",
        poste: "Solaire",
      },
      {
        employe: "Sarah T.",
        fonction: "Technicien",
        debut: "14:00",
        fin: "20:00",
        poste: "Wi-Fi",
      },
    ],
    [
      {
        employe: "Michel B.",
        fonction: "Appui",
        debut: "08:00",
        fin: "14:00",
        poste: "Technique",
      },
      {
        employe: "David N.",
        fonction: "Technicien",
        debut: "10:00",
        fin: "18:00",
        poste: "Solaire",
      },
    ],
    [
      {
        employe: "Sarah T.",
        fonction: "Technicien",
        debut: "08:00",
        fin: "16:00",
        poste: "Wi-Fi",
      },
      {
        employe: "Michel B.",
        fonction: "Appui",
        debut: "14:00",
        fin: "20:00",
        poste: "Technique",
      },
    ],
    [
      {
        employe: "David N.",
        fonction: "Technicien",
        debut: "09:00",
        fin: "15:00",
        poste: "Solaire",
      },
      {
        employe: "Sarah T.",
        fonction: "Technicien",
        debut: "09:00",
        fin: "15:00",
        poste: "Wi-Fi",
      },
    ],
  ],
};

const KINSHASA_OFFSET_MS = 60 * 60 * 1000;

function getKinshasaWeekStart(): Date {
  const kinshasaNow = new Date(Date.now() + KINSHASA_OFFSET_MS);
  const dayOfWeek = (kinshasaNow.getUTCDay() + 6) % 7; // 0 = lundi

  return new Date(
    Date.UTC(
      kinshasaNow.getUTCFullYear(),
      kinshasaNow.getUTCMonth(),
      kinshasaNow.getUTCDate() - dayOfWeek
    )
  );
}

function getTodayIndex(): number | null {
  const kinshasaNow = new Date(Date.now() + KINSHASA_OFFSET_MS);
  const dayOfWeek = (kinshasaNow.getUTCDay() + 6) % 7;
  return dayOfWeek <= 5 ? dayOfWeek : null;
}

function templateForSite(nom: string): ShiftTemplate[][] {
  const normalized = nom.trim().toUpperCase();

  if (normalized.includes("KIMIALA")) {
    return PLANNING_TEMPLATES.KIMIALA;
  }

  if (normalized.includes("SHELL")) {
    return PLANNING_TEMPLATES.SHELL;
  }

  return [];
}

function buildPlanning(
  siteId: string | null,
  siteNom: string,
  isAll: boolean,
  sources: { site: string; template: ShiftTemplate[][] }[]
): PlanningSemaine {
  const weekStart = getKinshasaWeekStart();
  const todayIndex = getTodayIndex();

  const days: PlanningDay[] = Array.from({ length: 6 }, (_, index) => {
    const day = new Date(weekStart);
    day.setUTCDate(day.getUTCDate() + index);

    const jourLabel = new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      timeZone: "UTC",
    }).format(day);

    const dateLabel = new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    }).format(day);

    const shifts = sources.flatMap(({ site, template }) =>
      (template[index] ?? []).map((shift, shiftIndex) => ({
        id: `${site}-${index}-${shiftIndex}`,
        site,
        ...shift,
      }))
    );

    return {
      jourLabel,
      dateLabel,
      isToday: todayIndex === index,
      shifts,
    };
  });

  return { siteId, siteNom, isAll, days };
}

/**
 * Récupère le planning de la semaine filtré par site.
 * `siteId === null` correspond à la vue cumulée du gérant.
 */
export async function getPlanningSemaine(
  siteId: string | null
): Promise<PlanningSemaine> {
  if (siteId === null) {
    const activeSites = await getAllActiveSites();

    return buildPlanning(
      null,
      ALL_SITES_LABEL,
      true,
      activeSites.map((site) => ({
        site: site.nom,
        template: templateForSite(site.nom),
      }))
    );
  }

  const site = await getActiveSiteById(siteId);
  if (!site) {
    return buildPlanning(siteId, "Site indisponible", false, []);
  }

  return buildPlanning(site.id, site.nom, false, [
    { site: site.nom, template: templateForSite(site.nom) },
  ]);
}
