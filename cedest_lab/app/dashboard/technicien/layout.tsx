import { requireRole } from "@/lib/session";

export default async function TechnicienLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["technicien"]);
  return children;
}
