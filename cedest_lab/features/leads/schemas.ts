import { z } from "zod";
export const leadSchema = z.object({
  type: z.enum(["formation", "wifi", "solaire", "bureautique", "autre"]),
  nom: z.string().trim().min(2).max(255),
  telephone: z.string().trim().min(8).max(30),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  details: z.string().trim().max(4000).optional(),
  website: z.string().max(0).optional(),
});
