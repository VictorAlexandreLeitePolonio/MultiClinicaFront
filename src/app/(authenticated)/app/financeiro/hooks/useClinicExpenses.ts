"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { queryKeys } from "@/lib/queryKeys";
import type { ClinicExpense, PagedResult } from "@/types";
import {
  createClinicExpense,
  deleteClinicExpense,
  getClinicExpenses,
  updateClinicExpense,
  type CreateClinicExpenseRequest,
  type GetClinicExpensesParams,
  type UpdateClinicExpenseRequest,
} from "../services/financial.service";

export function useClinicExpenses(params: GetClinicExpensesParams) {
  return useQuery<PagedResult<ClinicExpense>>({
    queryKey: queryKeys.financial.expenses(params),
    queryFn: () => getClinicExpenses(params),
  });
}

export function useClinicExpenseMutations() {
  const queryClient = useQueryClient();
  const createMutation = useApiMutation<CreateClinicExpenseRequest, ClinicExpense>({
    mutationFn: createClinicExpense,
    errorMessage: "Erro ao cadastrar despesa.",
  });
  const updateMutation = useApiMutation<
    { id: number; payload: UpdateClinicExpenseRequest },
    ClinicExpense
  >({
    mutationFn: ({ id, payload }) => updateClinicExpense(id, payload),
    errorMessage: "Erro ao atualizar despesa.",
  });
  const deleteMutation = useApiMutation<number, void>({
    mutationFn: deleteClinicExpense,
    errorMessage: "Erro ao excluir despesa.",
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.financial.expenses() });
    await queryClient.invalidateQueries({ queryKey: queryKeys.financial.balance() });
  };

  return {
    createExpense: async (payload: CreateClinicExpenseRequest) => {
      const result = await createMutation.mutate(payload);
      await invalidate();
      return result;
    },
    updateExpense: async (id: number, payload: UpdateClinicExpenseRequest) => {
      const result = await updateMutation.mutate({ id, payload });
      await invalidate();
      return result;
    },
    deleteExpense: async (id: number) => {
      await deleteMutation.mutate(id);
      await invalidate();
    },
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
