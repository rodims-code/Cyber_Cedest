import { LeadList } from "@/features/leads/components/lead-list";
import { requireRole } from "@/lib/session";

export default async function Page({ searchParams }: { searchParams: Promise<{ type?: string; status?: string }> }) {
  const { role } = await requireRole(["operateur"]);
  return <LeadList role={role} filters={await searchParams} />;
}
