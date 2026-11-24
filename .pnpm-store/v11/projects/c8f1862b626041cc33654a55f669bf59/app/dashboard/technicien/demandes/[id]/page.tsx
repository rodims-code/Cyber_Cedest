import { LeadDetail } from "@/features/leads/components/lead-detail";
import { requireRole } from "@/lib/session";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { role } = await requireRole(["technicien"]);
  return <LeadDetail role={role} id={Number((await params).id)} />;
}
