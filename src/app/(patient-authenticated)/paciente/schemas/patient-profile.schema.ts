import { z } from "zod";

export const patientProfileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido"),
});

export type PatientProfileFormData = z.infer<typeof patientProfileSchema>;
