"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { DataTable, Column } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { Button } from "@/components/ui/Button";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { Eye, Trash2 } from "lucide-react";
import { usePlanosPaginated } from "../hooks/pagined";
import { Pagination } from "@/components/ui/Pagination";
import { usePlanoDelete } from "../hooks/delete";
import { Plan } from "@/types";
import { formatCurrency } from "@/utils/formatters";
import { toast } from "sonner";

interface Props {
  onCreate: () => void;
  onViewDetails: (id: number) => void;
}

export default function PlanoList({ onCreate, onViewDetails }: Props) {
  const { data, page, setPage, pageSize, setPageSize, totalPages, loading, error, search, setSearch, refetch } = usePlanosPaginated();
  const { deletePlano, isPending: deleting } = usePlanoDelete();

  const [toDelete, setToDelete] = useState<Plan | null>(null);

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deletePlano(toDelete.id);
      toast.success("Plano excluído com sucesso!");
      setToDelete(null);
      refetch();
    } catch {
      // erro já tratado no hook
    }
  };

  const columns: Column<Plan>[] = [
    { key: "name", label: "Nome" },
    {
      key: "valor",
      label: "Valor",
      render: (p) => formatCurrency(p.valor),
    },
    {
      key: "tipoPlano",
      label: "Tipo",
      render: (p) => (
        <span
          className={`px-2 py-1 rounded-sm text-xs font-semibold border-2 ${
            p.tipoPlano === "Mensal"
              ? "bg-[#1a4a3a] text-white border-[#143d2f]"
              : "bg-[#1a2a4a] text-white border-[#121d33]"
          }`}
        >
          {p.tipoPlano}
        </span>
      ),
    },
    { key: "tipoSessao", label: "Sessão" },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (p) => (
        <ActionsDropdown
          actions={[
            {
              label: "Detalhes",
              onClick: () => onViewDetails(p.id),
              icon: <Eye size={14} />,
            },
            {
              label: "Excluir",
              onClick: () => setToDelete(p),
              variant: "danger",
              icon: <Trash2 size={14} />,
            },
          ]}
        />
      ),
    },
  ];

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Planos"
        actions={<Button onClick={onCreate}>Novo Plano</Button>}
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nome..."
      />

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="Nenhum plano encontrado."
        keyExtractor={(p) => p.id}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <DeleteConfirmDialog
        open={!!toDelete}
        entityLabel="plano"
        name={toDelete?.name ?? ""}
        loading={deleting}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
