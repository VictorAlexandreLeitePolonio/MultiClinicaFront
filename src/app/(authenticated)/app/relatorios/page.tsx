"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { getApiErrorMessage } from "@/utils/apiError";
import { PeriodoFilter } from "./components/PeriodoFilter";
import { FaturamentoChart } from "./components/FaturamentoChart";
import { ProdutosMovimentadosTable } from "./components/ProdutosMovimentadosTable";
import { ResultadoCards } from "./components/ResultadoCards";
import { useRelatorioDespesas, useRelatorioFaturamento, useRelatorioProdutosMaisMovimentados, useRelatorioResultado } from "./hooks/useRelatorios";

export default function RelatoriosPage() { const today = new Date().toISOString().slice(0, 10); const [params, setParams] = useState({ de: today.slice(0, 8) + "01", ate: today, agruparPor: "Periodo" as const }); const base = { de: params.de, ate: params.ate }; const faturamento = useRelatorioFaturamento(params); const despesas = useRelatorioDespesas(base); const resultado = useRelatorioResultado(base); const produtos = useRelatorioProdutosMaisMovimentados({ ...base, limite: 10 }); const error = [faturamento, despesas, resultado, produtos].find((query) => query.isError); return <div className="space-y-6"><PageHeader title="Relatórios Financeiros" /><PeriodoFilter {...params} onChange={(field, value) => setParams((current) => ({ ...current, [field]: value }))} />{error && <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{getApiErrorMessage(error.error, "Erro ao carregar relatórios.")}</p>}<ResultadoCards data={resultado.data} loading={resultado.isLoading} /><section><h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Faturamento</h2><FaturamentoChart data={faturamento.data ?? []} loading={faturamento.isLoading} /></section><section><h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Despesas por categoria</h2><DataTablePlaceholder data={despesas.data ?? []} loading={despesas.isLoading} /></section><section><h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Produtos mais movimentados</h2><ProdutosMovimentadosTable data={produtos.data ?? []} loading={produtos.isLoading} /></section></div>; }

function DataTablePlaceholder({ data, loading }: { data: { chave: string; valor: number }[]; loading?: boolean }) { return <div className="rounded-2xl border border-[#d7f3ea] bg-white p-4">{loading ? "Carregando..." : data.length ? data.map((item) => <div key={item.chave} className="flex justify-between border-b py-2 text-sm last:border-0"><span>{item.chave}</span><span className="font-semibold">{item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span></div>) : <p className="py-6 text-center text-sm text-slate-500">Nenhuma despesa no período.</p>}</div>; }
