"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { Appointment } from "@/types";
import { createAppointment, CreateAppointmentPayload } from "@/app/(authenticated)/app/agenda/services/appointments.service";

export function useAgendaInsert() {
  const { mutate: insertAgenda, isPending, error } = useApiMutation<CreateAppointmentPayload, Appointment>({
    mutationFn: createAppointment,
    errorMessage: "Erro ao agendar consulta. Tente novamente.",
  });
  return { insertAgenda, isPending, error };
}
