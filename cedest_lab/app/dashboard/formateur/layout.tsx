import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function FormateurLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["gerant"]);
  return children;
}
