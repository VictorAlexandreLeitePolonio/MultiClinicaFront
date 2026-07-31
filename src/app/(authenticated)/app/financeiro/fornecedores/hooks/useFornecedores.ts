"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import {
  createFornecedor,
  getFornecedores,
  setFornecedorActive,
  updateFornecedor,
  type Fornecedor,
  type FornecedorPayload,
  type GetFornecedoresParams,
} from "../services/fornecedores.service";

export const fornecedoresQueryKey = ["fornecedores"] as const;

export function useFornecedores(params: GetFornecedoresParams) {
  return useQuery({
    queryKey: [...fornecedoresQueryKey, params],
    queryFn: () => getFornecedores(params),
  });
}

export function useFornecedorMutations() {
  const queryClient = useQueryClient();
  const createMutation = useApiMutation<FornecedorPayload, Fornecedor>({
    mutationFn: createFornecedor,
    errorMessage: "Erro ao cadastrar fornecedor.",
  });
  const updateMutation = useApiMutation<
    { id: number; payload: FornecedorPayload },
    Fornecedor
  >({
    mutationFn: ({ id, payload }) => updateFornecedor(id, payload),
    errorMessage: "Erro ao atualizar fornecedor.",
  });
  const activeMutation = useApiMutation<
    { id: number; active: boolean },
    void
  >({
    mutationFn: ({ id, active }) => setFornecedorActive(id, active),
    errorMessage: "Erro ao atualizar status do fornecedor.",
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: fornecedoresQueryKey });

  const create = async (payload: FornecedorPayload) => {
    const result = await createMutation.mutate(payload);
    await invalidate();
    return result;
  };

  const update = async (id: number, payload: FornecedorPayload) => {
    const result = await updateMutation.mutate({ id, payload });
    await invalidate();
    return result;
  };

  const setActive = async (id: number, active: boolean) => {
    await activeMutation.mutate({ id, active });
    await invalidate();
  };

  return {
    createFornecedor: create,
    updateFornecedor: update,
    setFornecedorActive: setActive,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isSettingActive: activeMutation.isPending,
  };
}
