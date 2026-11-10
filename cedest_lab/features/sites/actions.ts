"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { isRole } from "@/lib/permissions";
import { getSitesForUser } from "@/features/sites/queries";
import {
  ALL_SITES_VALUE,
  SITE_COOKIE_NAME,
} from "@/lib/site-constants";

export type SetSiteResult = {
  ok: boolean;
  error?: string;
  currentSiteId?: string;
};

/**
 * Définit le site actif de l'utilisateur connecté dans un cookie httpOnly.
 * La permission est impérativement contrôlée côté serveur : le client ne peut
 * pas contourner cette vérification en modifiant le cookie.
 */
export async function setCurrentSite(siteId: string): Promise<SetSiteResult> {
  const session = await getSession();
  if (!session?.user) {
    return { ok: false, error: "Non authentifié" };
  }

  const role = isRole(session.user.role) ? session.user.role : null;
  if (!role) {
    return { ok: false, error: "Rôle non autorisé" };
  }

  const normalizedSiteId = typeof siteId === "string" ? siteId.trim() : "";
  if (!normalizedSiteId) {
    return { ok: false, error: "Site invalide." };
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  };

  // 1. Vue cumulée : seul le gérant y a accès.
  if (normalizedSiteId === ALL_SITES_VALUE) {
    if (role !== "gerant") {
      return {
        ok: false,
        error: "Seul le gérant a accès à la vue cumulée de tous les sites.",
      };
    }

    const cookieStore = await cookies();
    cookieStore.set(SITE_COOKIE_NAME, ALL_SITES_VALUE, cookieOptions);

    revalidatePath("/", "layout");
    return { ok: true, currentSiteId: ALL_SITES_VALUE };
  }

  // 2. Site précis : vérifier qu'il est actif et autorisé pour l'utilisateur.
  const allowedSites = await getSitesForUser(session.user.id, role);
  const targetSite = allowedSites.find(
    (site) => site.id === normalizedSiteId && site.actif
  );

  if (!targetSite) {
    return {
      ok: false,
      error: "Accès refusé : ce site n'existe pas ou ne vous est pas attribué.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(SITE_COOKIE_NAME, targetSite.id, cookieOptions);

  revalidatePath("/", "layout");
  return { ok: true, currentSiteId: targetSite.id };
}
