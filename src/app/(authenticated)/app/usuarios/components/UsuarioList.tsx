"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { DataTable, Column } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { Button } from "@/components/ui/Button";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { Eye, Trash2 } from "lucide-react";
import { useUsuariosPaginated } from "../hooks/pagined";
import { useUsuarioDelete } from "../hooks/delete";
import { toast } from "sonner";
import { User } from "@/types";
import { formatDate } from "@/utils/formatters";
import { getRoleLabel } from "@/lib/auth/routes";

interface Props {
  onCreate: () => void;
  onViewDetails: (id: number) => void;
}

export default function UsuarioList({ onCreate, onViewDetails }: Props) {
  const { data, loading, error, search, setSearch, refetch } = useUsuariosPaginated();
  const { deleteUsuario, isPending: deleting } = useUsuarioDelete();

  const [toDelete, setToDelete] = useState<User | null>(null);

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteUsuario(toDelete.id);
      toast.success("Usuário excluído com sucesso!");
      setToDelete(null);
      refetch();
    } catch {
      // erro já tratado no hook
    }
  };

  const columns: Column<User>[] = [
    { key: "name", label: "Nome" },
    { key: "email", label: "E-mail" },
    {
      key: "role",
      label: "Perfil",
      render: (u) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold border ${
            u.role === "Administrador"
              ? "bg-secondary text-white border-secondary"
              : "bg-primary-dark text-white border-primary-dark"
          }`}
        >
          {getRoleLabel(u.role)}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Data de Criação",
      render: (u) => (u.createdAt ? formatDate(u.createdAt) : "-"),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (u) => (
        <ActionsDropdown
          actions={[
            {
              label: "Detalhes",
              onClick: () => onViewDetails(u.id),
              icon: <Eye size={14} />,
            },
            {
              label: "Excluir",
              onClick: () => setToDelete(u),
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
        title="Usuários"
        actions={<Button onClick={onCreate}>Novo Usuário</Button>}
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
        emptyMessage="Nenhum usuário encontrado."
        keyExtractor={(u) => u.id}
      />

      <DeleteConfirmDialog
        open={!!toDelete}
        entityLabel="usuário"
        name={toDelete?.name ?? ""}
        loading={deleting}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
