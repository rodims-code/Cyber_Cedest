import { getCurrentSite } from "@/lib/current-site";
import { requireRole } from "@/lib/session";
import { getHeuresSemaine } from "@/features/heures/queries";
import { HeuresView } from "@/features/heures/components/heures-view";
import { NoSiteAssigned } from "@/features/sites/components/no-site-assigned";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireRole(["gerant"]);

  const currentSite = await getCurrentSite();
  if (!currentSite.isAll && !currentSite.id) {
    return <NoSiteAssigned />;
  }

  const data = await getHeuresSemaine(
    currentSite.isAll ? null : currentSite.id
  );

  return <HeuresView data={data} />;
}
