"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { DataTable, Column } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { FilterPopover, FilterOption, FilterValues } from "@/components/ui/FilterPopover";
import { Button } from "@/components/ui/Button";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { ViewSwitcher } from "@/components/ui/ViewSwitcher";
import { Eye, CheckCircle, XCircle, Trash2, List, CalendarDays, Columns3, Mic } from "lucide-react";
import { useAgendaPaginated, AgendaFilters } from "../hooks/pagined";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { useAgendaDelete } from "../hooks/delete";
import { toast } from "sonner";
import { useAgendaChangeStatus } from "../hooks/changeStatus";
import { Appointment } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useConsultationRecorder } from "@/components/consultation/ConsultationRecorderProvider";
import { ConsultationStatusIcon } from "@/components/consultation/ConsultationStatusIcon";
import { ConsentDialog } from "@/components/consultation/ConsentDialog";
import {
  canStartConsultation,
  useStartConsultation,
} from "./consultation/StartConsultationButton";

export type AgendaView = "list" | "week" | "day";

interface Props {
  onCreate: () => void;
  onViewDetails: (id: number) => void;
  view: AgendaView;
  onChangeView: (view: AgendaView) => void;
}

const statusOptions = [
  { value: "Scheduled", label: "Agendado" },
  { value: "Completed", label: "Completo" },
  { value: "Cancelled", label: "Cancelado" },
];

const viewOptions = [
  { value: "list" as const, label: "Lista", icon: List },
  { value: "week" as const, label: "Semana", icon: CalendarDays },
  { value: "day" as const, label: "Dia", icon: Columns3, mobile: false },
];

const statusMapping = {
  Scheduled: { label: "Agendado", className: "bg-blue-100 text-blue-700 border-blue-200" },
  Completed: { label: "Completo", className: "bg-green-100 text-green-700 border-green-200" },
  Cancelled: { label: "Cancelado", className: "bg-red-100 text-red-700 border-red-200" },
};

export default function AgendaList({ onCreate, onViewDetails, view, onChangeView }: Props) {
  const reduceMotion = useReducedMotion();
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
  const { user } = useAuth();
  const { active: activeConsultation } = useConsultationRecorder();
  const {
    target: startTarget,
    starting: startingConsultation,
    open: openStartConsultation,
    close: closeStartConsultation,
    confirm: confirmStartConsultation,
  } = useStartConsultation(refetch);
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
      render: (a) => <span className="font-mono">{formatDateTime(a.appointmentDate)}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (a) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={a.status} mapping={statusMapping} />
          <ConsultationStatusIcon
            status={a.consultationStatus}
            reviewed={a.consultationReviewed}
          />
        </div>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (a) => (
        <ActionsDropdown
          actions={[
            ...(canStartConsultation(a, user?.role) &&
            activeConsultation?.appointmentId !== a.id
              ? [
                  {
                    label: "Iniciar consulta",
                    onClick: () => openStartConsultation(a),
                    icon: <Mic size={14} />,
                  },
                ]
              : []),
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

  return (
    <div className="space-y-4">
      <PageHeader
        title="Agenda"
        description="Consultas da clínica por período e profissional."
        actions={
          <div className="flex flex-wrap gap-2">
            <div data-tutorial="agenda-view-mode">
              <ViewSwitcher options={viewOptions} value={view} onChange={onChangeView} />
            </div>
            <div data-tutorial="agenda-filters">
              <FilterPopover
                filters={filterOptions}
                values={filterValues}
                onChange={handleFilterChange}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
              />
            </div>
            <div data-tutorial="agenda-new">
              <Button onClick={onCreate}>Novo agendamento</Button>
            </div>
          </div>
        }
      />

      {error && view === "list" && <p role="alert" className="text-sm text-red-600">{error}</p>}

      {view === "list" && (
        <motion.div
          key="list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.15 }}
          className="space-y-4"
        >
          <div data-tutorial="agenda-search">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar por nome do paciente..."
            />
          </div>

          <div data-tutorial="agenda-list">
            <DataTable
              columns={columns}
              data={data}
              loading={loading}
              emptyMessage="Nenhum agendamento encontrado."
              keyExtractor={(a) => a.id}
            />
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />

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

          <ConsentDialog
            open={Boolean(startTarget)}
            loading={startingConsultation}
            onCancel={closeStartConsultation}
            onConfirm={() => void confirmStartConsultation()}
          />
        </motion.div>
      )}
    </div>
  );
}
