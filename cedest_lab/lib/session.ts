import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isRole, Role } from "@/lib/permissions";
export async function getSession() { return auth.api.getSession({ headers: await headers() }); }
export async function requireSession() { const session = await getSession(); if (!session) redirect("/login"); return session; }
export async function requireRole(roles?: Role[]) { const session = await requireSession(); const role = isRole(session.user.role) ? session.user.role : null; if (!role || (roles && !roles.includes(role))) redirect("/dashboard"); return { ...session, role }; }
