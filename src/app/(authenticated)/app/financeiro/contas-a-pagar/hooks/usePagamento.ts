"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import {
  estornarPagamento,
  registrarPagamento,
  type EstornarPagamentoPayload,
  type RegistrarPagamentoPayload,
} from "../services/pagamentos.service";
import type { PagamentoContaPagar } from "../services/contasPagar.service";
import { contasPagarQueryKey } from "./useContaPagar";

export function usePagamentoMutations() {
  const queryClient = useQueryClient();
  const registerMutation = useApiMutation<
    RegistrarPagamentoPayload,
    PagamentoContaPagar
  >({
    mutationFn: registrarPagamento,
    errorMessage: "Erro ao registrar pagamento.",
  });
  const reverseMutation = useApiMutation<
    { id: number; payload: EstornarPagamentoPayload },
    PagamentoContaPagar
  >({
    mutationFn: ({ id, payload }) => estornarPagamento(id, payload),
    errorMessage: "Erro ao estornar pagamento.",
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: contasPagarQueryKey });

  return {
    registrarPagamento: async (payload: RegistrarPagamentoPayload) => {
      const result = await registerMutation.mutate(payload);
      await invalidate();
      return result;
    },
    estornarPagamento: async (id: number, payload: EstornarPagamentoPayload) => {
      const result = await reverseMutation.mutate({ id, payload });
      await invalidate();
      return result;
    },
    isRegistering: registerMutation.isPending,
    isReversing: reverseMutation.isPending,
  };
}
