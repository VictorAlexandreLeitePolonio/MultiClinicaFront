"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { DataTable, Column } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { FilterPopover } from "@/components/ui/FilterPopover";
import { Button } from "@/components/ui/Button";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { Eye, Trash2 } from "lucide-react";
import { useExpensesPaginated } from "../hooks/pagined";
import { Pagination } from "@/components/ui/Pagination";
import { useExpenseDelete } from "../hooks/delete";
import { useMonthlyBalance } from "../hooks/balance";
import { useBalanceHistory, HistoryPeriod } from "../hooks/balanceHistory";
import { Expense } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { BalanceSummaryCards } from "./BalanceSummaryCards";
import { BalanceChart } from "./BalanceChart";
import { toast } from "sonner";

interface Props {
  onCreate: () => void;
  onViewDetails: (id: number) => void;
}

export default function ExpenseList({ onCreate, onViewDetails }: Props) {
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
    month,
    setMonth,
    refetch,
  } = useExpensesPaginated();
  
  const { deleteExpense, isPending: deleting } = useExpenseDelete();
  const { data: balance, loading: balanceLoading } = useMonthlyBalance(month);
  
  const [period, setPeriod] = useState<HistoryPeriod>(6);
  const { data: history, loading: historyLoading } = useBalanceHistory(period);

  const [toDelete, setToDelete] = useState<Expense | null>(null);

  // Gerar opções dos últimos 12 meses para o FilterPopover
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
      return { value, label };
    });
  }, []);

  const handleConfirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteExpense(toDelete.id);
      toast.success("Gasto excluído com sucesso!");
      setToDelete(null);
      refetch();
    } catch {
      // erro já tratado no hook
    }
  };

  const columns: Column<Expense>[] = [
    { key: "title", label: "Título" },
    { key: "description", label: "Descrição" },
    {
      key: "value",
      label: "Valor",
      render: (e) => formatCurrency(e.value),
    },
    {
      key: "paymentDate",
      label: "Data Pagamento",
      render: (e) => formatDate(e.paymentDate),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (e) => (
        <ActionsDropdown
          actions={[
            {
              label: "Detalhes",
              onClick: () => onViewDetails(e.id),
              icon: <Eye size={14} />,
            },
            {
              label: "Excluir",
              onClick: () => setToDelete(e),
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
        title="Financeiro"
        actions={
          <div className="flex gap-2">
            <FilterPopover
              filters={[
                {
                  key: "month",
                  label: "Mês de Referência",
                  options: monthOptions,
                },
              ]}
              values={{ month }}
              onChange={(values) => setMonth(values.month || month)}
              onApply={() => {}}
              onClear={() => {
                const now = new Date();
                setMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
              }}
            />
            <Button onClick={onCreate}>Novo Gasto</Button>
          </div>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por título do gasto..."
      />

      {/* Cards de balanço */}
      <BalanceSummaryCards balance={balance} loading={balanceLoading} />

      {/* Gráfico */}
      <BalanceChart 
        data={history} 
        loading={historyLoading} 
        period={period}
        onPeriodChange={setPeriod}
      />

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="Nenhum gasto encontrado."
        keyExtractor={(e) => e.id}
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
        entityLabel="gasto"
        name={toDelete ? `${toDelete.title} - ${formatCurrency(toDelete.value)}` : ""}
        loading={deleting}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
