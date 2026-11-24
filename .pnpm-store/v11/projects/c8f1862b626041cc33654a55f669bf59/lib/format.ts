/**
 * Formatage partagé pour l'affichage des montants et des dates.
 * Les montants sont des entiers et la devise est toujours affichée explicitement.
 */

export type Devise = "USD" | "CDF";

export function formatMontant(montant: number, devise: Devise): string {
  const valeur = Math.round(montant);
  return `${valeur.toLocaleString("fr-FR")} ${devise}`;
}

export function formatHeureKinshasa(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Africa/Kinshasa",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDateCourteKinshasa(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Africa/Kinshasa",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateLongueKinshasa(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Africa/Kinshasa",
    dateStyle: "full",
  }).format(date);
}
