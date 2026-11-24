import { getCurrentSite } from "@/lib/current-site";
import { requireRole } from "@/lib/session";
import { getKinshasaWeekStartIso, getWeekdayIndex, isIsoDate } from "@/lib/time";
import { getPlanningWeek } from "@/features/planning/queries";
import { buildPlanningExportHtml } from "@/src/lib/planning-docx";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await requireRole(["gerant"]);

  const currentSite = await getCurrentSite();

  const url = new URL(request.url);
  const requested = url.searchParams.get("semaine");
  const weekStart =
    requested && isIsoDate(requested) && getWeekdayIndex(requested) === 0
      ? requested
      : getKinshasaWeekStartIso();

  const data = await getPlanningWeek(
    weekStart,
    currentSite.isAll ? null : currentSite.id
  );

  const html = buildPlanningExportHtml(data);

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "application/msword; charset=utf-8",
      "Content-Disposition": `attachment; filename="planning-${weekStart}.doc"`,
      "Cache-Control": "no-store",
    },
  });
}
