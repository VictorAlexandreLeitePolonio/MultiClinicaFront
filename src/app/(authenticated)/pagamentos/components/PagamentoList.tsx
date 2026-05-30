"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { DataTable, Column } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { FilterPopover, FilterOption, FilterValues } from "@/components/ui/FilterPopover";
import { Button } from "@/components/ui/Button";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { Eye, Trash2, Check, Minus } from "lucide-react";
import { usePagamentosPaginated, PagamentoFilters } from "../hooks/pagined";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { usePagamentoDelete } from "../hooks/delete";
import { Payment, Patient, PagedResult } from "@/types";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { toast } from "sonner";

interface Props {
  onCreate: () => void;
  onViewDetails: (id: number) => void;
}

const paymentStatusOptions = [
  { value: "Pending", label: "Pendente" },
  { value: "Paid", label: "Pago" },
  { value: "Cancelled", label: "Cancelado" },
];

export default function PagamentoList({ onCreate, onViewDetails }: Props) {
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
    filters,
    applyFilters,
    clearFilters,
    refetch,
  } = usePagamentosPaginated();
  const { deletePagamento, isPending: deleting } = usePagamentoDelete();

  const [toDelete, setToDelete] = useState<Payment | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get<PagedResult<Patient>>("/api/patients");
        setPatients(response.data.data);
      } catch {
        // erro silencioso
      }
    };
    fetchPatients();
  }, []);

  const patientOptions = patients.map((p) => ({
    value: String(p.id),
    label: p.name?.trim() || `Paciente #${p.id}`,
  }));

  const filterOptions: FilterOption[] = [
    {
      key: "patientId",
      label: "Paciente",
      options: patientOptions,
    },
    {
      key: "status",
      label: "Status do Pagamento",
      options: paymentStatusOptions,
    },
  ];

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deletePagamento(toDelete.id);
      toast.success("Pagamento excluído com sucesso!");
      setToDelete(null);
      refetch();
    } catch {
      // erro já tratado no hook
    }
  };

  const handleFilterChange = (values: FilterValues) => {
    setFilterValues(values);
  };

  const handleApplyFilters = () => {
    const newFilters: PagamentoFilters = {};
    if (filterValues.patientId) {
      newFilters.patientId = filterValues.patientId;
    }
    if (filterValues.status) {
      newFilters.status = filterValues.status;
    }
    applyFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilterValues({
      patientId: "",
      status: "",
    });
    clearFilters();
  };

  const [filterValues, setFilterValues] = useState<FilterValues>({
    patientId: filters.patientId || "",
    status: filters.status || "",
  });

  const columns: Column<Payment>[] = [
    { key: "id", label: "ID", className: "w-16" },
    { key: "patientName", label: "Paciente" },
    { key: "planName", label: "Plano" },
    {
      key: "planAmount",
      label: "Valor",
      render: (p) => formatCurrency(p.planAmount),
    },
    { key: "referenceMonth", label: "Mês Ref." },
    {
      key: "paymentDate",
      label: "Vencimento",
      render: (p) => {
        if (!p.paymentDate) return "-";
        const paymentDate = new Date(p.paymentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (paymentDate < today && p.status === "Pending") {
          return (
            <span className="px-2 py-1 rounded-sm text-xs font-semibold border-2 bg-red-100 text-red-700 border-red-200">
              Vencido
            </span>
          );
        }
        return formatDate(p.paymentDate);
      },
    },
    { key: "paymentMethod", label: "Método" },
    {
      key: "status",
      label: "Status",
      render: (p) => (
        <StatusBadge
          status={p.status}
          mapping={{
            Paid: { label: "Pago", className: "bg-[#1a4a3a] text-white border-[#143d2f]" },
            Pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
            Cancelled: { label: "Cancelado", className: "bg-red-100 text-red-700 border-red-200" },
          }}
        />
      ),
    },
    {
      key: "paidAt",
      label: "Data Pagamento",
      render: (p) => (p.paidAt ? formatDate(p.paidAt) : "-"),
    },
    {
      key: "paymentReminderSent",
      label: "Lembrete",
      render: (p) => (
        <span className="flex justify-center">
          {p.paymentReminderSent ? (
            <Check size={18} className="text-green-600" />
          ) : (
            <Minus size={18} className="text-gray-400" />
          )}
        </span>
      ),
    },
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
        title="Pagamentos"
        actions={
          <div className="flex gap-2">
            <FilterPopover
              filters={filterOptions}
              values={filterValues}
              onChange={handleFilterChange}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
            />
            <Button onClick={onCreate}>Novo Pagamento</Button>
          </div>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nome do paciente..."
      />

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="Nenhum pagamento encontrado."
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
        entityLabel="pagamento"
        name={`${toDelete?.planName} - ${toDelete ? formatCurrency(toDelete.planAmount) : ""}`}
        loading={deleting}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
