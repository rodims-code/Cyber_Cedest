import { z } from "zod";

export const caisseTypeEnum = z.enum(["recette", "depense", "fourniture"]);

export const createCaisseEntrySchema = z.object({
  siteId: z.string().trim().min(1, "Site invalide."),
  type: caisseTypeEnum,
  libelle: z.string().trim().min(1, "Le libellé est requis.").max(255),
  montant: z
    .number()
    .int("Le montant doit être un entier.")
    .positive("Le montant doit être strictement positif."),
  devise: z.enum(["CDF", "USD"]),
});

export const cancelCaisseEntrySchema = z.object({
  id: z.number().int().positive(),
  motifAnnulation: z.string().trim().min(1, "Le motif est obligatoire.").max(500),
});

export type CreateCaisseEntryInput = z.infer<typeof createCaisseEntrySchema>;
export type CancelCaisseEntryInput = z.infer<typeof cancelCaisseEntrySchema>;
