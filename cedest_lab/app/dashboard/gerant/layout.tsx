import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function GerantLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["gerant"]);
  return children;
}
