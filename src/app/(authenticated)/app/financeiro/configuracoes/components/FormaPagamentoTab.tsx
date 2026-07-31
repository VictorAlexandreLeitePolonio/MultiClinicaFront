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
import { FormaPagamento } from "@/types";
import {
  useFormaPagamentoInsert,
  useFormaPagamentoSetActive,
  useFormaPagamentoUpdate,
  useFormasPagamentoPaginated,
} from "../hooks/useFormaPagamento";
import { FormaPagamentoFormData } from "../schemas/formaPagamento.schema";
import { FormaPagamentoDialog } from "./FormaPagamentoDialog";

export function FormaPagamentoTab() {
  const { data, page, setPage, pageSize, setPageSize, totalPages, loading, error, search, setSearch, refetch } =
    useFormasPagamentoPaginated();
  const { insertFormaPagamento, isPending: inserting } = useFormaPagamentoInsert();
  const { updateFormaPagamento, isPending: updating } = useFormaPagamentoUpdate();
  const { setFormaPagamentoActive, isPending: togglingActive } = useFormaPagamentoSetActive();

  const [editing, setEditing] = useState<FormaPagamento | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toToggle, setToToggle] = useState<FormaPagamento | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (formaPagamento: FormaPagamento) => {
    setEditing(formaPagamento);
    setDialogOpen(true);
  };

  const handleSubmit = async (formData: FormaPagamentoFormData) => {
    try {
      if (editing) {
        await updateFormaPagamento(editing.id, formData);
        toast.success("Forma de pagamento atualizada!");
      } else {
        await insertFormaPagamento(formData);
        toast.success("Forma de pagamento cadastrada!");
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
      await setFormaPagamentoActive(toToggle.id, !toToggle.isActive);
      toast.success(toToggle.isActive ? "Forma de pagamento inativada!" : "Forma de pagamento reativada!");
      setToToggle(null);
      refetch();
    } catch {
      // erro já tratado no hook
    }
  };

  const columns: Column<FormaPagamento>[] = [
    { key: "nome", label: "Nome" },
    {
      key: "isActive",
      label: "Status",
      render: (formaPagamento) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            formaPagamento.isActive
              ? "bg-[#ecfdf5] text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {formaPagamento.isActive ? "Ativa" : "Inativa"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (formaPagamento) => (
        <ActionsDropdown
          actions={[
            { label: "Editar", onClick: () => openEdit(formaPagamento), icon: <Pencil size={14} /> },
            formaPagamento.isActive
              ? {
                  label: "Inativar",
                  onClick: () => setToToggle(formaPagamento),
                  variant: "danger",
                  icon: <Ban size={14} />,
                }
              : {
                  label: "Reativar",
                  onClick: () => setToToggle(formaPagamento),
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
        <Button onClick={openCreate}>Nova Forma de Pagamento</Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyMessage="Nenhuma forma de pagamento cadastrada."
        keyExtractor={(formaPagamento) => formaPagamento.id}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <FormaPagamentoDialog
        open={dialogOpen}
        defaultValues={{ nome: editing?.nome ?? "" }}
        loading={inserting || updating}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!toToggle}
        title={toToggle?.isActive ? "Inativar forma de pagamento" : "Reativar forma de pagamento"}
        description={`Tem certeza que deseja ${toToggle?.isActive ? "inativar" : "reativar"} "${toToggle?.nome}"?`}
        confirmLabel={toToggle?.isActive ? "Inativar" : "Reativar"}
        loading={togglingActive}
        onCancel={() => setToToggle(null)}
        onConfirm={handleToggleActive}
      />
    </div>
  );
}
