import { getCurrentSite } from "@/lib/current-site";
import { requireRole } from "@/lib/session";
import { getCaisseDuJour } from "@/features/dashboard/queries";
import { CaisseView } from "@/features/caisse/components/caisse-view";
import { NoSiteAssigned } from "@/features/sites/components/no-site-assigned";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireRole(["operateur"]);

  const currentSite = await getCurrentSite();
  if (!currentSite.isAll && !currentSite.id) {
    return <NoSiteAssigned />;
  }

  const data = await getCaisseDuJour(
    currentSite.isAll ? null : currentSite.id
  );

  return <CaisseView data={data} />;
}
