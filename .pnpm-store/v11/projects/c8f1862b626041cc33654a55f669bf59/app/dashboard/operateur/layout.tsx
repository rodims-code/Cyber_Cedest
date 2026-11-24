import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function OperateurLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["operateur"]);
  return children;
}
