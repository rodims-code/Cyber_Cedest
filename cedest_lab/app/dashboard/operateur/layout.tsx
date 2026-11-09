import { requireRole } from "@/lib/session";

export default async function OperateurLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["operateur"]);
  return children;
}
