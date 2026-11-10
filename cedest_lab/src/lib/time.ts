/**
 * Utilitaires de temps partagés.
 *
 * Règle du projet :
 * - les timestamps sont stockés en UTC ;
 * - les dates « métier » (planning, pointage) sont des jours calendaires de
 *   Kinshasa, représentés par une chaîne `YYYY-MM-DD` ;
 * - l'affichage se fait toujours en `Africa/Kinshasa`.
 */
export const KINSHASA_TIME_ZONE = "Africa/Kinshasa";

const KINSHASA_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: KINSHASA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const KINSHASA_TIME_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  timeZone: KINSHASA_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

/** Date calendaire de Kinshasa au format `YYYY-MM-DD`. */
export function getKinshasaDateIso(date: Date = new Date()): string {
  const parts = KINSHASA_DATE_FORMATTER.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Impossible de formater la date de Kinshasa.");
  }

  return `${year}-${month}-${day}`;
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** 0 = lundi … 5 = samedi, 6 = dimanche. */
export function getWeekdayIndex(dateIso: string): number {
  const date = new Date(`${dateIso}T12:00:00.000Z`);
  return (date.getUTCDay() + 6) % 7;
}

export function addDaysIso(dateIso: string, days: number): string {
  const date = new Date(`${dateIso}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Lundi de la semaine contenant `date`, au format `YYYY-MM-DD`. */
export function getKinshasaWeekStartIso(date: Date = new Date()): string {
  const todayIso = getKinshasaDateIso(date);
  return addDaysIso(todayIso, -getWeekdayIndex(todayIso));
}

export function getPreviousWeekStartIso(weekStartIso: string): string {
  return addDaysIso(weekStartIso, -7);
}

/** Les six jours ouvrés (lundi → samedi) à partir du lundi fourni. */
export function getWorkWeekDays(weekStartIso: string): string[] {
  return Array.from({ length: 6 }, (_, index) =>
    addDaysIso(weekStartIso, index)
  );
}

export function getKinshasaMonthStartIso(date: Date = new Date()): string {
  return `${getKinshasaDateIso(date).slice(0, 7)}-01`;
}

export function getKinshasaMonthEndIso(date: Date = new Date()): string {
  const todayIso = getKinshasaDateIso(date);
  const [year, month] = todayIso.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${todayIso.slice(0, 7)}-${String(lastDay).padStart(2, "0")}`;
}

export function formatHeureKinshasa(date: Date): string {
  return KINSHASA_TIME_FORMATTER.format(date);
}

/** Date calendaire (sans décalage de fuseau) au format « 10 nov. 2026 ». */
export function formatDateCourteIso(dateIso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateIso}T12:00:00.000Z`));
}

export function formatDateLongueIso(dateIso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    dateStyle: "full",
  }).format(new Date(`${dateIso}T12:00:00.000Z`));
}

export function formatJourSemaine(dateIso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    weekday: "long",
  }).format(new Date(`${dateIso}T12:00:00.000Z`));
}

/** Nombre d'heures décimal entre deux instants UTC. */
export function diffHeures(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / 3_600_000);
}

/** 7.5 → « 7 h 30 ». */
export function formatDuree(heures: number): string {
  const totalMinutes = Math.max(0, Math.round(heures * 60));
  const h = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes === 0
    ? `${h} h`
    : `${h} h ${String(minutes).padStart(2, "0")}`;
}

/** « 2026-11-10 » → objet Date à midi UTC (sans décalage de jour). */
export function isoDateToUtcNoon(dateIso: string): Date {
  return new Date(`${dateIso}T12:00:00.000Z`);
}
