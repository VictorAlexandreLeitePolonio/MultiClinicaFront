"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { DataTable, Column } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { FilterPopover, FilterOption, FilterValues } from "@/components/ui/FilterPopover";
import { Button } from "@/components/ui/Button";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { Eye, CheckCircle, XCircle, Trash2, List, CalendarDays } from "lucide-react";
import { useAgendaPaginated, AgendaFilters } from "../hooks/pagined";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { useAgendaDelete } from "../hooks/delete";
import { toast } from "sonner";
import { useAgendaChangeStatus } from "../hooks/changeStatus";
import { Appointment } from "@/types";

interface Props {
  onCreate: () => void;
  onViewDetails: (id: number) => void;
  viewMode?: "list" | "calendar";
  onChangeViewMode?: (mode: "list" | "calendar") => void;
}

const statusOptions = [
  { value: "Scheduled", label: "Agendado" },
  { value: "Completed", label: "Completo" },
  { value: "Cancelled", label: "Cancelado" },
];

export default function AgendaList({ onCreate, onViewDetails, viewMode = "list", onChangeViewMode }: Props) {
  const {
    data,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    loading,
    error,
    search,
    setSearch,
    applyFilters,
    clearFilters,
    refetch,
  } = useAgendaPaginated();
  const { deleteAgenda, isPending: deleting } = useAgendaDelete();
  const { changeStatus, loading: changingStatus } = useAgendaChangeStatus();

  const [toDelete, setToDelete] = useState<Appointment | null>(null);
  const [toChangeStatus, setToChangeStatus] = useState<Appointment | null>(null);
  const [newStatus, setNewStatus] = useState<"Scheduled" | "Completed" | "Cancelled">("Scheduled");
  const [filterValues, setFilterValues] = useState<FilterValues>({
    status: "",
  });

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteAgenda(toDelete.id);
      toast.success("Agendamento cancelado com sucesso!");
      setToDelete(null);
      refetch();
    } catch {
      // erro já tratado no hook
    }
  };

  const handleConfirmChangeStatus = async () => {
    if (!toChangeStatus) return;
    const result = await changeStatus(toChangeStatus.id, newStatus);
    if (result.success) {
      setToChangeStatus(null);
      refetch();
    }
  };

  const handleFilterChange = (values: FilterValues) => {
    setFilterValues(values);
  };

  const handleApplyFilters = () => {
    const newFilters: AgendaFilters = {};
    if (filterValues.status) {
      newFilters.status = filterValues.status;
    }
    applyFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilterValues({
      status: "",
    });
    clearFilters();
  };

  const openStatusModal = (appointment: Appointment, status: "Scheduled" | "Completed" | "Cancelled") => {
    setToChangeStatus(appointment);
    setNewStatus(status);
  };



  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filterOptions: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: statusOptions,
    },
  ];

  const columns: Column<Appointment>[] = [
    { key: "patientName", label: "Paciente" },
    { key: "userName", label: "Usuário" },

    {
      key: "appointmentDate",
      label: "Data e Hora",
      render: (a) => formatDateTime(a.appointmentDate),
    },
    {
      key: "status",
      label: "Status",
      render: (a) => (
        <StatusBadge
          status={a.status}
          mapping={{
            Scheduled: { label: "Agendado", className: "bg-blue-100 text-blue-700 border-blue-200" },
            Completed: { label: "Completo", className: "bg-green-100 text-green-700 border-green-200" },
            Cancelled: { label: "Cancelado", className: "bg-red-100 text-red-700 border-red-200" },
          }}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (a) => (
        <ActionsDropdown
          actions={[
            {
              label: "Detalhes",
              onClick: () => onViewDetails(a.id),
              icon: <Eye size={14} />,
            },
            ...(a.status !== "Completed"
              ? [
                  {
                    label: "Completar",
                    onClick: () => openStatusModal(a, "Completed" as const),
                    variant: "success" as const,
                    icon: <CheckCircle size={14} />,
                  },
                ]
              : []),
            ...(a.status !== "Cancelled"
              ? [
                  {
                    label: "Cancelar",
                    onClick: () => openStatusModal(a, "Cancelled" as const),
                    variant: "danger" as const,
                    icon: <XCircle size={14} />,
                  },
                ]
              : []),
            {
              label: "Excluir",
              onClick: () => setToDelete(a),
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
        title="Agenda"
        actions={
          <div className="flex gap-2">
            <div className="flex items-center bg-white border-2 border-[#e2ebe6] rounded-sm">
              <button
                type="button"
                onClick={() => onChangeViewMode?.("list")}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-r border-[#e2ebe6] last:border-r-0 ${
                  viewMode === "list"
                    ? "bg-[#1a4a3a] text-white"
                    : "bg-white text-[#4a6354] hover:bg-[#f0f4f2]"
                }`}
                style={{ fontFamily: "var(--font-serif)" }}
              >
                <List size={16} />
                Lista
              </button>
              <button
                type="button"
                onClick={() => onChangeViewMode?.("calendar")}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                  viewMode === "calendar"
                    ? "bg-[#1a4a3a] text-white"
                    : "bg-white text-[#4a6354] hover:bg-[#f0f4f2]"
                }`}
                style={{ fontFamily: "var(--font-serif)" }}
              >
                <CalendarDays size={16} />
                Calendário
              </button>
            </div>
            <FilterPopover
              filters={filterOptions}
              values={filterValues}
              onChange={handleFilterChange}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
            />
            <Button onClick={onCreate}>Novo Agendamento</Button>
          </div>
        }
      />

      {viewMode === "list" && (
        <>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nome do paciente..."
      />

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="Nenhum agendamento encontrado."
        keyExtractor={(a) => a.id}
      />
      </>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {viewMode === "list" && (
        <>
          <DeleteConfirmDialog
            open={!!toDelete}
            entityLabel="agendamento"
            name={`de ${toDelete?.patientName ?? ""}`}
            loading={deleting}
            onClose={() => setToDelete(null)}
            onConfirm={handleConfirmDelete}
          />

          {/* Status Change Modal */}
          {toChangeStatus && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white p-6 rounded-sm shadow-lg max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Alterar Status</h3>
                <p className="text-gray-600 mb-6">
                  Deseja alterar o status do agendamento de <strong>{toChangeStatus.patientName}</strong> para <strong>
                    {newStatus === "Completed" ? "Completo" : "Cancelado"}
                  </strong>?
                </p>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setToChangeStatus(null)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleConfirmChangeStatus} 
                    loading={changingStatus}
                    variant={newStatus === "Cancelled" ? "danger" : "primary"}
                  >
                    Confirmar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
