"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormSection } from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ExpenseSchema, ExpenseFormData } from "../schemas/expense.schema";
import { useExpenseInsert } from "../hooks/insert";
import { toast } from "sonner";

interface Props {
  onBack: () => void;
  onSave: () => void;
}

export default function ExpenseRegister({ onBack, onSave }: Props) {
  const { insertExpense, isPending } = useExpenseInsert();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: {
      title: "",
      value: 0,
      paymentDate: "",
      description: "",
      referenceMonth: "",
    },
  });

  const title = watch("title");
  const value = watch("value");
  const paymentDate = watch("paymentDate");
  const description = watch("description");
  const referenceMonth = watch("referenceMonth");

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      await insertExpense(data);
      toast.success("Gasto cadastrado com sucesso!");
      onSave();
    } catch {
      // erro já tratado no hook
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Novo Gasto" onBack={onBack} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Dados do Gasto">
          <FormField
            label="Título do Gasto *"
            id="title"
            placeholder="Ex: Aluguel, Energia, Material de escritório..."
            error={errors.title?.message}
            value={title || ""}
            onChange={(e) => setValue("title", e.target.value, { shouldValidate: true })}
          />

          <FormField
            label="Valor (R$) *"
            id="value"
            type="number"
            step="0.01"
            placeholder="0,00"
            error={errors.value?.message}
            value={String(value) || ""}
            onChange={(e) =>
              setValue("value", Number(e.target.value), {
                shouldValidate: true,
              })
            }
          />

          <FormField
            label="Data de Pagamento *"
            id="paymentDate"
            type="date"
            error={errors.paymentDate?.message}
            value={paymentDate || ""}
            onChange={(e) => setValue("paymentDate", e.target.value, { shouldValidate: true })}
          />

          {/* Textarea para descrição */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-[#1a2a4a] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Descrição *
            </label>
            <textarea
              value={description || ""}
              onChange={(e) => setValue("description", e.target.value, { shouldValidate: true })}
              rows={4}
              className="w-full px-4 py-3 bg-white border-2 border-[#e2ebe6] rounded-sm text-[#1a2a4a]
                focus:border-[#1a4a3a] focus:shadow-[3px_3px_0_0_#1a4a3a] focus:outline-none transition-all resize-none"
              style={{ fontFamily: "var(--font-serif)" }}
              placeholder="Descreva o gasto em detalhes..."
            />
            {errors.description && (
              <span className="text-xs text-red-600">{errors.description.message}</span>
            )}
          </div>

          <FormField
            label="Mês de Referência *"
            id="referenceMonth"
            type="month"
            error={errors.referenceMonth?.message}
            value={referenceMonth || ""}
            onChange={(e) => setValue("referenceMonth", e.target.value, { shouldValidate: true })}
          />
        </FormSection>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Voltar
          </Button>
          <Button type="submit" loading={isPending}>
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
}
