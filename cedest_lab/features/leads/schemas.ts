import { z } from "zod";

export const leadSchema = z.object({
  type: z.enum(["formation", "wifi", "solaire", "bureautique", "autre"]),
  nom: z.string().trim().min(2, "Le nom doit comporter au moins 2 caractères").max(255),
  telephone: z.string().trim().min(8, "Le numéro de téléphone est invalide").max(30),
  email: z.union([z.string().email("Adresse e-mail invalide"), z.literal("")]).optional(),
  site: z.string().trim().max(100).optional(),
  details: z.string().trim().max(4000).optional(),
  website: z.string().max(0).optional(),
});

export const leadStatusSchema = z.object({
  leadId: z.coerce.number().int().positive(),
  status: z.enum(["nouveau", "en_cours", "converti", "annule"]),
});

export const leadNoteSchema = z.object({
  leadId: z.coerce.number().int().positive(),
  contenu: z.string().trim().min(1, "La note ne peut pas être vide").max(2_000),
});
