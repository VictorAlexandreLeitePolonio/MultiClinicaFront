import { z } from "zod";

export function formatSlotTime(value: string): string {
  return value.match(/T(\d{2}:\d{2})/)?.[1] ?? value;
}

export const appointmentRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data"),
  requestedDate: z.string().min(1, "Selecione um horário disponível"),
  reason: z.string().max(500, "O motivo deve ter no máximo 500 caracteres"),
});

export type AppointmentRequestFormData = z.infer<typeof appointmentRequestSchema>;
