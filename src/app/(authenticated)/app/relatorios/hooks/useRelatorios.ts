"use client";

import { useQuery } from "@tanstack/react-query";
import { getDespesas, getFaturamento, getProdutosMaisMovimentados, getResultado, type AgrupamentoRelatorio, type RelatorioParams } from "../services/relatorios.service";

export function useRelatorioFaturamento(params: RelatorioParams & { agruparPor?: AgrupamentoRelatorio }) { return useQuery({ queryKey: ["relatorios", "faturamento", params], queryFn: () => getFaturamento(params), enabled: Boolean(params.de && params.ate) }); }
export function useRelatorioDespesas(params: RelatorioParams) { return useQuery({ queryKey: ["relatorios", "despesas", params], queryFn: () => getDespesas(params), enabled: Boolean(params.de && params.ate) }); }
export function useRelatorioResultado(params: RelatorioParams) { return useQuery({ queryKey: ["relatorios", "resultado", params], queryFn: () => getResultado(params), enabled: Boolean(params.de && params.ate) }); }
export function useRelatorioProdutosMaisMovimentados(params: RelatorioParams & { limite?: number }) { return useQuery({ queryKey: ["relatorios", "produtos-mais-movimentados", params], queryFn: () => getProdutosMaisMovimentados(params), enabled: Boolean(params.de && params.ate) }); }
