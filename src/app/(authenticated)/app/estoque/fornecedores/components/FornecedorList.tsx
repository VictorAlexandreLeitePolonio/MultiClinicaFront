"use client";

import { useState } from "react";
import { Ban, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Column, DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDate } from "@/utils/formatters";
import { useFornecedores, useFornecedorMutations } from "../../../financeiro/fornecedores/hooks/useFornecedores";
import type { Fornecedor } from "../../../financeiro/fornecedores/services/fornecedores.service";
import type { FornecedorFormData } from "../schemas/fornecedor.schema";
import { FornecedorRegister } from "./FornecedorRegister";

// ponytail: sem permissão dedicada de fornecedor; reusa as de compras (consumidor direto).
export function FornecedorList() {
  const { can } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<Fornecedor | null>(null);
  const [open, setOpen] = useState(false);
  const [toggle, setToggle] = useState<Fornecedor | null>(null);
  const query = useFornecedores({ nome: search || undefined, page, pageSize });
  const mutations = useFornecedorMutations();
  const canManage = can("compras.criar");

  const submit = async (data: FornecedorFormData) => {
    try {
      if (editing) {
        await mutations.updateFornecedor(editing.id, data);
        toast.success("Fornecedor atualizado!");
      } else {
        await mutations.createFornecedor(data);
        toast.success("Fornecedor cadastrado!");
      }
      setOpen(false);
    } catch {
      // hook exibe o erro
    }
  };

  const toggleActive = async () => {
    if (!toggle) return;
    try {
      await mutations.setFornecedorActive(toggle.id, !toggle.isActive);
      toast.success(toggle.isActive ? "Fornecedor inativado!" : "Fornecedor reativado!");
      setToggle(null);
    } catch {
      // hook exibe o erro
    }
  };

  const columns: Column<Fornecedor>[] = [
    { key: "nome", label: "Nome" },
    { key: "createdAt", label: "Cadastrado em", render: (row) => formatDate(row.createdAt) },
    { key: "isActive", label: "Status", render: (row) => <span className={row.isActive ? "rounded-full bg-[#ecfdf5] px-2.5 py-1 text-xs font-semibold text-[#0f766e]" : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500"}>{row.isActive ? "Ativo" : "Inativo"}</span> },
    { key: "actions", label: "", className: "text-right", render: (row) => {
      if (!canManage) return null;
      const actions = [
        { label: "Editar", onClick: () => { setEditing(row); setOpen(true); }, icon: <Pencil size={14} /> },
        row.isActive
          ? { label: "Inativar", onClick: () => setToggle(row), variant: "danger" as const, icon: <Ban size={14} /> }
          : { label: "Reativar", onClick: () => setToggle(row), variant: "success" as const, icon: <RotateCcw size={14} /> },
      ];
      return <span data-tutorial="suppliers-actions"><ActionsDropdown actions={actions} /></span>;
    } },
  ];

  return (
    <div className="space-y-4 p-8">
      <PageHeader title="Fornecedores" actions={canManage ? <div data-tutorial="suppliers-new"><Button onClick={() => { setEditing(null); setOpen(true); }}>Novo Fornecedor</Button></div> : undefined} />
      <div data-tutorial="suppliers-search">
        <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Buscar por nome..." />
      </div>
      <div data-tutorial="suppliers-list">
        <DataTable columns={columns} data={query.data?.data ?? []} loading={query.isLoading} error={query.isError ? getApiErrorMessage(query.error, "Erro ao carregar fornecedores.") : null} onRetry={() => void query.refetch()} emptyMessage="Nenhum fornecedor cadastrado." keyExtractor={(row) => row.id} />
      </div>
      <Pagination page={page} totalPages={query.data?.totalPages ?? 0} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
      <FornecedorRegister open={open} defaultValues={{ nome: editing?.nome ?? "" }} loading={mutations.isCreating || mutations.isUpdating} onClose={() => setOpen(false)} onSubmit={submit} />
      <ConfirmDialog open={!!toggle} title={toggle?.isActive ? "Inativar fornecedor" : "Reativar fornecedor"} description={`Deseja ${toggle?.isActive ? "inativar" : "reativar"} "${toggle?.nome}"?`} confirmLabel={toggle?.isActive ? "Inativar" : "Reativar"} loading={mutations.isSettingActive} onCancel={() => setToggle(null)} onConfirm={toggleActive} />
    </div>
  );
}
