import { z } from "zod";

export const AgendaSchema = z.object({
  patientId: z.number().min(1, "Paciente é obrigatório"),
  appointmentDate: z.string().min(1, "Data e hora são obrigatórias"),
  status: z.enum(["Scheduled", "Completed", "Cancelled"]).optional(),
});

export type AgendaFormData = z.infer<typeof AgendaSchema>;
export const AgendaCreateSchema = AgendaSchema.omit({ appointmentDate: true }).extend({
  professionalId: z.number().min(1, "Profissional é obrigatório"),
  appointmentDay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data é obrigatória"),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, "Hora é obrigatória"),
});
export type AgendaCreateFormData = z.infer<typeof AgendaCreateSchema>;
