"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import api from "@/lib/api";
import { Appointment } from "@/types";
import { AgendaFormData } from "../../schemas/agenda.schema";

export function useAgendaInsert() {
  const { mutate: insertAgenda, isPending, error } = useApiMutation<AgendaFormData, Appointment>({
    mutationFn: (payload) => api.post<Appointment>("/api/appointments", payload).then((r) => r.data),
    errorMessage: "Erro ao agendar consulta. Tente novamente.",
  });
  return { insertAgenda, isPending, error };
}
