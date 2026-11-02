"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { DataTable, Column } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { FilterPopover, FilterOption, FilterValues } from "@/components/ui/FilterPopover";
import { Button } from "@/components/ui/Button";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import {
  ViewSwitcher,
  useMediaQuery,
  useViewPreference,
  type ViewOption,
} from "@/components/ui/ViewSwitcher";
import { Eye, KanbanSquare, Table2, Trash2 } from "lucide-react";
import { usePagamentosPaginated, PagamentoFilters } from "../hooks/pagined";
import { usePaymentsSummary } from "../hooks/summary";
import { useDebounce } from "@/app/hooks/useDebounce";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { usePagamentoDelete } from "../hooks/delete";
import { PagamentoOnlineCell } from "./PagamentoOnlineCell";
import { PagamentoBoard } from "./PagamentoBoard";
import { Payment, Patient } from "@/types";
import { formatCivilDate, formatCurrency, todayCivilDate } from "@/utils/formatters";
import { toast } from "sonner";
import { getPatients } from "@/app/(authenticated)/app/pacientes/services/patients.service";

interface Props {
  onCreate: () => void;
  onViewDetails: (id: number) => void;
}

const paymentStatusOptions = [
  { value: "Pending", label: "Pendente" },
  { value: "Paid", label: "Pago" },
  { value: "Cancelled", label: "Cancelado" },
];

type PagamentosView = "table" | "board";

const viewOptions: ViewOption<PagamentosView>[] = [
  { value: "table", label: "Tabela", icon: Table2 },
  { value: "board", label: "Quadro", icon: KanbanSquare, mobile: false },
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
  const [view, setView] = useViewPreference<PagamentosView>(
    "pagamentos",
    "table",
    ["table", "board"],
  );
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const reduceMotion = useReducedMotion();
  const activeView = isDesktop ? view : "table";

  // Mesmos filtros da listagem, sem status/página; o resumo só é buscado no quadro.
  const debouncedSearch = useDebounce(search, 400);
  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = usePaymentsSummary(
    {
      patientName: debouncedSearch || undefined,
      patientId: filters.patientId,
      referenceMonth: filters.referenceMonth,
    },
    activeView === "board",
  );

  const [toDelete, setToDelete] = useState<Payment | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const result = await getPatients();
        setPatients(result.data);
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
    {
      key: "referenceMonth",
      label: "Mês de referência",
      type: "date",
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
    if (filterValues.referenceMonth) {
      newFilters.referenceMonth = filterValues.referenceMonth;
    }
    applyFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilterValues({
      patientId: "",
      status: "",
      referenceMonth: "",
    });
    clearFilters();
  };

  const [filterValues, setFilterValues] = useState<FilterValues>({
    patientId: filters.patientId || "",
    status: filters.status || "",
    referenceMonth: filters.referenceMonth || "",
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
    {
      key: "referenceMonth",
      label: "Mês Ref.",
      render: (p) => formatCivilDate(p.referenceMonth),
    },
    {
      key: "paymentDate",
      label: "Vencimento",
      render: (p) => {
        if (!p.paymentDate) return "-";
        if (p.paymentDate < todayCivilDate() && p.status === "Pending") {
          return (
            <span className="px-2 py-1 rounded-full text-xs font-semibold border bg-red-100 text-red-700 border-red-200">
              Vencido
            </span>
          );
        }
        return formatCivilDate(p.paymentDate);
      },
    },
    { key: "paymentMethod", label: "Método" },
    {
      key: "status",
      label: "Status",
      render: (p) => (
        <span data-tutorial="payments-status">
          <StatusBadge
            status={p.status}
            mapping={{
              Paid: { label: "Pago", className: "bg-primary-dark text-white border-primary-dark" },
              Pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
              Cancelled: { label: "Cancelado", className: "bg-red-100 text-red-700 border-red-200" },
            }}
          />
        </span>
      ),
    },
    {
      key: "paidAt",
      label: "Data Pagamento",
      render: (p) => formatCivilDate(p.paidAt),
    },
    {
      key: "online",
      label: "Cobrança online",
      render: (p) => <PagamentoOnlineCell payment={p} onChanged={() => void refetch()} />,
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
        description="Acompanhe as cobranças e os pagamentos dos pacientes."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ViewSwitcher
              options={viewOptions}
              value={activeView}
              onChange={setView}
            />
            <div data-tutorial="payments-filters">
              <FilterPopover
                filters={filterOptions}
                values={filterValues}
                onChange={handleFilterChange}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
              />
            </div>
            <div data-tutorial="payments-new">
              <Button onClick={onCreate}>Novo Pagamento</Button>
            </div>
          </div>
        }
      />

      <div data-tutorial="payments-search">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nome do paciente..."
        />
      </div>

      <div data-tutorial="payments-list" className="relative">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={activeView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.15,
              ease: [0.23, 1, 0.32, 1],
            }}
          >
            {activeView === "board" ? (
              <PagamentoBoard
                payments={data}
                loading={loading}
                summary={summary}
                summaryLoading={summaryLoading}
                onViewDetails={onViewDetails}
                onChanged={() => {
                  void refetch();
                  void refetchSummary();
                }}
              />
            ) : (
              <DataTable
                columns={columns}
                data={data}
                loading={loading}
                emptyMessage="Nenhum pagamento encontrado."
                keyExtractor={(p) => p.id}
              />
            )}
          </motion.div>
        </AnimatePresence>
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
        entityLabel="pagamento"
        name={`${toDelete?.planName} - ${toDelete ? formatCurrency(toDelete.planAmount) : ""}`}
        loading={deleting}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
