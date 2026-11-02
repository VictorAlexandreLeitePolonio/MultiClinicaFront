"use client";

import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { DataTable, Column } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { StatusToggleModal } from "@/components/ui/StatusToggleModal";
import { FilterPopover, FilterOption, FilterValues } from "@/components/ui/FilterPopover";
import { Button } from "@/components/ui/Button";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { ViewSwitcher, useViewPreference } from "@/components/ui/ViewSwitcher";
import { Eye, Power, Trash2, FileText, UserCircle, FileUp, LayoutGrid, Table2 } from "lucide-react";
import { usePacientesPaginated, PacienteFilters } from "../hooks/pagined";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { usePacienteDelete } from "../hooks/delete";
import { toast } from "sonner";
import { usePacienteChangeStatus } from "../hooks/changeStatus";
import { Patient } from "@/types";
import { formatCPF, formatPhone } from "@/utils/formatters";
import { PatientImportDialog } from "./PatientImportDialog";
import { PatientCard } from "./cards/PatientCard";

interface Props {
  onCreate: () => void;
  onViewDetails: (id: number) => void;
  onVerProntuarios?: (id: number) => void;
  onVerPerfil?: (id: number) => void;
}

const appointmentStatusOptions = [
  { value: "Scheduled", label: "Agendado" },
  { value: "Completed", label: "Completo" },
  { value: "Cancelled", label: "Cancelado" },
];

const paymentStatusOptions = [
  { value: "Pending", label: "Pendente" },
  { value: "Paid", label: "Pago" },
  { value: "Cancelled", label: "Cancelado" },
];

type PatientView = "table" | "cards";

const viewOptions = [
  { value: "table" as const, label: "Tabela", icon: Table2 },
  { value: "cards" as const, label: "Cards", icon: LayoutGrid },
];

const cardsContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

export default function PacienteList({ onCreate, onViewDetails, onVerProntuarios, onVerPerfil }: Props) {
  const [view, setView] = useViewPreference<PatientView>("pacientes", "table", ["table", "cards"]);
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
  } = usePacientesPaginated();
  const { deletePaciente, isPending: deleting } = usePacienteDelete();
  const { changeStatus, loading: changingStatus } = usePacienteChangeStatus();

  const [toDelete, setToDelete] = useState<Patient | null>(null);
  const [toToggleStatus, setToToggleStatus] = useState<Patient | null>(null);
  const [patientImportOpen, setPatientImportOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({
    appointmentStatus: "",
    paymentStatus: "",
  });

  const openPatient = (patient: Patient) => {
    if (onVerPerfil) {
      onVerPerfil(patient.id);
      return;
    }
    onViewDetails(patient.id);
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deletePaciente(toDelete.id);
      toast.success("Paciente excluído com sucesso!");
      setToDelete(null);
      refetch();
    } catch {
      // erro já tratado no hook
    }
  };

  const handleConfirmChangeStatus = async () => {
    if (!toToggleStatus) return;
    const result = await changeStatus(toToggleStatus.id);
    if (result.success) {
      setToToggleStatus(null);
      refetch();
    }
  };

  const handleFilterChange = (values: FilterValues) => {
    setFilterValues(values);
  };

  const handleApplyFilters = () => {
    const newFilters: PacienteFilters = {};
    if (filterValues.appointmentStatus) {
      newFilters.appointmentStatus = filterValues.appointmentStatus;
    }
    if (filterValues.paymentStatus) {
      newFilters.paymentStatus = filterValues.paymentStatus;
    }
    applyFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilterValues({
      appointmentStatus: "",
      paymentStatus: "",
    });
    clearFilters();
  };



  const filterOptions: FilterOption[] = [
    {
      key: "appointmentStatus",
      label: "Status da Consulta",
      options: appointmentStatusOptions,
    },
    {
      key: "paymentStatus",
      label: "Status do Pagamento",
      options: paymentStatusOptions,
    },
  ];

  const columns: Column<Patient>[] = [
    { key: "name", label: "Nome" },
    { key: "email", label: "E-mail" },
    { key: "cpf", label: "CPF", render: (p) => formatCPF(p.cpf ?? "") || "-" },
    { key: "phone", label: "Telefone", render: (p) => formatPhone(p.phone ?? "") || "-" },
    { key: "cidade", label: "Cidade" },
    {
      key: "appointmentStatus",
      label: "Status da Última Consulta",
      render: (p) => (
        <StatusBadge
          status={p.appointmentStatus}
          mapping={{
            Scheduled: { label: "Agendado", className: "bg-blue-100 text-blue-700 border-blue-200" },
            Completed: { label: "Completo", className: "bg-green-100 text-green-700 border-green-200" },
            Cancelled: { label: "Cancelado", className: "bg-red-100 text-red-700 border-red-200" },
          }}
        />
      ),
    },
    {
      key: "paymentStatus",
      label: "Status do Pagamento",
      render: (p) => (
        <StatusBadge
          status={p.paymentStatus}
          mapping={{
            Pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
            Paid: { label: "Pago", className: "bg-green-100 text-green-700 border-green-200" },
            Cancelled: { label: "Cancelado", className: "bg-red-100 text-red-700 border-red-200" },
          }}
        />
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (p) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold border ${
            p.isActive
              ? "bg-primary-dark text-white border-primary-dark"
              : "bg-red-100 text-red-700 border-red-200"
          }`}
        >
          {p.isActive ? "Ativo" : "Inativo"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (p) => (
        <span data-tutorial="patients-actions" onClick={(event) => event.stopPropagation()}>
        <ActionsDropdown
          actions={[
            {
              label: "Ver Perfil",
              onClick: () => onVerPerfil?.(p.id),
              icon: <UserCircle size={14} />,
            },
            {
              label: "Detalhes",
              onClick: () => onViewDetails(p.id),
              icon: <Eye size={14} />,
            },
            {
              label: "Ver Prontuários",
              onClick: () => onVerProntuarios?.(p.id),
              icon: <FileText size={14} />,
            },
            {
              label: p.isActive ? "Inativar" : "Ativar",
              onClick: () => setToToggleStatus(p),
              variant: p.isActive ? "danger" : "success",
              icon: <Power size={14} />,
            },
            {
              label: "Excluir",
              onClick: () => setToDelete(p),
              variant: "danger",
              icon: <Trash2 size={14} />,
            },
          ]}
        />
        </span>
      ),
    },
  ];

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pacientes"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ViewSwitcher options={viewOptions} value={view} onChange={setView} />
            <Button
              variant="outline"
              fullWidth={false}
              onClick={() => setPatientImportOpen(true)}
            >
              <FileUp size={16} aria-hidden="true" />
              Importar pacientes
            </Button>
            <div data-tutorial="patients-filters">
              <FilterPopover
                filters={filterOptions}
                values={filterValues}
                onChange={handleFilterChange}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
              />
            </div>
            <div data-tutorial="patients-new">
              <Button onClick={onCreate}>Novo Paciente</Button>
            </div>
          </div>
        }
      />

      <div data-tutorial="patients-search">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nome..."
        />
      </div>

      <div data-tutorial="patients-list">
        {view === "table" ? (
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            emptyMessage="Nenhum paciente encontrado."
            keyExtractor={(p) => p.id}
            onRowClick={openPatient}
          />
        ) : loading ? (
          <div className="paciente-cards" aria-busy="true">
            {Array.from({ length: Math.min(pageSize, 8) }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-gray-50)] motion-reduce:animate-none"
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-gray-200)] bg-[var(--color-card)] px-6 py-10 text-center shadow-[var(--shadow-sm)]">
            <p className="text-sm font-medium text-[var(--color-gray-600)]">
              Nenhum paciente encontrado.
            </p>
          </div>
        ) : (
          <motion.div
            key={`${page}-${view}`}
            initial={reduceMotion ? false : "hidden"}
            animate="show"
            variants={cardsContainer}
            className="paciente-cards"
          >
            {data.map((patient) => (
              <PatientCard key={patient.id} patient={patient} onOpen={openPatient} />
            ))}
          </motion.div>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <PatientImportDialog
        open={patientImportOpen}
        onClose={() => setPatientImportOpen(false)}
        onImported={(hasImportedPatients) => hasImportedPatients && refetch()}
      />

      <DeleteConfirmDialog
        open={!!toDelete}
        entityLabel="paciente"
        name={toDelete?.name ?? ""}
        loading={deleting}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      <StatusToggleModal
        open={!!toToggleStatus}
        entityLabel="paciente"
        name={toToggleStatus?.name ?? ""}
        isActive={toToggleStatus?.isActive ?? true}
        loading={changingStatus}
        onClose={() => setToToggleStatus(null)}
        onConfirm={handleConfirmChangeStatus}
      />
    </div>
  );
}
