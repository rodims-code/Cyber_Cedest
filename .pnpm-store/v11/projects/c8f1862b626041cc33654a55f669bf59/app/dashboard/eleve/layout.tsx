import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function EleveLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["gerant"]);
  return children;
}
