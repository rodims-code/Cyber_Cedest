import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function TechnicienLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["technicien"]);
  return children;
}
