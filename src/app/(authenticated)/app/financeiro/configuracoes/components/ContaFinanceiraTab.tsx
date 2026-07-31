"use client";

import { useState } from "react";
import { Ban, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Column, DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { SearchInput } from "@/components/ui/SearchInput";
import { ContaFinanceira } from "@/types";
import { formatCurrency } from "@/utils/formatters";
import {
  useContaFinanceiraInsert,
  useContaFinanceiraSetActive,
  useContaFinanceiraUpdate,
  useContasFinanceirasPaginated,
} from "../hooks/useContaFinanceira";
import { ContaFinanceiraFormData } from "../schemas/contaFinanceira.schema";
import { ContaFinanceiraDialog } from "./ContaFinanceiraDialog";

export function ContaFinanceiraTab() {
  const { data, page, setPage, pageSize, setPageSize, totalPages, loading, error, search, setSearch, refetch } =
    useContasFinanceirasPaginated();
  const { insertContaFinanceira, isPending: inserting } = useContaFinanceiraInsert();
  const { updateContaFinanceira, isPending: updating } = useContaFinanceiraUpdate();
  const { setContaFinanceiraActive, isPending: togglingActive } = useContaFinanceiraSetActive();

  const [editing, setEditing] = useState<ContaFinanceira | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toToggle, setToToggle] = useState<ContaFinanceira | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (conta: ContaFinanceira) => {
    setEditing(conta);
    setDialogOpen(true);
  };

  const handleSubmit = async (formData: ContaFinanceiraFormData) => {
    try {
      if (editing) {
        await updateContaFinanceira(editing.id, formData);
        toast.success("Conta financeira atualizada!");
      } else {
        await insertContaFinanceira(formData);
        toast.success("Conta financeira cadastrada!");
      }
      setDialogOpen(false);
      refetch();
    } catch {
      // erro já tratado no hook
    }
  };

  const handleToggleActive = async () => {
    if (!toToggle) return;
    try {
      await setContaFinanceiraActive(toToggle.id, !toToggle.isActive);
      toast.success(toToggle.isActive ? "Conta inativada!" : "Conta reativada!");
      setToToggle(null);
      refetch();
    } catch {
      // erro já tratado no hook
    }
  };

  const columns: Column<ContaFinanceira>[] = [
    { key: "nome", label: "Nome" },
    { key: "tipo", label: "Tipo" },
    {
      key: "saldoInicial",
      label: "Saldo Inicial",
      render: (conta) => formatCurrency(conta.saldoInicial),
    },
    {
      key: "isActive",
      label: "Status",
      render: (conta) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            conta.isActive
              ? "bg-[#ecfdf5] text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {conta.isActive ? "Ativa" : "Inativa"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (conta) => (
        <ActionsDropdown
          actions={[
            { label: "Editar", onClick: () => openEdit(conta), icon: <Pencil size={14} /> },
            conta.isActive
              ? {
                  label: "Inativar",
                  onClick: () => setToToggle(conta),
                  variant: "danger",
                  icon: <Ban size={14} />,
                }
              : {
                  label: "Reativar",
                  onClick: () => setToToggle(conta),
                  variant: "success",
                  icon: <RotateCcw size={14} />,
                },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome..." />
        <Button onClick={openCreate}>Nova Conta Financeira</Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyMessage="Nenhuma conta financeira cadastrada."
        keyExtractor={(conta) => conta.id}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <ContaFinanceiraDialog
        open={dialogOpen}
        defaultValues={{
          nome: editing?.nome ?? "",
          tipo: editing?.tipo ?? "Caixa",
          saldoInicial: editing?.saldoInicial ?? 0,
        }}
        loading={inserting || updating}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!toToggle}
        title={toToggle?.isActive ? "Inativar conta financeira" : "Reativar conta financeira"}
        description={`Tem certeza que deseja ${toToggle?.isActive ? "inativar" : "reativar"} "${toToggle?.nome}"?`}
        confirmLabel={toToggle?.isActive ? "Inativar" : "Reativar"}
        loading={togglingActive}
        onCancel={() => setToToggle(null)}
        onConfirm={handleToggleActive}
      />
    </div>
  );
}
