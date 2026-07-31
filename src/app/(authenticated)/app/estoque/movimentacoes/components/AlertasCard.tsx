"use client";
import { AlertTriangle } from "lucide-react";
import { useAlertasEstoque } from "../hooks/useMovimentacoes";
export function AlertasCard() { const query = useAlertasEstoque(); if (query.isLoading || query.isError || !query.data?.length) return null; return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30"><div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-200"><AlertTriangle size={18} /> Estoque abaixo do mínimo</div><div className="mt-3 flex flex-wrap gap-2">{query.data.map((item) => <span key={item.produtoId} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-800 shadow-sm">{item.nome}: {item.quantidadeAtual}/{item.quantidadeMinima}</span>)}</div></div>; }
