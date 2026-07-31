import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import type { PagedResult } from "@/types";

export type StatusCompra = "Aberta" | "Aprovada" | "Recebida" | "Cancelada";
export interface CompraItem { id?: number; produtoId: number; quantidade: number; valorUnitario: number; valorTotal?: number | null; }
export interface Compra { id: number; fornecedorId: number; dataCompra: string; valorTotal: number | null; status: StatusCompra; observacao: string | null; gerouContaPagar: boolean; contaPagarId: number | null; itens: CompraItem[]; createdAt: string; }
export interface GetComprasParams { fornecedorId?: number; status?: StatusCompra; page: number; pageSize: number; }
export interface CompraPayload { fornecedorId: number; dataCompra: string; observacao?: string | null; itens: Array<{ produtoId: number; quantidade: number; valorUnitario: number }>; }
export interface GerarContaPagarPayload { dataVencimento: string; categoriaFinanceiraId?: number | null; }

export async function getCompras(params: GetComprasParams): Promise<PagedResult<Compra>> { const response = await api.get<PagedResult<Compra> | Compra[]>("/api/compras", { params }); return normalizePagedResult<Compra>(response.data, params.pageSize); }
export async function getCompra(id: number): Promise<Compra> { const response = await api.get<Compra>(`/api/compras/${id}`); return response.data; }
export async function createCompra(payload: CompraPayload): Promise<Compra> { const response = await api.post<Compra>("/api/compras", payload); return response.data; }
export async function updateCompra(id: number, payload: CompraPayload): Promise<Compra> { const response = await api.put<Compra>(`/api/compras/${id}`, payload); return response.data; }
export async function aprovarCompra(id: number): Promise<Compra> { const response = await api.post<Compra>(`/api/compras/${id}/aprovar`); return response.data; }
export async function receberCompra(id: number): Promise<Compra> { const response = await api.post<Compra>(`/api/compras/${id}/receber`); return response.data; }
export async function gerarContaPagar(id: number, payload: GerarContaPagarPayload): Promise<Compra> { const response = await api.post<Compra>(`/api/compras/${id}/gerar-conta-pagar`, payload); return response.data; }
export async function cancelarCompra(id: number, motivo: string): Promise<Compra> { const response = await api.post<Compra>(`/api/compras/${id}/cancelar`, { motivo }); return response.data; }
