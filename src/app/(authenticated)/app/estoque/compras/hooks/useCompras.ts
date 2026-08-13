"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { produtosQueryKey } from "../../produtos/hooks/useProdutos";
import { movimentacoesQueryKey } from "../../movimentacoes/hooks/useMovimentacoes";
import {
  aprovarCompra,
  cancelarCompra,
  createCompra,
  getCompra,
  getCompras,
  receberCompra,
  updateCompra,
  type Compra,
  type CompraPayload,
  type GetComprasParams,
} from "../services/compras.service";

export const comprasQueryKey = ["compras"] as const;
export function useCompras(params: GetComprasParams) { return useQuery({ queryKey: [...comprasQueryKey, params], queryFn: () => getCompras(params) }); }
export function useCompra(id: number | null) { return useQuery({ queryKey: [...comprasQueryKey, "detail", id], queryFn: () => getCompra(id as number), enabled: id !== null }); }

export function useCompraMutations() {
  const client = useQueryClient();
  const createMutation = useApiMutation<CompraPayload, Compra>({ mutationFn: createCompra, errorMessage: "Erro ao cadastrar compra." });
  const updateMutation = useApiMutation<{ id: number; payload: CompraPayload }, Compra>({ mutationFn: ({ id, payload }) => updateCompra(id, payload), errorMessage: "Erro ao atualizar compra." });
  const approveMutation = useApiMutation<number, Compra>({ mutationFn: aprovarCompra, errorMessage: "Erro ao aprovar compra." });
  const receiveMutation = useApiMutation<number, Compra>({ mutationFn: receberCompra, errorMessage: "Erro ao receber compra." });
  const cancelMutation = useApiMutation<{ id: number; motivo: string }, Compra>({ mutationFn: ({ id, motivo }) => cancelarCompra(id, motivo), errorMessage: "Erro ao cancelar compra." });
  const invalidate = async (receive = false) => {
    await client.invalidateQueries({ queryKey: comprasQueryKey });
    if (receive) { await client.invalidateQueries({ queryKey: produtosQueryKey }); await client.invalidateQueries({ queryKey: movimentacoesQueryKey }); }
  };
  return {
    createCompra: async (payload: CompraPayload) => { const result = await createMutation.mutate(payload); await invalidate(); return result; },
    updateCompra: async (id: number, payload: CompraPayload) => { const result = await updateMutation.mutate({ id, payload }); await invalidate(); return result; },
    aprovarCompra: async (id: number) => { const result = await approveMutation.mutate(id); await invalidate(); return result; },
    receberCompra: async (id: number) => { const result = await receiveMutation.mutate(id); await invalidate(true); return result; },
    cancelarCompra: async (id: number, motivo: string) => { const result = await cancelMutation.mutate({ id, motivo }); await invalidate(); return result; },
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isApproving: approveMutation.isPending,
    isReceiving: receiveMutation.isPending,
    isCanceling: cancelMutation.isPending,
  };
}
