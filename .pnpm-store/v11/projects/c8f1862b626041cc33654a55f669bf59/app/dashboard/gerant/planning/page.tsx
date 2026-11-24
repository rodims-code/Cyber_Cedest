import { getCurrentSite } from "@/lib/current-site";
import { requireRole } from "@/lib/session";
import {
  getKinshasaWeekStartIso,
  getWeekdayIndex,
  isIsoDate,
} from "@/lib/time";
import { getPlanningWeek } from "@/features/planning/queries";
import { PlanningView } from "@/features/planning/components/planning-view";
import { NoSiteAssigned } from "@/features/sites/components/no-site-assigned";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ semaine?: string; action?: string }>;
}) {
  await requireRole(["gerant"]);

  const currentSite = await getCurrentSite();
  if (!currentSite.isAll && !currentSite.id) {
    return <NoSiteAssigned />;
  }

  const params = await searchParams;
  const requestedWeek = params.semaine;

  const weekStart =
    requestedWeek &&
    isIsoDate(requestedWeek) &&
    getWeekdayIndex(requestedWeek) === 0
      ? requestedWeek
      : getKinshasaWeekStartIso();

  const autoAction =
    params.action === "generer" || params.action === "copier"
      ? params.action
      : null;

  const data = await getPlanningWeek(
    weekStart,
    currentSite.isAll ? null : currentSite.id
  );

  return (
    <PlanningView
      key={`${data.weekStart}-${data.scopeSiteId ?? "all"}`}
      data={data}
      autoAction={autoAction}
    />
  );
}
