"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import {
  createCategoriaProduto,
  getCategoriasProduto,
  setCategoriaProdutoActive,
  updateCategoriaProduto,
  type CategoriaProduto,
  type CategoriaProdutoPayload,
  type GetCategoriasProdutoParams,
} from "../services/categoriasProduto.service";

export const categoriasProdutoQueryKey = ["categorias-produto"] as const;

export function useCategoriasProduto(params: GetCategoriasProdutoParams) {
  return useQuery({ queryKey: [...categoriasProdutoQueryKey, params], queryFn: () => getCategoriasProduto(params) });
}

export function useCategoriaProdutoMutations() {
  const client = useQueryClient();
  const createMutation = useApiMutation<CategoriaProdutoPayload, CategoriaProduto>({ mutationFn: createCategoriaProduto, errorMessage: "Erro ao cadastrar categoria." });
  const updateMutation = useApiMutation<{ id: number; payload: CategoriaProdutoPayload }, CategoriaProduto>({ mutationFn: ({ id, payload }) => updateCategoriaProduto(id, payload), errorMessage: "Erro ao atualizar categoria." });
  const activeMutation = useApiMutation<{ id: number; active: boolean }, CategoriaProduto>({ mutationFn: ({ id, active }) => setCategoriaProdutoActive(id, active), errorMessage: "Erro ao atualizar status da categoria." });
  const invalidate = () => client.invalidateQueries({ queryKey: categoriasProdutoQueryKey });
  return {
    createCategoriaProduto: async (payload: CategoriaProdutoPayload) => { const result = await createMutation.mutate(payload); await invalidate(); return result; },
    updateCategoriaProduto: async (id: number, payload: CategoriaProdutoPayload) => { const result = await updateMutation.mutate({ id, payload }); await invalidate(); return result; },
    setCategoriaProdutoActive: async (id: number, active: boolean) => { const result = await activeMutation.mutate({ id, active }); await invalidate(); return result; },
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isSettingActive: activeMutation.isPending,
  };
}
