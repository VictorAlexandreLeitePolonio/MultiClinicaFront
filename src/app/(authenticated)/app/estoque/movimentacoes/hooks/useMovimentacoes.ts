"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { produtosQueryKey } from "../../produtos/hooks/useProdutos";
import {
  ajustarEstoque,
  cancelarMovimentacao,
  createProductSale,
  getAlertas,
  getMovimentacoes,
  registrarEntrada,
  registrarPerda,
  registrarSaida,
  registrarUsoInterno,
  type AjustarEstoquePayload,
  type CreateStockMovementRequest,
  type GetMovimentacoesParams,
  type MovimentacaoEstoque,
  type ProdutoAlerta,
  type RegistrarMovimentacaoPayload,
} from "../services/movimentacoes.service";

export const movimentacoesQueryKey = ["estoque", "movimentacoes"] as const;
export const alertasEstoqueQueryKey = ["estoque", "alertas"] as const;

export function useMovimentacoes(params: GetMovimentacoesParams) {
  return useQuery({ queryKey: [...movimentacoesQueryKey, params], queryFn: () => getMovimentacoes(params) });
}
export function useAlertasEstoque() {
  return useQuery<ProdutoAlerta[]>({ queryKey: alertasEstoqueQueryKey, queryFn: getAlertas });
}

export function useMovimentacaoMutations() {
  const client = useQueryClient();
  const entrada = useApiMutation<RegistrarMovimentacaoPayload, MovimentacaoEstoque>({ mutationFn: registrarEntrada, errorMessage: "Erro ao registrar entrada." });
  const saida = useApiMutation<RegistrarMovimentacaoPayload, MovimentacaoEstoque>({ mutationFn: registrarSaida, errorMessage: "Erro ao registrar saída." });
  const usoInterno = useApiMutation<RegistrarMovimentacaoPayload, MovimentacaoEstoque>({ mutationFn: registrarUsoInterno, errorMessage: "Erro ao registrar uso interno." });
  const perda = useApiMutation<RegistrarMovimentacaoPayload, MovimentacaoEstoque>({ mutationFn: registrarPerda, errorMessage: "Erro ao registrar perda." });
  const productSale = useApiMutation<CreateStockMovementRequest, MovimentacaoEstoque>({ mutationFn: createProductSale, errorMessage: "Erro ao registrar venda." });
  const ajuste = useApiMutation<AjustarEstoquePayload, MovimentacaoEstoque>({ mutationFn: ajustarEstoque, errorMessage: "Erro ao ajustar estoque." });
  const cancelamento = useApiMutation<{ id: number; motivo: string }, MovimentacaoEstoque>({ mutationFn: ({ id, motivo }) => cancelarMovimentacao(id, motivo), errorMessage: "Erro ao cancelar movimentação." });
  const invalidate = async () => { await client.invalidateQueries({ queryKey: movimentacoesQueryKey }); await client.invalidateQueries({ queryKey: alertasEstoqueQueryKey }); await client.invalidateQueries({ queryKey: produtosQueryKey }); };
  return {
    registrarEntrada: async (payload: RegistrarMovimentacaoPayload) => { const result = await entrada.mutate(payload); await invalidate(); return result; },
    registrarSaida: async (payload: RegistrarMovimentacaoPayload) => { const result = await saida.mutate(payload); await invalidate(); return result; },
    registrarUsoInterno: async (payload: RegistrarMovimentacaoPayload) => { const result = await usoInterno.mutate(payload); await invalidate(); return result; },
    registrarPerda: async (payload: RegistrarMovimentacaoPayload) => { const result = await perda.mutate(payload); await invalidate(); return result; },
    createProductSale: async (payload: CreateStockMovementRequest) => { const result = await productSale.mutate(payload); await invalidate(); return result; },
    ajustarEstoque: async (payload: AjustarEstoquePayload) => { const result = await ajuste.mutate(payload); await invalidate(); return result; },
    cancelarMovimentacao: async (id: number, motivo: string) => { const result = await cancelamento.mutate({ id, motivo }); await invalidate(); return result; },
    isMutating: entrada.isPending || saida.isPending || usoInterno.isPending || perda.isPending || productSale.isPending || ajuste.isPending || cancelamento.isPending,
    isCanceling: cancelamento.isPending,
  };
}
