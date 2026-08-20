import { z } from "zod";

/** Converte o valor de um input datetime-local para ISO preservando o fuso local. */
export function dateTimeLocalToIso(value: string): string {
  if (!value) return "";
  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

export const appointmentRequestSchema = z.object({
  requestedDate: z
    .string()
    .min(1, "Informe data e horário")
    .refine((value) => {
      const iso = dateTimeLocalToIso(value);
      return iso !== "" && new Date(iso).getTime() > Date.now();
    }, "A data deve ser no futuro"),
  reason: z.string().min(1, "Descreva o motivo da consulta"),
});

export type AppointmentRequestFormData = z.infer<typeof appointmentRequestSchema>;
