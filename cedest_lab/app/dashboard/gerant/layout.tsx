import { requireRole } from "@/lib/session";

export default async function GerantLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["gerant"]);
  return children;
}
