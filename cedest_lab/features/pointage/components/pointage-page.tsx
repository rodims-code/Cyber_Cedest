import { getCurrentSite } from "@/lib/current-site";
import { requireRole } from "@/lib/session";
import { getKinshasaWeekStartIso } from "@/lib/time";
import {
  getMyHoursSummary,
  getMyPointages,
  getPointagesDuJour,
  getPunchContextForUser,
} from "@/features/pointage/queries";
import { PunchCard } from "@/features/pointage/components/punch-card";
import {
  PersonalPointageView,
  PointageView,
} from "@/features/pointage/components/pointage-view";
import { NoSiteAssigned } from "@/features/sites/components/no-site-assigned";

export async function PointagePage({
  role,
}: {
  role: "gerant" | "operateur" | "technicien";
}) {
  const session = await requireRole([role]);

  const currentSite = await getCurrentSite();
  if (!currentSite.isAll && !currentSite.id) {
    return <NoSiteAssigned />;
  }

  const punchContext = await getPunchContextForUser(session.user.id, role);
  const punchCard = <PunchCard {...punchContext} />;

  if (role === "gerant") {
    const data = await getPointagesDuJour(
      currentSite.isAll ? null : currentSite.id
    );

    return (
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {punchCard}
        <PointageView data={data} />
      </div>
    );
  }

  const [myPointages, hours] = await Promise.all([
    getMyPointages(session.user.id),
    getMyHoursSummary(session.user.id, getKinshasaWeekStartIso()),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {punchCard}
      <PersonalPointageView
        pointages={myPointages}
        weekHours={hours.weekHours}
        monthHours={hours.monthHours}
      />
    </div>
  );
}
