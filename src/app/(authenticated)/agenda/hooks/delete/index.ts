"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import api from "@/lib/api";

export function useAgendaDelete() {
  const { mutate: deleteAgenda, isPending, error } = useApiMutation<number, void>({
    mutationFn: (id) => api.delete(`/api/appointments/${id}`).then(() => undefined),
    errorMessage: "Erro ao cancelar agendamento. Tente novamente.",
  });
  return { deleteAgenda, isPending, error };
}
