"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { FormSheet } from "@/components/ui/FormSheet";
import { ClinicExpenseSchema, type ClinicExpenseFormData } from "../schemas/clinicExpense.schema";

interface ClinicExpenseSheetProps {
  open: boolean;
  editing: boolean;
  defaultValues: ClinicExpenseFormData;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: ClinicExpenseFormData) => Promise<void> | void;
}

const FORM_ID = "clinic-expense-form";

/** Lançar ou editar despesa num painel lateral: o extrato e a lista continuam visíveis atrás. */
export function ClinicExpenseSheet({ open, editing, defaultValues, loading, onClose, onSubmit }: ClinicExpenseSheetProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ClinicExpenseFormData>({
    resolver: zodResolver(ClinicExpenseSchema),
    values: defaultValues,
  });

  return (
    <FormSheet
      open={open}
      onClose={onClose}
      dirty={isDirty && !loading}
      title={editing ? "Editar despesa" : "Nova despesa"}
      description="Entra nas saídas do Balanço na data informada."
      footer={
        <>
          <Button type="button" variant="outline" fullWidth={false} onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} fullWidth={false} loading={loading}>
            {editing ? "Salvar alterações" : "Lançar despesa"}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField id="clinic-expense-title" label="Título" placeholder="Ex.: Aluguel da sala" required error={errors.title?.message} {...register("title")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="clinic-expense-amount" label="Valor (R$)" type="number" step="0.01" min="0" required error={errors.amount?.message} {...register("amount", { valueAsNumber: true })} />
          <FormField id="clinic-expense-date" label="Data" type="date" required error={errors.date?.message} {...register("date")} />
        </div>
        <FormField id="clinic-expense-description" label="Descrição" placeholder="Opcional" error={errors.description?.message} {...register("description")} />
      </form>
    </FormSheet>
  );
}
