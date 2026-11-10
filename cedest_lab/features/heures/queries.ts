import { ALL_SITES_LABEL } from "@/lib/site-constants";
import {
  getActiveSiteById,
  getAllActiveSites,
} from "@/features/sites/queries";

export type HeuresEntry = {
  id: string;
  site: string;
  employe: string;
  fonction: string;
  heuresSemaine: number;
  heuresMois: number;
};

export type HeuresSemaine = {
  siteId: string | null;
  siteNom: string;
  isAll: boolean;
  entries: HeuresEntry[];
  totalSemaine: number;
  totalMois: number;
};

type HeuresTemplate = Omit<HeuresEntry, "id" | "site">;

/**
 * Relevés d'heures de démonstration par site.
 * Les montants de paie ne sont pas calculés tant que la formule de rémunération
 * n'est pas validée ; seules les heures sont exposées ici.
 */
const HEURES_TEMPLATES: Record<string, HeuresTemplate[]> = {
  KIMIALA: [
    {
      employe: "Christelle M.",
      fonction: "Opérateur",
      heuresSemaine: 44,
      heuresMois: 176,
    },
    {
      employe: "Jean K.",
      fonction: "Appui",
      heuresSemaine: 40,
      heuresMois: 160,
    },
    {
      employe: "Patrick L.",
      fonction: "Opérateur",
      heuresSemaine: 36,
      heuresMois: 144,
    },
    {
      employe: "Mireille N.",
      fonction: "Opérateur",
      heuresSemaine: 40,
      heuresMois: 160,
    },
    {
      employe: "Esther M.",
      fonction: "Opérateur",
      heuresSemaine: 32,
      heuresMois: 128,
    },
    {
      employe: "Gédéon T.",
      fonction: "Appui",
      heuresSemaine: 40,
      heuresMois: 160,
    },
    {
      employe: "Nadine K.",
      fonction: "Opérateur",
      heuresSemaine: 40,
      heuresMois: 160,
    },
  ],
  SHELL: [
    {
      employe: "Sarah T.",
      fonction: "Technicien",
      heuresSemaine: 40,
      heuresMois: 160,
    },
    {
      employe: "David N.",
      fonction: "Technicien",
      heuresSemaine: 40,
      heuresMois: 160,
    },
    {
      employe: "Michel B.",
      fonction: "Appui",
      heuresSemaine: 36,
      heuresMois: 144,
    },
    {
      employe: "Rachel K.",
      fonction: "Technicien",
      heuresSemaine: 40,
      heuresMois: 160,
    },
    {
      employe: "Paul M.",
      fonction: "Appui",
      heuresSemaine: 24,
      heuresMois: 96,
    },
  ],
};

function templateForSite(nom: string): HeuresTemplate[] {
  const normalized = nom.trim().toUpperCase();

  if (normalized.includes("KIMIALA")) {
    return HEURES_TEMPLATES.KIMIALA;
  }

  if (normalized.includes("SHELL")) {
    return HEURES_TEMPLATES.SHELL;
  }

  return [];
}

function buildHeuresSemaine(
  siteId: string | null,
  siteNom: string,
  isAll: boolean,
  sources: { site: string; template: HeuresTemplate[] }[]
): HeuresSemaine {
  const entries: HeuresEntry[] = sources.flatMap(({ site, template }) =>
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
    entries,
    totalSemaine: entries.reduce(
      (sum, entry) => sum + entry.heuresSemaine,
      0
    ),
    totalMois: entries.reduce((sum, entry) => sum + entry.heuresMois, 0),
  };
}

/**
 * Récupère les heures de la semaine filtrées par site.
 * `siteId === null` correspond à la vue cumulée du gérant.
 */
export async function getHeuresSemaine(
  siteId: string | null
): Promise<HeuresSemaine> {
  if (siteId === null) {
    const activeSites = await getAllActiveSites();

    return buildHeuresSemaine(
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
    return buildHeuresSemaine(siteId, "Site indisponible", false, []);
  }

  return buildHeuresSemaine(site.id, site.nom, false, [
    { site: site.nom, template: templateForSite(site.nom) },
  ]);
}
