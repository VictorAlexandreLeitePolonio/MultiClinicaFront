"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, Plus, Trash2 } from "lucide-react";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { Button } from "@/components/ui/Button";
import { Column, DataTable } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/utils/formatters";
import { EvolutionTemplate } from "@/types/evolution";
import { useEvolutionTemplateMutations, useEvolutionTemplates } from "../hooks/useEvolutionTemplates";

interface EvolutionTemplateListProps {
  onCreate: () => void;
  onViewDetails: (id: number) => void;
}

export function EvolutionTemplateList({ onCreate, onViewDetails }: EvolutionTemplateListProps) {
  const { user } = useAuth();
  const canEdit = user?.role === "Administrador";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toDelete, setToDelete] = useState<EvolutionTemplate | null>(null);
  const { data, isLoading, error, refetch } = useEvolutionTemplates(page, pageSize);
  const { deleteTemplate } = useEvolutionTemplateMutations();

  const columns: Column<EvolutionTemplate>[] = [
    { key: "name", label: "Modelo" },
    { key: "category", label: "Categoria", render: (template) => template.category || "-" },
    {
      key: "isActive",
      label: "Status",
      render: (template) => (
        <StatusBadge
          status={template.isActive ? "Active" : "Inactive"}
          mapping={{
            Active: { label: "Ativo", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
            Inactive: { label: "Inativo", className: "border-slate-200 bg-slate-50 text-slate-600" },
          }}
        />
      ),
    },
    {
      key: "isDefault",
      label: "Padrão",
      render: (template) => template.isDefault ? "Sim" : "Não",
    },
    { key: "createdAt", label: "Criado em", render: (template) => formatDate(template.createdAt) },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (template) => (
        <ActionsDropdown
          actions={[
            { label: "Detalhes", onClick: () => onViewDetails(template.id), icon: <Eye size={14} /> },
            ...(canEdit && template.isActive
              ? [{ label: "Desativar", onClick: () => setToDelete(template), variant: "danger" as const, icon: <Trash2 size={14} /> }]
              : []),
          ]}
        />
      ),
    },
  ];

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteTemplate.mutateAsync(toDelete.id);
      toast.success("Modelo desativado com sucesso.");
      setToDelete(null);
    } catch {
      toast.error("Erro ao desativar modelo.");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Modelos de evolução"
        actions={canEdit ? <Button onClick={onCreate}><Plus size={16} className="mr-2" />Novo modelo</Button> : null}
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        error={error ? "Erro ao carregar modelos de evolução." : null}
        onRetry={refetch}
        emptyMessage="Nenhum modelo de evolução encontrado."
        keyExtractor={(template) => template.id}
      />

      <Pagination
        page={page}
        totalPages={data?.totalPages ?? 1}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <DeleteConfirmDialog
        open={!!toDelete}
        entityLabel="modelo de evolução"
        name={toDelete?.name ?? ""}
        loading={deleteTemplate.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
