import { z } from "zod";
import { normalizeRdcPhone } from "@/src/lib/whatsapp";

// ---------------------------------------------------------------------------
// Téléphone RDC validé et normalisé
// ---------------------------------------------------------------------------
export const rdcPhoneSchema = z
  .string()
  .trim()
  .transform((val, ctx) => {
    const normalized = normalizeRdcPhone(val);
    if (!normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Numéro invalide. Exemple : 0812345678",
      });
      return val;
    }
    return normalized;
  });

// ---------------------------------------------------------------------------
// Champs communs
// ---------------------------------------------------------------------------
const baseLeadSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(2, "Le nom doit comporter au moins 2 caractères.")
    .max(80, "Le nom ne doit pas dépasser 80 caractères."),
  telephone: rdcPhoneSchema,
  message: z
    .string()
    .trim()
    .max(500, "Le message ne doit pas dépasser 500 caractères.")
    .optional()
    .or(z.literal("")),
  website: z.string().max(0, "Champ non autorisé.").optional(),
  site: z.string().trim().max(100).optional(),
});

// ---------------------------------------------------------------------------
// Détails par type (Union discriminée)
// ---------------------------------------------------------------------------
export const formationDetailsSchema = z.object({
  type: z.literal("formation"),
  mode: z.enum(["presentiel", "en_ligne"], {
    message: "Mode de formation requis.",
  }),
  formation: z.enum(
    ["initiation", "word", "excel", "powerpoint", "internet", "conseil"],
    {
      message: "Choix de formation requis.",
    }
  ),
  niveau: z.enum(["debutant", "intermediaire", "avance"], {
    message: "Niveau requis.",
  }),
  whatsapp: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val ? normalizeRdcPhone(val) ?? val : undefined)),
});

export const wifiDetailsSchema = z.object({
  type: z.literal("wifi"),
  lieu: z.enum(["maison", "boutique", "hopital_clinique", "autre"], {
    message: "Type de lieu requis.",
  }),
  commune: z
    .string()
    .trim()
    .min(2, "La commune est requise.")
    .max(100),
  quartier: z
    .string()
    .trim()
    .min(2, "Le quartier est requis.")
    .max(100),
  appareils: z
    .coerce
    .number()
    .int()
    .positive("Le nombre d’appareils doit être supérieur à zéro.")
    .optional(),
});

export const solaireDetailsSchema = z.object({
  type: z.literal("solaire"),
  lieu: z.enum(["maison", "boutique", "hopital_clinique", "autre"], {
    message: "Type de lieu requis.",
  }),
  commune: z
    .string()
    .trim()
    .min(2, "La commune est requise.")
    .max(100),
  quartier: z
    .string()
    .trim()
    .min(2, "Le quartier est requis.")
    .max(100),
  appareils: z
    .string()
    .trim()
    .max(300)
    .optional(),
});

export const contactDetailsSchema = z.object({
  type: z.literal("contact"),
  sujet: z.enum(["bureautique", "question"], {
    message: "Sujet requis.",
  }),
  travail: z
    .enum(["saisie", "impression", "photocopie", "autre"])
    .optional(),
}).refine(
  (data) => {
    if (data.sujet === "bureautique" && !data.travail) {
      return false;
    }
    return true;
  },
  {
    message: "Le type de travail est requis pour la bureautique.",
    path: ["travail"],
  }
);

export const leadDetailsUnion = z.discriminatedUnion("type", [
  formationDetailsSchema,
  wifiDetailsSchema,
  solaireDetailsSchema,
  contactDetailsSchema,
]);

// ---------------------------------------------------------------------------
// Schéma complet pour création d’un lead
// ---------------------------------------------------------------------------
export const createLeadSchema = baseLeadSchema.and(leadDetailsUnion);

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

// Schémas de statut et notes
export const leadStatusSchema = z.object({
  leadId: z.coerce.number().int().positive(),
  status: z.enum(["nouveau", "contacte", "en_cours", "termine", "annule"]),
});

export const leadNoteSchema = z.object({
  leadId: z.coerce.number().int().positive(),
  contenu: z.string().trim().min(1, "La note ne peut pas être vide.").max(2_000),
});
