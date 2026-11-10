import { getCurrentSite } from "@/lib/current-site";
import { requireRole } from "@/lib/session";
import { getPlanningSemaine } from "@/features/planning/queries";
import { PlanningView } from "@/features/planning/components/planning-view";
import { NoSiteAssigned } from "@/features/sites/components/no-site-assigned";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireRole(["gerant"]);

  const currentSite = await getCurrentSite();
  if (!currentSite.isAll && !currentSite.id) {
    return <NoSiteAssigned />;
  }

  const data = await getPlanningSemaine(
    currentSite.isAll ? null : currentSite.id
  );

  return <PlanningView data={data} />;
}
