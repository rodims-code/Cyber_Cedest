import { z } from "zod";

/**
 * Entrée du pointage d'arrivée.
 *
 * `siteId` n'est utile que lorsqu'aucun poste n'est planifié aujourd'hui :
 * dans ce cas l'employé choisit le site où il commence. L'heure n'est jamais
 * fournie par le client, elle vient toujours du serveur.
 */
export const punchInSchema = z.object({
  siteId: z
    .string()
    .trim()
    .min(1, "Site invalide.")
    .nullable()
    .optional()
    .transform((value) => value ?? null),
});

export type PunchInInput = z.infer<typeof punchInSchema>;
