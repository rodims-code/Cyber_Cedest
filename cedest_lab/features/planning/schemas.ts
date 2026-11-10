import { z } from "zod";

import { isIsoDate } from "@/lib/time";

export const planningShiftSchema = z.object({
  date: z.string().refine(isIsoDate, "Date invalide."),
  siteId: z.string().trim().min(1, "Site invalide."),
  userId: z.string().trim().min(1, "Employé invalide."),
  fonction: z.enum(["operateur", "appui"]),
});

export const savePlanningSchema = z.object({
  weekStart: z.string().refine(isIsoDate, "Semaine invalide."),
  scopeSiteId: z.string().trim().min(1).nullable(),
  shifts: z.array(planningShiftSchema).max(500, "Le planning est trop volumineux."),
});

export type PlanningShiftInput = z.infer<typeof planningShiftSchema>;
export type SavePlanningInput = z.infer<typeof savePlanningSchema>;
