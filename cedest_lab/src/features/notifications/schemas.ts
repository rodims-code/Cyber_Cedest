import { z } from "zod";

import { NOTIFICATION_TYPES } from "./types";

export const listNotificationsSchema = z.object({
  tab: z.enum(["all", "unread"]).default("all"),
  type: z.enum([...NOTIFICATION_TYPES, "all"]).default("all"),
  cursor: z.string().max(64).nullish(),
  limit: z.number().int().min(1).max(50).default(20),
});

export const notificationIdSchema = z.object({
  id: z.number().int().positive(),
});

export const quickLeadStatusSchema = z.object({
  leadId: z.number().int().positive(),
  status: z.enum(["nouveau", "en_cours", "converti", "annule"]),
});

export const quickLeadNoteSchema = z.object({
  leadId: z.number().int().positive(),
  contenu: z
    .string()
    .trim()
    .min(2, "La note doit contenir au moins 2 caractères.")
    .max(2000, "La note est trop longue."),
});
