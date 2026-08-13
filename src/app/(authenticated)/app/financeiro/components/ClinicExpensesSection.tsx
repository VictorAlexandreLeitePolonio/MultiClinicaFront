"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { ClinicExpense } from "@/types";
import type { GetFinancialBalanceParams } from "../services/financial.service";
import { useClinicExpenseMutations, useClinicExpenses } from "../hooks/useClinicExpenses";
import type { ClinicExpenseFormData } from "../schemas/clinicExpense.schema";
import { ClinicExpenseDialog } from "./ClinicExpenseDialog";

interface ClinicExpensesSectionProps {
  period: GetFinancialBalanceParams;
}

const columns: Column<ClinicExpense>[] = [
  { key: "title", label: "Título" },
  { key: "amount", label: "Valor", render: (expense) => formatCurrency(expense.amount) },
  { key: "date", label: "Data", render: (expense) => formatDate(expense.date) },
  { key: "description", label: "Descrição", render: (expense) => expense.description ?? "—" },
];

function toRequest(data: ClinicExpenseFormData) {
  return {
    ...data,
    date: `${data.date}T00:00:00.000Z`,
    description: data.description?.trim() || undefined,
  };
}

export function ClinicExpensesSection({ period }: ClinicExpensesSectionProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<ClinicExpense | null>(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<ClinicExpense | null>(null);
  const query = useClinicExpenses({ ...period, page, pageSize });
  const mutations = useClinicExpenseMutations();
  const defaultValues: ClinicExpenseFormData = {
    title: editing?.title ?? "",
    amount: editing?.amount ?? 0,
    date: editing?.date.split("T")[0] ?? new Date().toISOString().slice(0, 10),
    description: editing?.description ?? "",
  };

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
  };

  const submit = async (data: ClinicExpenseFormData) => {
    try {
      if (editing) {
        await mutations.updateExpense(editing.id, toRequest(data));
        toast.success("Despesa atualizada!");
      } else {
        await mutations.createExpense(toRequest(data));
        toast.success("Despesa cadastrada!");
      }
      closeDialog();
    } catch {
      // useApiMutation exibe o erro.
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await mutations.deleteExpense(deleting.id);
      toast.success("Despesa excluída!");
      setDeleting(null);
    } catch {
      // useApiMutation exibe o erro.
    }
  };

  const expenseColumns: Column<ClinicExpense>[] = [
    ...columns,
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (expense) => (
        <ActionsDropdown
          actions={[
            { label: "Editar", icon: <Pencil size={14} />, onClick: () => { setEditing(expense); setOpen(true); } },
            { label: "Excluir", icon: <Trash2 size={14} />, variant: "danger", onClick: () => setDeleting(expense) },
          ]}
        />
      ),
    },
  ];

  return (
    <section className="space-y-4">
      <PageHeader title="Despesas manuais" actions={<Button onClick={() => { setEditing(null); setOpen(true); }}>Nova despesa</Button>} />
      <DataTable
        columns={expenseColumns}
        data={query.data?.data ?? []}
        loading={query.isLoading}
        error={query.isError ? getApiErrorMessage(query.error, "Erro ao carregar despesas.") : null}
        onRetry={() => void query.refetch()}
        emptyMessage="Nenhuma despesa encontrada."
        keyExtractor={(expense) => expense.id}
      />
      <Pagination
        page={page}
        totalPages={query.data?.totalPages ?? 0}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
      />
      <ClinicExpenseDialog
        open={open}
        defaultValues={defaultValues}
        loading={mutations.isCreating || mutations.isUpdating}
        onClose={closeDialog}
        onSubmit={submit}
      />
      <DeleteConfirmDialog
        open={!!deleting}
        entityLabel="despesa"
        name={deleting?.title ?? ""}
        loading={mutations.isDeleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
