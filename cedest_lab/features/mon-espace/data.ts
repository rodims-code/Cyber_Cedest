// src/features/mon-espace/data.ts
//
// DONNÉES DE DÉMONSTRATION. Les tables shifts / pointages / caisse (étapes 8 à 11)
// n'existent pas encore. Quand elles seront prêtes, gardez les types ci-dessous
// et remplacez le corps de getMonEspace() par de vraies requêtes Drizzle.

import { getActiveSiteById } from "@/features/sites/queries";

export type SiteName = "KIMIALA" | "SHELL";
export type Fonction = "operateur" | "appui";

export type DayShift = { site: SiteName; fonction: Fonction } | null;

export type MonEspace = {
  /** Lundi à samedi (le dimanche reste à confirmer avec le gérant) */
  week: { shift: DayShift; hours: number }[];
  /** Index du jour courant dans `week` (0 = lundi), ou null le dimanche */
  todayIndex: number | null;
  weekStart: Date;
  pointage:
    | { state: "absent" }
    | { state: "en_poste"; since: string; site: SiteName }
    | { state: "termine"; from: string; to: string; site: SiteName };
  monthHours: number;
  pending: {
    heuresAValider: number;
    nouvellesDemandes: number;
    caisseManquante: SiteName[];
  };
};

const HOUR = 3_600_000;

/** Kinshasa est en UTC+1 toute l'année : on décale puis on lit en UTC. */
function nowInKinshasa() {
  return new Date(Date.now() + HOUR);
}

function siteMatches(site: SiteName, siteNom: string): boolean {
  return siteNom.trim().toUpperCase().includes(site);
}

export async function getMonEspace(
  _userId: string,
  siteId?: string | null
): Promise<MonEspace> {
  const k = nowInKinshasa();
  const dow = (k.getUTCDay() + 6) % 7; // 0 = lundi … 6 = dimanche
  const weekStart = new Date(
    Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate() - dow)
  );

  const base: MonEspace = {
    weekStart,
    todayIndex: dow <= 5 ? dow : null,
    week: [
      { shift: { site: "KIMIALA", fonction: "operateur" }, hours: 8 },
      { shift: { site: "KIMIALA", fonction: "operateur" }, hours: 7.5 },
      { shift: null, hours: 0 },
      { shift: { site: "SHELL", fonction: "appui" }, hours: 6.25 },
      { shift: { site: "KIMIALA", fonction: "operateur" }, hours: 9 },
      { shift: { site: "SHELL", fonction: "operateur" }, hours: 0 },
    ],
    pointage: { state: "en_poste", since: "08:12", site: "KIMIALA" },
    monthHours: 112.5,
    pending: {
      heuresAValider: 4,
      nouvellesDemandes: 3,
      caisseManquante: ["SHELL"],
    },
  };

  // Résolution du site sélectionné : on ne fait jamais confiance au nom côté client.
  let siteNom: string | null = null;
  if (siteId) {
    const site = await getActiveSiteById(siteId);
    siteNom = site?.nom ?? "__site_inconnu__";
  }

  // « Tous les sites » (gérant) : on conserve la vue personnelle complète.
  if (!siteNom) {
    return base;
  }

  const week = base.week.map((day) =>
    day.shift && siteMatches(day.shift.site, siteNom)
      ? day
      : { shift: null, hours: 0 }
  );

  const pointage: MonEspace["pointage"] =
    base.pointage.state !== "absent" &&
    !siteMatches(base.pointage.site, siteNom)
      ? { state: "absent" }
      : base.pointage;

  const weekHours = week.reduce((sum, day) => sum + day.hours, 0);

  return {
    ...base,
    week,
    pointage,
    monthHours: Math.round(weekHours * 4 * 10) / 10,
    pending: {
      ...base.pending,
      caisseManquante: base.pending.caisseManquante.filter((site) =>
        siteMatches(site, siteNom)
      ),
    },
  };
}
