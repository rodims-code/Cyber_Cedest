import { z } from "zod";

import {
  SITE_NAME_MAX_LENGTH,
  SITE_NAME_MIN_LENGTH,
} from "@/config/site";

const siteNameSchema = z
  .string()
  .trim()
  .min(
    SITE_NAME_MIN_LENGTH,
    `Le nom du site doit comporter au moins ${SITE_NAME_MIN_LENGTH} caractères.`
  )
  .max(
    SITE_NAME_MAX_LENGTH,
    `Le nom du site ne peut pas dépasser ${SITE_NAME_MAX_LENGTH} caractères.`
  )
  .regex(
    /^[\p{L}\p{N}][\p{L}\p{N}\s'’.-]*$/u,
    "Le nom du site contient des caractères non autorisés."
  );

export const createSiteSchema = z.object({
  nom: siteNameSchema,
});

export const renameSiteSchema = z.object({
  id: z.string().trim().min(1, "Site invalide."),
  nom: siteNameSchema,
});

export const toggleSiteSchema = z.object({
  id: z.string().trim().min(1, "Site invalide."),
  actif: z.enum(["true", "false"]),
});
