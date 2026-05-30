"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";

interface MutationConfig<TPayload, TResponse> {
  /** Função que executa a chamada à API */
  mutationFn: (payload: TPayload) => Promise<TResponse>;
  /** Mensagem de fallback exibida em caso de erro */
  errorMessage: string;
}

/**
 * Hook genérico para operações de mutação (create, update, delete).
 * Gerencia isPending, error, toast de erro e re-throw para o chamador.
 *
 * Uso para delete:
 *   const { mutate: deletePaciente, isPending } = useApiMutation({
 *     mutationFn: (id: number) => api.delete(`/api/patients/${id}`),
 *     errorMessage: "Erro ao excluir paciente.",
 *   });
 *
 * Uso para insert:
 *   const { mutate: insertPaciente, isPending } = useApiMutation({
 *     mutationFn: (payload: PacienteFormData) => api.post<Patient>("/api/patients", payload).then(r => r.data),
 *     errorMessage: "Erro ao cadastrar paciente.",
 *   });
 */
export function useApiMutation<TPayload, TResponse = void>(
  config: MutationConfig<TPayload, TResponse>
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // config é estável (criado uma vez no contexto do módulo que usa o hook)
  const mutate = useCallback(
    async (payload: TPayload): Promise<TResponse> => {
      setIsPending(true);
      setError(null);
      try {
        return await config.mutationFn(payload);
      } catch (err) {
        const message = getApiErrorMessage(err, config.errorMessage);
        toast.error(message);
        const errorObj = err instanceof Error ? err : new Error(message);
        setError(errorObj);
        throw err;
      } finally {
        setIsPending(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return { mutate, isPending, error };
}
