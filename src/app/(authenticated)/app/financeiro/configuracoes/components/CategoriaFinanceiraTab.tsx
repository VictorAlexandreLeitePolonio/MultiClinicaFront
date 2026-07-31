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
import { CategoriaFinanceira } from "@/types";
import {
  useCategoriaFinanceiraInsert,
  useCategoriaFinanceiraSetActive,
  useCategoriaFinanceiraUpdate,
  useCategoriasFinanceirasPaginated,
} from "../hooks/useCategoriaFinanceira";
import { CategoriaFinanceiraFormData } from "../schemas/categoriaFinanceira.schema";
import { CategoriaFinanceiraDialog } from "./CategoriaFinanceiraDialog";

export function CategoriaFinanceiraTab() {
  const { data, page, setPage, pageSize, setPageSize, totalPages, loading, error, search, setSearch, refetch } =
    useCategoriasFinanceirasPaginated();
  const { insertCategoriaFinanceira, isPending: inserting } = useCategoriaFinanceiraInsert();
  const { updateCategoriaFinanceira, isPending: updating } = useCategoriaFinanceiraUpdate();
  const { setCategoriaFinanceiraActive, isPending: togglingActive } = useCategoriaFinanceiraSetActive();

  const [editing, setEditing] = useState<CategoriaFinanceira | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toToggle, setToToggle] = useState<CategoriaFinanceira | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (categoria: CategoriaFinanceira) => {
    setEditing(categoria);
    setDialogOpen(true);
  };

  const handleSubmit = async (formData: CategoriaFinanceiraFormData) => {
    try {
      if (editing) {
        await updateCategoriaFinanceira(editing.id, formData);
        toast.success("Categoria financeira atualizada!");
      } else {
        await insertCategoriaFinanceira(formData);
        toast.success("Categoria financeira cadastrada!");
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
      await setCategoriaFinanceiraActive(toToggle.id, !toToggle.isActive);
      toast.success(toToggle.isActive ? "Categoria inativada!" : "Categoria reativada!");
      setToToggle(null);
      refetch();
    } catch {
      // erro já tratado no hook
    }
  };

  const columns: Column<CategoriaFinanceira>[] = [
    { key: "nome", label: "Nome" },
    {
      key: "tipo",
      label: "Tipo",
      render: (categoria) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            categoria.tipo === "Receita"
              ? "bg-[#ecfdf5] text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]"
              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
          }`}
        >
          {categoria.tipo}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (categoria) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            categoria.isActive
              ? "bg-[#ecfdf5] text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {categoria.isActive ? "Ativa" : "Inativa"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (categoria) => (
        <ActionsDropdown
          actions={[
            { label: "Editar", onClick: () => openEdit(categoria), icon: <Pencil size={14} /> },
            categoria.isActive
              ? {
                  label: "Inativar",
                  onClick: () => setToToggle(categoria),
                  variant: "danger",
                  icon: <Ban size={14} />,
                }
              : {
                  label: "Reativar",
                  onClick: () => setToToggle(categoria),
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
        <Button onClick={openCreate}>Nova Categoria</Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        onRetry={refetch}
        emptyMessage="Nenhuma categoria financeira cadastrada."
        keyExtractor={(categoria) => categoria.id}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <CategoriaFinanceiraDialog
        open={dialogOpen}
        defaultValues={{ nome: editing?.nome ?? "", tipo: editing?.tipo ?? "Receita" }}
        loading={inserting || updating}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!toToggle}
        title={toToggle?.isActive ? "Inativar categoria" : "Reativar categoria"}
        description={`Tem certeza que deseja ${toToggle?.isActive ? "inativar" : "reativar"} "${toToggle?.nome}"?`}
        confirmLabel={toToggle?.isActive ? "Inativar" : "Reativar"}
        loading={togglingActive}
        onCancel={() => setToToggle(null)}
        onConfirm={handleToggleActive}
      />
    </div>
  );
}
