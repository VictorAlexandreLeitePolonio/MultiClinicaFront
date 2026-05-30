"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import api from "@/lib/api";
import { Appointment } from "@/types";
import { AgendaFormData } from "../../schemas/agenda.schema";

export function useAgendaUpdate() {
  const { mutate, isPending, error } = useApiMutation<
    { id: number; payload: AgendaFormData },
    Appointment
  >({
    mutationFn: ({ id, payload }) =>
      api.put<Appointment>(`/api/appointments/${id}`, payload).then((r) => r.data),
    errorMessage: "Erro ao atualizar agendamento. Tente novamente.",
  });

  // Mantém a assinatura original: updateAgenda(id, payload)
  const updateAgenda = (id: number, payload: AgendaFormData) =>
    mutate({ id, payload });

  return { updateAgenda, isPending, error };
}
