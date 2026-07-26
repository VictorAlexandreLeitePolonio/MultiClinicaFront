"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import {
  cancelarContaPagar,
  createContaPagar,
  getContaPagar,
  getContasPagar,
  updateContaPagar,
  type ContaPagar,
  type CreateContaPagarPayload,
  type GetContasPagarParams,
  type UpdateContaPagarPayload,
} from "../services/contasPagar.service";

export const contasPagarQueryKey = ["contas-pagar"] as const;

export function useContasPagar(params: GetContasPagarParams) {
  return useQuery({
    queryKey: [...contasPagarQueryKey, params],
    queryFn: () => getContasPagar(params),
  });
}

export function useContaPagar(id: number | null) {
  return useQuery({
    queryKey: [...contasPagarQueryKey, "detail", id],
    queryFn: () => getContaPagar(id as number),
    enabled: id !== null,
  });
}

export function useContaPagarMutations() {
  const queryClient = useQueryClient();
  const createMutation = useApiMutation<CreateContaPagarPayload, ContaPagar>({
    mutationFn: createContaPagar,
    errorMessage: "Erro ao cadastrar conta a pagar.",
  });
  const updateMutation = useApiMutation<
    { id: number; payload: UpdateContaPagarPayload },
    ContaPagar
  >({
    mutationFn: ({ id, payload }) => updateContaPagar(id, payload),
    errorMessage: "Erro ao atualizar conta a pagar.",
  });
  const cancelMutation = useApiMutation<
    { id: number; motivo: string },
    ContaPagar
  >({
    mutationFn: ({ id, motivo }) => cancelarContaPagar(id, motivo),
    errorMessage: "Erro ao cancelar conta a pagar.",
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: contasPagarQueryKey });

  return {
    createContaPagar: async (payload: CreateContaPagarPayload) => {
      const result = await createMutation.mutate(payload);
      await invalidate();
      return result;
    },
    updateContaPagar: async (id: number, payload: UpdateContaPagarPayload) => {
      const result = await updateMutation.mutate({ id, payload });
      await invalidate();
      return result;
    },
    cancelarContaPagar: async (id: number, motivo: string) => {
      const result = await cancelMutation.mutate({ id, motivo });
      await invalidate();
      return result;
    },
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isCanceling: cancelMutation.isPending,
  };
}
