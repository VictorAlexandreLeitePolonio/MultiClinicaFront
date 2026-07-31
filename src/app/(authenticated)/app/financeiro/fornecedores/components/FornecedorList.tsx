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
import { useFornecedorMutations, useFornecedores } from "../hooks/useFornecedores";
import type { Fornecedor } from "../services/fornecedores.service";
import type { FornecedorFormData } from "../schemas/fornecedor.schema";
import { FornecedorRegister } from "./FornecedorRegister";

interface FornecedorListProps {
  onCreate?: () => void;
}

export function FornecedorList({ onCreate }: FornecedorListProps) {
  const { can } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<Fornecedor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toToggle, setToToggle] = useState<Fornecedor | null>(null);

  const query = useFornecedores({
    nome: search || undefined,
    page,
    pageSize,
  });
  const {
    createFornecedor,
    updateFornecedor,
    setFornecedorActive,
    isCreating,
    isUpdating,
    isSettingActive,
  } = useFornecedorMutations();

  const canCreate = can("financeiro.fornecedores.criar");
  const canEdit = can("financeiro.fornecedores.editar");
  const canToggleActive = can("financeiro.fornecedores.inativar");
  const fornecedores = query.data?.data ?? [];
  const totalPages = query.data?.totalPages ?? 0;
  const error = query.isError
    ? getApiErrorMessage(query.error, "Erro ao carregar fornecedores.")
    : null;

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
    onCreate?.();
  };

  const openEdit = (fornecedor: Fornecedor) => {
    setEditing(fornecedor);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: FornecedorFormData) => {
    try {
      if (editing) {
        await updateFornecedor(editing.id, data);
        toast.success("Fornecedor atualizado!");
      } else {
        await createFornecedor(data);
        toast.success("Fornecedor cadastrado!");
      }
      setDialogOpen(false);
    } catch {
      // o hook já exibe o erro da API
    }
  };

  const handleToggleActive = async () => {
    if (!toToggle) return;

    try {
      await setFornecedorActive(toToggle.id, !toToggle.isActive);
      toast.success(toToggle.isActive ? "Fornecedor inativado!" : "Fornecedor reativado!");
      setToToggle(null);
    } catch {
      // o hook já exibe o erro da API
    }
  };

  const columns: Column<Fornecedor>[] = [
    { key: "nome", label: "Nome" },
    {
      key: "isActive",
      label: "Status",
      render: (fornecedor) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            fornecedor.isActive
              ? "bg-[#ecfdf5] text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {fornecedor.isActive ? "Ativo" : "Inativo"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Cadastro",
      render: (fornecedor) => new Date(fornecedor.createdAt).toLocaleDateString("pt-BR"),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (fornecedor) => {
        const actions = [];
        if (canEdit) {
          actions.push({
            label: "Editar",
            onClick: () => openEdit(fornecedor),
            icon: <Pencil size={14} />,
          });
        }
        if (canToggleActive) {
          actions.push(
            fornecedor.isActive
              ? {
                  label: "Inativar",
                  onClick: () => setToToggle(fornecedor),
                  variant: "danger" as const,
                  icon: <Ban size={14} />,
                }
              : {
                  label: "Reativar",
                  onClick: () => setToToggle(fornecedor),
                  variant: "success" as const,
                  icon: <RotateCcw size={14} />,
                },
          );
        }
        return actions.length > 0 ? <ActionsDropdown actions={actions} /> : null;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fornecedores"
        actions={canCreate ? <Button onClick={openCreate}>Novo Fornecedor</Button> : undefined}
      />

      <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Buscar por nome..." />

      <DataTable
        columns={columns}
        data={fornecedores}
        loading={query.isLoading}
        error={error}
        onRetry={() => void query.refetch()}
        emptyMessage="Nenhum fornecedor cadastrado."
        keyExtractor={(fornecedor) => fornecedor.id}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
      />

      <FornecedorRegister
        open={dialogOpen}
        defaultValues={{ nome: editing?.nome ?? "" }}
        loading={isCreating || isUpdating}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!toToggle}
        title={toToggle?.isActive ? "Inativar fornecedor" : "Reativar fornecedor"}
        description={`Tem certeza que deseja ${toToggle?.isActive ? "inativar" : "reativar"} "${toToggle?.nome}"?`}
        confirmLabel={toToggle?.isActive ? "Inativar" : "Reativar"}
        loading={isSettingActive}
        onCancel={() => setToToggle(null)}
        onConfirm={handleToggleActive}
      />
    </div>
  );
}
