"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { Appointment } from "@/types";
import { AgendaFormData } from "../../schemas/agenda.schema";
import { createAppointment } from "@/services/appointments/appointments.service";

export function useAgendaInsert() {
  const { mutate: insertAgenda, isPending, error } = useApiMutation<AgendaFormData, Appointment>({
    mutationFn: createAppointment,
    errorMessage: "Erro ao agendar consulta. Tente novamente.",
  });
  return { insertAgenda, isPending, error };
}
