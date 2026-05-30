"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { Appointment } from "@/types";
import { AgendaFormData } from "../../schemas/agenda.schema";
import { updateAppointment } from "@/services/appointments/appointments.service";

export function useAgendaUpdate() {
  const { mutate, isPending, error } = useApiMutation<
    { id: number; payload: AgendaFormData },
    Appointment
  >({
    mutationFn: ({ id, payload }) => updateAppointment(id, payload),
    errorMessage: "Erro ao atualizar agendamento. Tente novamente.",
  });

  // Mantém a assinatura original: updateAgenda(id, payload)
  const updateAgenda = (id: number, payload: AgendaFormData) =>
    mutate({ id, payload });

  return { updateAgenda, isPending, error };
}
