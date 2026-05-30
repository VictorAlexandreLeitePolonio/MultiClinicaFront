import { z } from "zod";

export const AgendaSchema = z.object({
  patientId: z.number().min(1, "Paciente é obrigatório"),
  appointmentDate: z.string().min(1, "Data e hora são obrigatórias"),
  status: z.enum(["Scheduled", "Completed", "Cancelled"]).optional(),
  userId: z.number().optional(),
});

export type AgendaFormData = z.infer<typeof AgendaSchema>;
