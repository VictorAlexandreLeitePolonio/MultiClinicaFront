"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import {
  createProduto,
  getProduto,
  getProdutos,
  setProdutoActive,
  updateProduto,
  type GetProdutosParams,
  type Produto,
  type ProdutoPayload,
} from "../services/produtos.service";

export const produtosQueryKey = ["produtos"] as const;

export function useProdutos(params: GetProdutosParams) {
  return useQuery({ queryKey: [...produtosQueryKey, params], queryFn: () => getProdutos(params) });
}

export function useProduto(id: number | null) {
  return useQuery({ queryKey: [...produtosQueryKey, "detail", id], queryFn: () => getProduto(id as number), enabled: id !== null });
}

export function useProdutoMutations() {
  const queryClient = useQueryClient();
  const createMutation = useApiMutation<ProdutoPayload, Produto>({ mutationFn: createProduto, errorMessage: "Erro ao cadastrar produto." });
  const updateMutation = useApiMutation<{ id: number; payload: ProdutoPayload }, Produto>({ mutationFn: ({ id, payload }) => updateProduto(id, payload), errorMessage: "Erro ao atualizar produto." });
  const activeMutation = useApiMutation<{ id: number; active: boolean }, Produto>({ mutationFn: ({ id, active }) => setProdutoActive(id, active), errorMessage: "Erro ao atualizar status do produto." });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: produtosQueryKey });

  return {
    createProduto: async (payload: ProdutoPayload) => { const result = await createMutation.mutate(payload); await invalidate(); return result; },
    updateProduto: async (id: number, payload: ProdutoPayload) => { const result = await updateMutation.mutate({ id, payload }); await invalidate(); return result; },
    setProdutoActive: async (id: number, active: boolean) => { const result = await activeMutation.mutate({ id, active }); await invalidate(); return result; },
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isSettingActive: activeMutation.isPending,
  };
}
