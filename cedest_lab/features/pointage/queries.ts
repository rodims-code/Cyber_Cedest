import { ALL_SITES_LABEL } from "@/lib/site-constants";
import { formatDateLongueKinshasa } from "@/lib/format";
import {
  getActiveSiteById,
  getAllActiveSites,
} from "@/features/sites/queries";

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

type PointageTemplate = Omit<PointageEntry, "id" | "site">;

/**
 * Pointages de démonstration par site.
 * À remplacer par la table pointages lorsque l'étape correspondante sera prête.
 * Les totaux sont cohérents avec les statistiques de la vue d'ensemble.
 */
const POINTAGE_TEMPLATES: Record<string, PointageTemplate[]> = {
  KIMIALA: [
    {
      employe: "Christelle M.",
      fonction: "Opérateur",
      arrivee: "08:02",
      depart: "16:05",
      statut: "present",
      heures: 8,
    },
    {
      employe: "Jean K.",
      fonction: "Appui",
      arrivee: "10:12",
      depart: "18:00",
      statut: "retard",
      heures: 7.5,
    },
    {
      employe: "Patrick L.",
      fonction: "Opérateur",
      arrivee: "08:00",
      depart: "14:00",
      statut: "present",
      heures: 6,
    },
    {
      employe: "Mireille N.",
      fonction: "Opérateur",
      arrivee: "08:05",
      depart: "16:00",
      statut: "present",
      heures: 8,
    },
    {
      employe: "Esther M.",
      fonction: "Opérateur",
      arrivee: "08:00",
      depart: "12:00",
      statut: "present",
      heures: 4,
    },
    {
      employe: "Gédéon T.",
      fonction: "Appui",
      arrivee: "08:03",
      depart: "16:00",
      statut: "present",
      heures: 8,
    },
    {
      employe: "Nadine K.",
      fonction: "Opérateur",
      arrivee: "08:01",
      depart: "16:00",
      statut: "present",
      heures: 8,
    },
  ],
  SHELL: [
    {
      employe: "Sarah T.",
      fonction: "Technicien",
      arrivee: "08:00",
      depart: "16:00",
      statut: "present",
      heures: 8,
    },
    {
      employe: "David N.",
      fonction: "Technicien",
      arrivee: "10:00",
      depart: "18:00",
      statut: "present",
      heures: 8,
    },
    {
      employe: "Michel B.",
      fonction: "Appui",
      arrivee: "08:04",
      depart: "14:00",
      statut: "present",
      heures: 6,
    },
    {
      employe: "Rachel K.",
      fonction: "Technicien",
      arrivee: "08:00",
      depart: "16:00",
      statut: "present",
      heures: 8,
    },
    {
      employe: "Paul M.",
      fonction: "Appui",
      arrivee: null,
      depart: null,
      statut: "absent",
      heures: 0,
    },
  ],
};

function templateForSite(nom: string): PointageTemplate[] {
  const normalized = nom.trim().toUpperCase();

  if (normalized.includes("KIMIALA")) {
    return POINTAGE_TEMPLATES.KIMIALA;
  }

  if (normalized.includes("SHELL")) {
    return POINTAGE_TEMPLATES.SHELL;
  }

  return [];
}

function buildPointageJour(
  siteId: string | null,
  siteNom: string,
  isAll: boolean,
  sources: { site: string; template: PointageTemplate[] }[]
): PointageJour {
  const entries: PointageEntry[] = sources.flatMap(({ site, template }) =>
    template.map((entry, index) => ({
      id: `${site}-${index}`,
      site,
      ...entry,
    }))
  );

  return {
    siteId,
    siteNom,
    isAll,
    dateKinshasa: formatDateLongueKinshasa(),
    entries,
    totals: {
      presents: entries.filter((entry) => entry.statut === "present").length,
      retards: entries.filter((entry) => entry.statut === "retard").length,
      absents: entries.filter((entry) => entry.statut === "absent").length,
      heures: entries.reduce((sum, entry) => sum + entry.heures, 0),
    },
  };
}

/**
 * Récupère les pointages du jour filtrés par site.
 * `siteId === null` correspond à la vue cumulée du gérant.
 */
export async function getPointagesDuJour(
  siteId: string | null
): Promise<PointageJour> {
  if (siteId === null) {
    const activeSites = await getAllActiveSites();

    return buildPointageJour(
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
    return buildPointageJour(siteId, "Site indisponible", false, []);
  }

  return buildPointageJour(site.id, site.nom, false, [
    { site: site.nom, template: templateForSite(site.nom) },
  ]);
}
