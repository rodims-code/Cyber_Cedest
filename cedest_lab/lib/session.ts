import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isRole, Role } from "@/lib/permissions";
export async function getSession() {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch {
    // DB indisponible, session expirée ou toute autre erreur réseau :
    // on retourne null pour permettre une redirection propre vers /login.
    return null;
  }
}
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.banned) redirect("/login");
  return session;
}
export async function requireRole(roles?: Role[]) { const session = await requireSession(); const role = isRole(session.user.role) ? session.user.role : null; if (!role) redirect("/login"); if (roles && !roles.includes(role)) redirect(`/dashboard/${role}`); return { ...session, role }; }
