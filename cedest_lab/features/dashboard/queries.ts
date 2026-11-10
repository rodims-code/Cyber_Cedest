import { ALL_SITES_LABEL } from "@/lib/site-constants";
import type { Devise } from "@/lib/format";
import {
  getActiveSiteById,
  getAllActiveSites,
} from "@/features/sites/queries";

export type CaisseDuJourStats = {
  soldeActuel: number;
  entrees: number;
  sorties: number;
  nombreOperations: number;
  devise: Devise;
  dateKinshasa: string;
};

export type VueEnsembleStats = {
  chiffreAffairesMois: number;
  croissancePct: number;
  clientsDuJour: number;
  postesOccupes: number;
  postesTotal: number;
  tauxOccupationPct: number;
  devise: Devise;
};

export type PointageStats = {
  presents: number;
  retards: number;
  absents: number;
};

export type ActiviteRecente = {
  id: string;
  description: string;
  montant?: number;
  devise?: Devise;
  type: "vente" | "service" | "depense";
  heure: string;
};

export type SiteStats = {
  siteId: string | null;
  siteNom: string;
  isAll: boolean;
  caisseDuJour: CaisseDuJourStats;
  vueEnsemble: VueEnsembleStats;
  pointages: PointageStats;
  activiteRecente: ActiviteRecente[];
};

export type CaisseDuJourData = CaisseDuJourStats & {
  siteId: string | null;
  siteNom: string;
  isAll: boolean;
  operations: ActiviteRecente[];
};

type SiteProfile = {
  caisseDuJour: Omit<CaisseDuJourStats, "dateKinshasa">;
  vueEnsemble: VueEnsembleStats;
  pointages: PointageStats;
  activiteRecente: ActiviteRecente[];
};

/**
 * Données de démonstration par site.
 * Les tables d'exploitation (caisse, pointages, planning) n'existent pas encore ;
 * ce module centralise les chiffres afin que chaque requête reste filtrée par site.
 */
const SITE_PROFILES: Record<string, SiteProfile> = {
  KIMIALA: {
    caisseDuJour: {
      soldeActuel: 485,
      entrees: 560,
      sorties: 75,
      nombreOperations: 38,
      devise: "USD",
    },
    vueEnsemble: {
      chiffreAffairesMois: 6850,
      croissancePct: 14,
      clientsDuJour: 74,
      postesOccupes: 18,
      postesTotal: 24,
      tauxOccupationPct: 75,
      devise: "USD",
    },
    pointages: {
      presents: 6,
      retards: 1,
      absents: 0,
    },
    activiteRecente: [
      {
        id: "k-1",
        description: "Abonnement Internet VIP 1 mois",
        montant: 50,
        devise: "USD",
        type: "vente",
        heure: "11:42",
      },
      {
        id: "k-2",
        description: "Impression et reliure documents officiels",
        montant: 15,
        devise: "USD",
        type: "service",
        heure: "10:15",
      },
      {
        id: "k-3",
        description: "Achat rames papier A4",
        montant: 25,
        devise: "USD",
        type: "depense",
        heure: "09:30",
      },
    ],
  },
  SHELL: {
    caisseDuJour: {
      soldeActuel: 290,
      entrees: 330,
      sorties: 40,
      nombreOperations: 24,
      devise: "USD",
    },
    vueEnsemble: {
      chiffreAffairesMois: 4200,
      croissancePct: 8,
      clientsDuJour: 49,
      postesOccupes: 11,
      postesTotal: 16,
      tauxOccupationPct: 69,
      devise: "USD",
    },
    pointages: {
      presents: 4,
      retards: 0,
      absents: 1,
    },
    activiteRecente: [
      {
        id: "s-1",
        description: "Tickets session Cyber 2h (x5)",
        montant: 10,
        devise: "USD",
        type: "vente",
        heure: "12:10",
      },
      {
        id: "s-2",
        description: "Plastification et scans dossiers",
        montant: 12,
        devise: "USD",
        type: "service",
        heure: "11:05",
      },
      {
        id: "s-3",
        description: "Recharge carburant groupe secours",
        montant: 40,
        devise: "USD",
        type: "depense",
        heure: "08:45",
      },
    ],
  },
};

function emptyProfile(): SiteProfile {
  return {
    caisseDuJour: {
      soldeActuel: 0,
      entrees: 0,
      sorties: 0,
      nombreOperations: 0,
      devise: "USD",
    },
    vueEnsemble: {
      chiffreAffairesMois: 0,
      croissancePct: 0,
      clientsDuJour: 0,
      postesOccupes: 0,
      postesTotal: 0,
      tauxOccupationPct: 0,
      devise: "USD",
    },
    pointages: {
      presents: 0,
      retards: 0,
      absents: 0,
    },
    activiteRecente: [],
  };
}

function profileForSiteName(nom: string): SiteProfile {
  const normalized = nom.trim().toUpperCase();

  if (normalized.includes("KIMIALA")) {
    return SITE_PROFILES.KIMIALA;
  }

  if (normalized.includes("SHELL")) {
    return SITE_PROFILES.SHELL;
  }

  // Site nouvellement créé : aucune donnée d'exploitation pour l'instant.
  return emptyProfile();
}

function aggregateProfiles(profiles: SiteProfile[]): SiteProfile {
  const totalChiffreAffaires = profiles.reduce(
    (sum, profile) => sum + profile.vueEnsemble.chiffreAffairesMois,
    0
  );

  const croissancePct =
    totalChiffreAffaires > 0
      ? Math.round(
          profiles.reduce(
            (sum, profile) =>
              sum +
              profile.vueEnsemble.croissancePct *
                profile.vueEnsemble.chiffreAffairesMois,
            0
          ) / totalChiffreAffaires
        )
      : 0;

  const postesOccupes = profiles.reduce(
    (sum, profile) => sum + profile.vueEnsemble.postesOccupes,
    0
  );
  const postesTotal = profiles.reduce(
    (sum, profile) => sum + profile.vueEnsemble.postesTotal,
    0
  );

  return {
    caisseDuJour: {
      soldeActuel: profiles.reduce(
        (sum, profile) => sum + profile.caisseDuJour.soldeActuel,
        0
      ),
      entrees: profiles.reduce(
        (sum, profile) => sum + profile.caisseDuJour.entrees,
        0
      ),
      sorties: profiles.reduce(
        (sum, profile) => sum + profile.caisseDuJour.sorties,
        0
      ),
      nombreOperations: profiles.reduce(
        (sum, profile) => sum + profile.caisseDuJour.nombreOperations,
        0
      ),
      devise: "USD",
    },
    vueEnsemble: {
      chiffreAffairesMois: totalChiffreAffaires,
      croissancePct,
      clientsDuJour: profiles.reduce(
        (sum, profile) => sum + profile.vueEnsemble.clientsDuJour,
        0
      ),
      postesOccupes,
      postesTotal,
      tauxOccupationPct:
        postesTotal > 0 ? Math.round((postesOccupes / postesTotal) * 100) : 0,
      devise: "USD",
    },
    pointages: {
      presents: profiles.reduce(
        (sum, profile) => sum + profile.pointages.presents,
        0
      ),
      retards: profiles.reduce(
        (sum, profile) => sum + profile.pointages.retards,
        0
      ),
      absents: profiles.reduce(
        (sum, profile) => sum + profile.pointages.absents,
        0
      ),
    },
    activiteRecente: profiles
      .flatMap((profile) => profile.activiteRecente)
      .sort((a, b) => b.heure.localeCompare(a.heure))
      .slice(0, 5),
  };
}

/**
 * Renvoie l'heure/date formatée dans le fuseau horaire de Kinshasa
 * (Africa/Kinshasa, UTC+1).
 */
export function getKinshasaDateString(): string {
  const d = new Date();
  return new Intl.DateTimeFormat("fr-CD", {
    timeZone: "Africa/Kinshasa",
    dateStyle: "full",
  }).format(d);
}

function toSiteStats(
  profile: SiteProfile,
  siteId: string | null,
  siteNom: string,
  isAll: boolean
): SiteStats {
  return {
    siteId,
    siteNom,
    isAll,
    ...profile,
    caisseDuJour: {
      ...profile.caisseDuJour,
      dateKinshasa: getKinshasaDateString(),
    },
  };
}

/**
 * Récupère les métriques de vue d'ensemble et de caisse filtrées par `siteId`.
 *
 * - `siteId` non null : seules les données de ce site sont renvoyées.
 * - `siteId === null` : vue cumulée de tous les sites actifs (gérant uniquement).
 * - Un site inconnu/inactif renvoie des zéros, jamais le cumul global.
 */
export async function getDashboardStats(
  siteId: string | null
): Promise<SiteStats> {
  if (siteId === null) {
    const activeSites = await getAllActiveSites();
    const profile =
      activeSites.length > 0
        ? aggregateProfiles(
            activeSites.map((site) => profileForSiteName(site.nom))
          )
        : emptyProfile();

    return toSiteStats(profile, null, ALL_SITES_LABEL, true);
  }

  const site = await getActiveSiteById(siteId);
  if (!site) {
    return toSiteStats(emptyProfile(), siteId, "Site indisponible", false);
  }

  return toSiteStats(
    profileForSiteName(site.nom),
    site.id,
    site.nom,
    false
  );
}

/**
 * Récupère la caisse du jour filtrée par site.
 * `siteId === null` correspond à la vue cumulée du gérant.
 */
export async function getCaisseDuJour(
  siteId: string | null
): Promise<CaisseDuJourData> {
  const stats = await getDashboardStats(siteId);

  return {
    ...stats.caisseDuJour,
    siteId: stats.siteId,
    siteNom: stats.siteNom,
    isAll: stats.isAll,
    operations: stats.activiteRecente,
  };
}
