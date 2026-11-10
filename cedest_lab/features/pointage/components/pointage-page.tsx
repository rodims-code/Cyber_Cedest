import { getCurrentSite } from "@/lib/current-site";
import { requireRole } from "@/lib/session";
import { getPointagesDuJour } from "@/features/pointage/queries";
import { PointageView } from "@/features/pointage/components/pointage-view";
import { NoSiteAssigned } from "@/features/sites/components/no-site-assigned";

export async function PointagePage({
  role,
}: {
  role: "gerant" | "operateur" | "technicien";
}) {
  await requireRole([role]);

  const currentSite = await getCurrentSite();
  if (!currentSite.isAll && !currentSite.id) {
    return <NoSiteAssigned />;
  }

  const data = await getPointagesDuJour(
    currentSite.isAll ? null : currentSite.id
  );

  return <PointageView data={data} />;
}
