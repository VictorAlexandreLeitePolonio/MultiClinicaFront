import { z } from "zod";

export const PatientTreatmentSchema = z.object({
  templateId: z.coerce.number().min(1, "Modelo é obrigatório."),
  title: z.string().trim().min(2, "Título é obrigatório."),
  description: z.string().trim().optional(),
  startedAt: z.string().optional(),
});

export const PatientEvolutionSchema = z.object({
  date: z.string().optional(),
  description: z.string().trim().optional(),
  conduct: z.string().trim().optional(),
  observations: z.string().trim().optional(),
  nextGuidance: z.string().trim().optional(),
  status: z.enum(["Draft", "Completed"]),
});

export type PatientTreatmentFormData = z.infer<typeof PatientTreatmentSchema>;
export type PatientEvolutionFormData = z.infer<typeof PatientEvolutionSchema>;
