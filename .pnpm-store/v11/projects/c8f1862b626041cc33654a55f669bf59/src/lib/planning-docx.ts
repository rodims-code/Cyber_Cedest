/**
 * Export Word du planning hebdomadaire.
 *
 * Aucune dépendance : le document est un fichier HTML aux normes Word
 * (en-tête mso, styles inline), servi en `.doc` avec le type
 * `application/msword`. Word et LibreOffice l'ouvrent sans conversion.
 *
 * Fonction pure : elle ne lit ni la base ni les en-têtes HTTP.
 */
import type { PlanningWeekData } from "@/features/planning/queries";
import {
  formatDateCourteIso,
  formatJourSemaine,
} from "@/lib/time";

const FONCTION_LABELS: Record<string, string> = {
  operateur: "Opérateur",
  appui: "Appui",
};

function capitalize(value: string): string {
  return value.length === 0
    ? value
    : value[0].toLocaleUpperCase("fr-FR") + value.slice(1);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cellContent(
  shifts: PlanningWeekData["shifts"],
  date: string,
  siteId: string
): string {
  const rows = shifts
    .filter((shift) => shift.date === date && shift.siteId === siteId)
    .sort((left, right) => left.userName.localeCompare(right.userName, "fr"));

  if (rows.length === 0) {
    return '<span style="color:#b91c1c;">—</span>';
  }

  return rows
    .map(
      (shift) =>
        `<div>${escapeHtml(shift.userName)} <span style="color:#555;">(${escapeHtml(
          FONCTION_LABELS[shift.fonction] ?? shift.fonction
        )})</span></div>`
    )
    .join("");
}

/**
 * Construit le document HTML/Word du planning.
 * `data` est la semaine telle que chargée par `getPlanningWeek`.
 */
export function buildPlanningExportHtml(data: PlanningWeekData): string {
  const { days, sites, shifts } = data;
  const firstDay = days[0];
  const lastDay = days[days.length - 1];
  const scopeLabel = data.scopeSiteId
    ? `Site ${escapeHtml(sites[0]?.nom ?? "")}`
    : "Tous les sites";

  const generatedAt = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Africa/Kinshasa",
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

  const headerCells = days
    .map(
      (date) =>
        `<th style="background:#1f2937;color:#ffffff;font-size:10pt;padding:8px 10px;border:1px solid #d1d5db;text-align:left;">${escapeHtml(
          capitalize(formatJourSemaine(date))
        )}<br><span style="font-weight:normal;font-size:8pt;">${escapeHtml(
          formatDateCourteIso(date)
        )}</span></th>`
    )
    .join("");

  const bodyRows = sites
    .map(
      (site) => `<tr>
  <td style="padding:8px 10px;border:1px solid #d1d5db;background:#f3f4f6;font-weight:bold;font-size:10pt;vertical-align:top;width:110px;">${escapeHtml(
        site.nom
      )}</td>
  ${days
    .map(
      (date) =>
        `<td style="padding:6px 10px;border:1px solid #d1d5db;font-size:9.5pt;vertical-align:top;">${cellContent(
          shifts,
          date,
          site.id
        )}</td>`
    )
    .join("\n  ")}
</tr>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<title>Planning — semaine du ${escapeHtml(firstDay)} au ${escapeHtml(lastDay)}</title>
<!--[if gte mso 9]><xml>
<w:WordDocument><w:View>Print</w:View><w:Zoom>90</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument>
</xml><![endif]-->
<style>
  @page { size: A4 landscape; margin: 1.4cm 1.2cm; }
  body { font-family: Calibri, Arial, sans-serif; font-size: 10pt; color: #111827; }
  table { border-collapse: collapse; width: 100%; table-layout: fixed; }
  .title { font-size: 16pt; font-weight: bold; margin: 0 0 2px 0; }
  .subtitle { font-size: 9pt; color: #4b5563; margin: 0 0 14px 0; }
  .footer { margin-top: 18px; font-size: 8pt; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 6px; }
</style>
</head>
<body>
  <p class="title">Cyber Cedest — Planning de la semaine</p>
  <p class="subtitle">Du ${escapeHtml(
    formatDateCourteIso(firstDay)
  )} au ${escapeHtml(formatDateCourteIso(lastDay))} · ${scopeLabel} · lundi au samedi</p>

  <table>
    <thead>
      <tr>
        <th style="background:#1f2937;color:#ffffff;font-size:10pt;padding:8px 10px;border:1px solid #d1d5db;text-align:left;width:110px;">Site</th>
        ${headerCells}
      </tr>
    </thead>
    <tbody>
${bodyRows}
    </tbody>
  </table>

  <p class="footer">Généré le ${escapeHtml(generatedAt)} · Cyber Cedest · Document interne. Les postes marqués « — » indiquent un site non couvert ce jour-là.</p>
</body>
</html>`;
}
