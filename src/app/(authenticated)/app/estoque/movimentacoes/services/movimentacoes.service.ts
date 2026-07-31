import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import type { PagedResult } from "@/types";

export type TipoMovimentacao = "Entrada" | "Saida" | "Ajuste" | "Perda" | "UsoInterno" | "Venda" | "Compra";

export interface MovimentacaoEstoque {
  id: number;
  produtoId: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  quantidadeAnterior: number;
  quantidadeAtual: number;
  origem: string | null;
  origemId: number | null;
  observacao: string | null;
  isCancelada: boolean;
  motivoCancelamento: string | null;
  createdAt: string;
}

export interface ProdutoAlerta { produtoId: number; nome: string; quantidadeAtual: number; quantidadeMinima: number; }
export interface GetMovimentacoesParams { produtoId?: number; tipo?: TipoMovimentacao; page: number; pageSize: number; }
export interface RegistrarMovimentacaoPayload { produtoId: number; quantidade: number; observacao?: string | null; }
export interface AjustarEstoquePayload { produtoId: number; novaQuantidade: number; observacao: string; }

export async function getMovimentacoes(params: GetMovimentacoesParams): Promise<PagedResult<MovimentacaoEstoque>> {
  const response = await api.get<PagedResult<MovimentacaoEstoque> | MovimentacaoEstoque[]>("/api/estoque/movimentacoes", { params });
  return normalizePagedResult<MovimentacaoEstoque>(response.data, params.pageSize);
}
export async function getAlertas(): Promise<ProdutoAlerta[]> {
  const response = await api.get<ProdutoAlerta[]>("/api/estoque/alertas"); return response.data;
}
export async function registrarEntrada(payload: RegistrarMovimentacaoPayload): Promise<MovimentacaoEstoque> {
  const response = await api.post<MovimentacaoEstoque>("/api/estoque/movimentacoes/entrada", payload); return response.data;
}
export async function registrarSaida(payload: RegistrarMovimentacaoPayload): Promise<MovimentacaoEstoque> {
  const response = await api.post<MovimentacaoEstoque>("/api/estoque/movimentacoes/saida", payload); return response.data;
}
export async function registrarUsoInterno(payload: RegistrarMovimentacaoPayload): Promise<MovimentacaoEstoque> {
  const response = await api.post<MovimentacaoEstoque>("/api/estoque/movimentacoes/uso-interno", payload); return response.data;
}
export async function registrarPerda(payload: RegistrarMovimentacaoPayload): Promise<MovimentacaoEstoque> {
  const response = await api.post<MovimentacaoEstoque>("/api/estoque/movimentacoes/perda", payload); return response.data;
}
export async function ajustarEstoque(payload: AjustarEstoquePayload): Promise<MovimentacaoEstoque> {
  const response = await api.post<MovimentacaoEstoque>("/api/estoque/movimentacoes/ajuste", payload); return response.data;
}
export async function cancelarMovimentacao(id: number, motivo: string): Promise<MovimentacaoEstoque> {
  const response = await api.post<MovimentacaoEstoque>(`/api/estoque/movimentacoes/${id}/cancelar`, { motivo }); return response.data;
}
