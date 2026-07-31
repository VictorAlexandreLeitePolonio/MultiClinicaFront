import api from "@/lib/api";

export type AgrupamentoRelatorio = "Periodo" | "FormaPagamento" | "Categoria";
export interface RelatorioParams { de: string; ate: string; }
export interface RelatorioAgrupado { chave: string; valor: number; }
export interface ResultadoFinanceiro { faturamento: number; despesas: number; resultado: number; }
export interface ProdutoMovimentado { produtoId: number; nome: string; quantidadeMovimentada: number; }

export async function getFaturamento(params: RelatorioParams & { agruparPor?: AgrupamentoRelatorio }): Promise<RelatorioAgrupado[]> { const response = await api.get<RelatorioAgrupado[]>("/api/relatorios/faturamento", { params }); return response.data; }
export async function getDespesas(params: RelatorioParams): Promise<RelatorioAgrupado[]> { const response = await api.get<RelatorioAgrupado[]>("/api/relatorios/despesas", { params }); return response.data; }
export async function getResultado(params: RelatorioParams): Promise<ResultadoFinanceiro> { const response = await api.get<ResultadoFinanceiro>("/api/relatorios/resultado", { params }); return response.data; }
export async function getProdutosMaisMovimentados(params: RelatorioParams & { limite?: number }): Promise<ProdutoMovimentado[]> { const response = await api.get<ProdutoMovimentado[]>("/api/relatorios/produtos-mais-movimentados", { params }); return response.data; }
