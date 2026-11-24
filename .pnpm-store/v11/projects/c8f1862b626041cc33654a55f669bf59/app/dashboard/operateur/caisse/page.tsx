import { requireRole } from "@/lib/session";
import { getCurrentSite } from "@/lib/current-site";
import {
  getCaisseEntriesForDay,
  getCaisseJourTotals,
} from "@/features/caisse/queries";
import { getKinshasaDateIso } from "@/lib/time";
import { CaisseSaisie } from "@/features/caisse/components/caisse-saisie";
import { NoSiteAssigned } from "@/features/sites/components/no-site-assigned";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireRole(["operateur"]);

  const currentSite = await getCurrentSite();
  if (!currentSite.id) {
    return <NoSiteAssigned />;
  }

  const todayIso = getKinshasaDateIso();
  const [entries, totals] = await Promise.all([
    getCaisseEntriesForDay(currentSite.id, todayIso),
    getCaisseJourTotals(currentSite.id, todayIso),
  ]);

  return (
    <CaisseSaisie
      site={{ id: currentSite.id, nom: currentSite.nom ?? "" }}
      initialEntries={entries}
      initialTotals={totals}
    />
  );
}
