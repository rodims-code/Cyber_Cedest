// src/features/mon-espace/data.ts
//
// DONNÉES DE DÉMONSTRATION. Les tables shifts / pointages / caisse (étapes 8 à 11)
// n'existent pas encore. Quand elles seront prêtes, gardez les types ci-dessous
// et remplacez le corps de getMonEspace() par de vraies requêtes Drizzle.

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

export async function getMonEspace(_userId: string): Promise<MonEspace> {
  const k = nowInKinshasa();
  const dow = (k.getUTCDay() + 6) % 7; // 0 = lundi … 6 = dimanche
  const weekStart = new Date(
    Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate() - dow),
  );

  return {
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
}