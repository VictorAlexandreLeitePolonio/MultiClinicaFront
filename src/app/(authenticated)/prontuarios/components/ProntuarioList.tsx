"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { Eye, Trash2 } from "lucide-react";
import { useProntuariosPaginated } from "../hooks/pagined";
import { useProntuarioDelete } from "../hooks/delete";
import { toast } from "sonner";
import { MedicalRecord, User } from "@/types";
import api from "@/lib/api";

interface Props {
  onCreate: () => void;
  onViewCards: (patientId: number) => void;
  onViewDetails: (id: number) => void;
}

export default function ProntuarioList({ onCreate, onViewCards, onViewDetails }: Props) {
  const {
    data,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    loading,
    error,
    applyFilters,
    clearFilters,
    refetch,
  } = useProntuariosPaginated();
  const { deleteProntuario, isPending: deleting } = useProntuarioDelete();

  const [toDelete, setToDelete] = useState<MedicalRecord | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [patientName, setPatientName] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [userId, setUserId] = useState("");

  // Buscar lista de fisioterapeutas
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get<User[]>("/api/users");
        setUsers(response.data);
      } catch {
        // erro silencioso
      }
    };
    fetchUsers();
  }, []);

  // Aplicar filtros quando mudam
  useEffect(() => {
    const newFilters: { patientName?: string; userId?: number; createdAt?: string } = {};
    if (patientName) newFilters.patientName = patientName;
    if (userId) newFilters.userId = Number(userId);
    if (createdAt) newFilters.createdAt = createdAt;
    applyFilters(newFilters);
    setPage(1);
  }, [patientName, userId, createdAt, applyFilters, setPage]);

  const handleClearFilters = () => {
    setPatientName("");
    setCreatedAt("");
    setUserId("");
    clearFilters();
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteProntuario(toDelete.id);
      toast.success("Prontuário excluído com sucesso!");
      setToDelete(null);
      refetch();
    } catch {
      // erro já tratado no hook
    }
  };

  const columns: Column<MedicalRecord>[] = [
    { key: "id", label: "#", className: "w-16" },
    { 
      key: "patientName", 
      label: "Paciente",
      render: (r) => (
        <button
          onClick={() => onViewCards(r.patientId)}
          className="text-[#1a4a3a] hover:underline font-medium"
        >
          {r.patientName}
        </button>
      ),
    },
    { key: "userName", label: "Fisioterapeuta" },
    { key: "titulo", label: "Título" },
    { key: "sessao", label: "Sessão" },
    {
      key: "createdAt",
      label: "Criado em",
      render: (r) => new Date(r.createdAt).toLocaleDateString("pt-BR"),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (r) => (
        <ActionsDropdown
          actions={[
            {
              label: "Ver",
              onClick: () => onViewDetails(r.id),
              icon: <Eye size={14} />,
            },
            {
              label: "Excluir",
              onClick: () => setToDelete(r),
              variant: "danger",
              icon: <Trash2 size={14} />,
            },
          ]}
        />
      ),
    },
  ];

  const hasFilters = patientName || createdAt || userId;

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Prontuários"
        actions={
          <Button onClick={onCreate}>+ Novo Prontuário</Button>
        }
      />

      {/* Filtros em linha */}
      <div className="flex flex-wrap items-end gap-3 p-4 bg-[#f8faf9] rounded-sm border border-[#e2ebe6]">
        <div className="flex-1 min-w-50">
          <label className="block text-xs font-medium text-[#4a6354] mb-1">
            Nome do Paciente
          </label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Buscar paciente..."
            className="w-full h-10 px-3 rounded-sm border-2 border-[#e2ebe6] bg-white text-[#1b2e4b] focus:border-[#1a4a3a] focus:outline-none"
          />
        </div>

        <div className="w-45">
          <label className="block text-xs font-medium text-[#4a6354] mb-1">
            Data de Criação
          </label>
          <input
            type="date"
            value={createdAt}
            onChange={(e) => setCreatedAt(e.target.value)}
            className="w-full h-10 px-3 rounded-sm border-2 border-[#e2ebe6] bg-white text-[#1b2e4b] focus:border-[#1a4a3a] focus:outline-none"
          />
        </div>

        <div className="w-50">
          <label className="block text-xs font-medium text-[#4a6354] mb-1">
            Fisioterapeuta
          </label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full h-10 px-3 rounded-sm border-2 border-[#e2ebe6] bg-white text-[#1b2e4b] focus:border-[#1a4a3a] focus:outline-none"
          >
            <option value="">Todos</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <Button variant="outline" onClick={handleClearFilters}>
            Limpar
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="Nenhum prontuário encontrado."
        keyExtractor={(r) => r.id}
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
        entityLabel="prontuário"
        name={`${toDelete?.titulo} - ${toDelete?.patientName}`}
        loading={deleting}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
