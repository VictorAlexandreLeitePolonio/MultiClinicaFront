"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { Appointment } from "@/types";
import { updateAppointment, UpdateAppointmentPayload } from "@/app/(authenticated)/app/agenda/services/appointments.service";

export function useAgendaUpdate() {
  const { mutate, isPending, error } = useApiMutation<
    { id: number; payload: UpdateAppointmentPayload },
    Appointment
  >({
    mutationFn: ({ id, payload }) => updateAppointment(id, payload),
    errorMessage: "Erro ao atualizar agendamento. Tente novamente.",
  });

  // Mantém a assinatura original: updateAgenda(id, payload)
  const updateAgenda = (id: number, payload: UpdateAppointmentPayload) =>
    mutate({ id, payload });

  return { updateAgenda, isPending, error };
}
