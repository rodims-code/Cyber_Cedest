"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/app/db";
import { sites } from "@/app/db/schema";
import { MAX_SITES } from "@/config/site";
import { requireRole } from "@/lib/session";
import {
  createSiteSchema,
  renameSiteSchema,
  toggleSiteSchema,
} from "@/features/sites/schemas";
import { getAllSitesWithUsage } from "@/features/sites/queries";

export type SiteActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
};

function normalizeName(value: string): string {
  return value.trim().toLocaleUpperCase("fr-FR");
}

function revalidateSites() {
  revalidatePath("/dashboard/gerant/parametres");
  revalidatePath("/", "layout");
}

export async function createSiteAction(
  _prevState: SiteActionState,
  formData: FormData
): Promise<SiteActionState> {
  await requireRole(["gerant"]);

  const parsed = createSiteSchema.safeParse({
    nom: formData.get("nom"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Nom de site invalide.",
    };
  }

  const allSites = await getAllSitesWithUsage();
  const activeCount = allSites.filter((site) => site.actif).length;

  if (activeCount >= MAX_SITES) {
    return {
      ok: false,
      error: `Limite atteinte : ${MAX_SITES} sites actifs maximum. Désactivez un site avant d'en créer un autre.`,
    };
  }

  const normalized = normalizeName(parsed.data.nom);
  if (allSites.some((site) => normalizeName(site.nom) === normalized)) {
    return {
      ok: false,
      error: "Un site porte déjà ce nom.",
    };
  }

  await db.insert(sites).values({
    nom: parsed.data.nom,
    actif: true,
  });

  revalidateSites();
  return { ok: true, message: "Le site a été créé." };
}

export async function renameSiteAction(
  _prevState: SiteActionState,
  formData: FormData
): Promise<SiteActionState> {
  await requireRole(["gerant"]);

  const parsed = renameSiteSchema.safeParse({
    id: formData.get("id"),
    nom: formData.get("nom"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Informations invalides.",
    };
  }

  const allSites = await getAllSitesWithUsage();
  const site = allSites.find((row) => row.id === parsed.data.id);
  if (!site) {
    return { ok: false, error: "Ce site n'existe pas." };
  }

  const normalized = normalizeName(parsed.data.nom);
  const duplicate = allSites.some(
    (row) =>
      row.id !== parsed.data.id && normalizeName(row.nom) === normalized
  );

  if (duplicate) {
    return { ok: false, error: "Un autre site porte déjà ce nom." };
  }

  if (site.nom === parsed.data.nom) {
    return { ok: true, message: "Le nom n'a pas changé." };
  }

  await db
    .update(sites)
    .set({ nom: parsed.data.nom })
    .where(eq(sites.id, parsed.data.id));

  revalidateSites();
  return { ok: true, message: "Le site a été renommé." };
}

export async function toggleSiteAction(
  _prevState: SiteActionState,
  formData: FormData
): Promise<SiteActionState> {
  await requireRole(["gerant"]);

  const parsed = toggleSiteSchema.safeParse({
    id: formData.get("id"),
    actif: formData.get("actif"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Informations invalides.",
    };
  }

  const targetActive = parsed.data.actif === "true";
  const allSites = await getAllSitesWithUsage();
  const site = allSites.find((row) => row.id === parsed.data.id);

  if (!site) {
    return { ok: false, error: "Ce site n'existe pas." };
  }

  if (site.actif === targetActive) {
    return {
      ok: true,
      message: targetActive ? "Le site est déjà actif." : "Le site est déjà inactif.",
    };
  }

  const activeCount = allSites.filter((row) => row.actif).length;

  if (targetActive && activeCount >= MAX_SITES) {
    return {
      ok: false,
      error: `Limite atteinte : ${MAX_SITES} sites actifs maximum.`,
    };
  }

  if (!targetActive && activeCount <= 1) {
    return {
      ok: false,
      error: "Au moins un site doit rester actif.",
    };
  }

  await db
    .update(sites)
    .set({ actif: targetActive })
    .where(eq(sites.id, parsed.data.id));

  revalidateSites();
  return {
    ok: true,
    message: targetActive ? "Le site a été réactivé." : "Le site a été désactivé.",
  };
}
