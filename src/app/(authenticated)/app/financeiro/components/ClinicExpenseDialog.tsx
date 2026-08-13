"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { ClinicExpenseSchema, type ClinicExpenseFormData } from "../schemas/clinicExpense.schema";

interface ClinicExpenseDialogProps {
  open: boolean;
  defaultValues: ClinicExpenseFormData;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: ClinicExpenseFormData) => Promise<void> | void;
}

export function ClinicExpenseDialog({ open, defaultValues, loading, onClose, onSubmit }: ClinicExpenseDialogProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ClinicExpenseFormData>({
    resolver: zodResolver(ClinicExpenseSchema),
    values: defaultValues,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-xl rounded-2xl border border-[#d7f3ea] bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Despesa manual</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormField id="clinic-expense-title" label="Título" required error={errors.title?.message} {...register("title")} />
          <FormField id="clinic-expense-amount" label="Valor" type="number" step="0.01" required error={errors.amount?.message} {...register("amount", { valueAsNumber: true })} />
          <FormField id="clinic-expense-date" label="Data" type="date" required error={errors.date?.message} {...register("date")} />
          <FormField id="clinic-expense-description" label="Descrição" error={errors.description?.message} {...register("description")} />
        </div>
        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" loading={loading}>Salvar</Button>
        </div>
      </form>
    </div>
  );
}
