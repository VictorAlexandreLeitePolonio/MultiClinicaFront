"use client";

import { useState } from "react";
import { AlertTriangle, Ban, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTutorial } from "@/hooks/tutorial/useTutorial";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Column, DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency } from "@/utils/formatters";
import { useProdutoMutations, useProdutos } from "../hooks/useProdutos";
import type { Produto } from "../services/produtos.service";
import type { ProdutoFormData } from "../schemas/produto.schema";
import { ProdutoRegister } from "./ProdutoRegister";

export function ProdutoList() {
  const { can } = useAuth(); const { completeTaskTutorial } = useTutorial(); const [search, setSearch] = useState(""); const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(10); const [editing, setEditing] = useState<Produto | null>(null); const [open, setOpen] = useState(false); const [toggle, setToggle] = useState<Produto | null>(null);
  const query = useProdutos({ nome: search || undefined, page, pageSize }); const mutations = useProdutoMutations(); const produtos = query.data?.data ?? [];
  const canCost = can("estoque.produtos.visualizar_custo"); const canPrice = can("estoque.produtos.visualizar_preco_venda");
  const defaultValues: ProdutoFormData = { categoriaProdutoId: editing?.categoriaProdutoId ?? null, nome: editing?.nome ?? "", descricao: editing?.descricao ?? "", codigoInterno: editing?.codigoInterno ?? "", codigoBarras: editing?.codigoBarras ?? "", valorCompra: editing?.valorCompra ?? 0, valorVenda: editing?.valorVenda ?? 0, quantidadeMinima: editing?.quantidadeMinima ?? 0 };
  const submit = async (data: ProdutoFormData) => { try { if (editing) { await mutations.updateProduto(editing.id, data); toast.success("Produto atualizado!"); } else { await mutations.createProduto(data); toast.success("Produto cadastrado!"); completeTaskTutorial("stock-products", "create-product"); } setOpen(false); } catch { /* hook exibe o erro */ } };
  const toggleActive = async () => { if (!toggle) return; try { await mutations.setProdutoActive(toggle.id, !toggle.isActive); toast.success(toggle.isActive ? "Produto inativado!" : "Produto reativado!"); setToggle(null); } catch { /* hook exibe o erro */ } };
  const columns: Column<Produto>[] = [{ key: "nome", label: "Nome" }, { key: "quantidadeAtual", label: "Estoque", render: (row) => { const low = row.quantidadeAtual <= row.quantidadeMinima; return <span className={low ? "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" : ""} title={low ? "Estoque no limite mínimo" : undefined}>{low && <AlertTriangle size={12} />}{row.quantidadeAtual}</span>; } }, { key: "quantidadeMinima", label: "Qtd. mínima", render: (row) => <span data-tutorial="stock-products-minimum" className="text-[#64748b] dark:text-slate-400">{row.quantidadeMinima}</span> }, ...(canCost ? [{ key: "valorCompra", label: "Custo", render: (row: Produto) => formatCurrency(row.valorCompra ?? 0) }] : []), ...(canPrice ? [{ key: "valorVenda", label: "Venda", render: (row: Produto) => formatCurrency(row.valorVenda ?? 0) }] : []), { key: "isActive", label: "Status", render: (row) => <span className={row.isActive ? "rounded-full bg-[#ecfdf5] px-2.5 py-1 text-xs font-semibold text-[#0f766e]" : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500"}>{row.isActive ? "Ativo" : "Inativo"}</span> }, { key: "actions", label: "", className: "text-right", render: (row) => { const actions = []; if (can("estoque.produtos.editar")) actions.push({ label: "Editar", onClick: () => { setEditing(row); setOpen(true); }, icon: <Pencil size={14} /> }); if (can("estoque.produtos.inativar")) actions.push(row.isActive ? { label: "Inativar", onClick: () => setToggle(row), variant: "danger" as const, icon: <Ban size={14} /> } : { label: "Reativar", onClick: () => setToggle(row), variant: "success" as const, icon: <RotateCcw size={14} /> }); return actions.length ? <ActionsDropdown actions={actions} /> : null; } }];
  return <div className="space-y-4 p-8"><PageHeader title="Produtos" actions={can("estoque.produtos.criar") ? <div data-tutorial="stock-products-new"><Button onClick={() => { setEditing(null); setOpen(true); }}>Novo Produto</Button></div> : undefined} /><div data-tutorial="stock-products-search"><SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Buscar por nome..." /></div><div data-tutorial="stock-products-list"><DataTable columns={columns} data={produtos} loading={query.isLoading} error={query.isError ? getApiErrorMessage(query.error, "Erro ao carregar produtos.") : null} onRetry={() => void query.refetch()} emptyMessage="Nenhum produto cadastrado." keyExtractor={(row) => row.id} /></div><Pagination page={page} totalPages={query.data?.totalPages ?? 0} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} /><ProdutoRegister open={open} defaultValues={defaultValues} loading={mutations.isCreating || mutations.isUpdating} onClose={() => setOpen(false)} onSubmit={submit} /><ConfirmDialog open={!!toggle} title={toggle?.isActive ? "Inativar produto" : "Reativar produto"} description={`Deseja ${toggle?.isActive ? "inativar" : "reativar"} "${toggle?.nome}"?`} confirmLabel={toggle?.isActive ? "Inativar" : "Reativar"} loading={mutations.isSettingActive} onCancel={() => setToggle(null)} onConfirm={toggleActive} /></div>;
}
