"use client";
import { DataTable, type Column } from "@/components/ui/DataTable";
import type { ProdutoMovimentado } from "../services/relatorios.service";
export function ProdutosMovimentadosTable({ data, loading }: { data: ProdutoMovimentado[]; loading?: boolean }) { const columns: Column<ProdutoMovimentado>[] = [{ key: "nome", label: "Produto" }, { key: "quantidadeMovimentada", label: "Quantidade movimentada" }]; return <DataTable columns={columns} data={data} loading={loading} emptyMessage="Nenhum produto movimentado no período." keyExtractor={(row) => row.produtoId} />; }
