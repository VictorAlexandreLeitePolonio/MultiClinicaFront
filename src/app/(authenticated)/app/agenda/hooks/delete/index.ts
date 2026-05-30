"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { deleteAppointment } from "@/services/appointments/appointments.service";

export function useAgendaDelete() {
  const { mutate: deleteAgenda, isPending, error } = useApiMutation<number, void>({
    mutationFn: deleteAppointment,
    errorMessage: "Erro ao cancelar agendamento. Tente novamente.",
  });
  return { deleteAgenda, isPending, error };
}
