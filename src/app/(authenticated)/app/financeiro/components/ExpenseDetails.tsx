"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormSection } from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ExpenseSchema, ExpenseFormData } from "../schemas/expense.schema";
import { useExpenseById } from "../hooks/getId";
import { useExpenseUpdate } from "../hooks/update";
import { Eye, Edit3, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  id: number;
  onBack: () => void;
  onSave: () => void;
}

export default function ExpenseDetails({ id, onBack, onSave }: Props) {
  const { data, loading, error } = useExpenseById(id);
  const { updateExpense, isPending } = useExpenseUpdate();
  const [isEditing, setIsEditing] = useState(false);

  const {
    handleSubmit,
    reset,
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

  useEffect(() => {
    if (data) {
      reset({
        title: data.title,
        value: data.value,
        paymentDate: data.paymentDate.split("T")[0], // Extrair apenas a data
        description: data.description,
        referenceMonth: data.referenceMonth,
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData: ExpenseFormData) => {
    try {
      await updateExpense(id, formData);
      toast.success("Gasto atualizado com sucesso!");
      setIsEditing(false);
      onSave();
    } catch {
      // erro já tratado no hook
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (data) {
      reset({
        title: data.title,
        value: data.value,
        paymentDate: data.paymentDate.split("T")[0],
        description: data.description,
        referenceMonth: data.referenceMonth,
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <PageHeader title="Detalhes do Gasto" onBack={onBack} />
        <p className="text-[#4a6354]" style={{ fontFamily: "var(--font-serif)" }}>
          Carregando...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-2xl">
        <PageHeader title="Detalhes do Gasto" onBack={onBack} />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Detalhes do Gasto"
        onBack={onBack}
        actions={
          !isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 size={16} className="mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelEdit}>
                <X size={16} className="mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSubmit(onSubmit)} loading={isPending}>
                <Save size={16} className="mr-2" />
                Salvar Alterações
              </Button>
            </div>
          )
        }
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 px-4 py-3 rounded-sm border-2 ${
          isEditing
            ? "bg-[#1a4a3a]/10 border-[#1a4a3a]"
            : "bg-[#f0f4f2] border-[#e2ebe6]"
        }`}
      >
        {isEditing ? (
          <>
            <Edit3 size={18} className="text-[#1a4a3a]" />
            <span className="text-sm font-semibold text-[#1a4a3a]" style={{ fontFamily: "var(--font-serif)" }}>
              Modo Edição — Você pode alterar os dados abaixo
            </span>
          </>
        ) : (
          <>
            <Eye size={18} className="text-[#4a6354]" />
            <span className="text-sm font-semibold text-[#4a6354]" style={{ fontFamily: "var(--font-serif)" }}>
              Modo Visualização — Clique em &quot;Editar&quot; para modificar
            </span>
          </>
        )}
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Dados do Gasto">
          <FormField
            label="Título do Gasto *"
            id="title"
            error={errors.title?.message}
            disabled={!isEditing}
            value={title || ""}
            onChange={(e) => setValue("title", e.target.value, { shouldValidate: true })}
          />

          <FormField
            label="Valor (R$) *"
            id="value"
            type="number"
            step="0.01"
            error={errors.value?.message}
            disabled={!isEditing}
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
            disabled={!isEditing}
            value={paymentDate || ""}
            onChange={(e) => setValue("paymentDate", e.target.value, { shouldValidate: true })}
          />

          {/* Textarea para descrição */}
          <div className="flex flex-col gap-2">
            <label
              className={`text-sm font-semibold uppercase tracking-wider ${
                !isEditing ? "text-gray-400" : "text-[#1a2a4a]"
              }`}
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Descrição *
            </label>
            <textarea
              disabled={!isEditing}
              value={description || ""}
              onChange={(e) => setValue("description", e.target.value, { shouldValidate: true })}
              rows={4}
              className={`w-full px-4 py-3 border-2 rounded-sm transition-all resize-none
                ${!isEditing
                  ? "bg-[#f0f4f2] border-[#e2ebe6] text-gray-400 cursor-not-allowed"
                  : "bg-white border-[#e2ebe6] text-[#1a2a4a] focus:border-[#1a4a3a] focus:shadow-[3px_3px_0_0_#1a4a3a] focus:outline-none"
                }`}
              style={{ fontFamily: "var(--font-serif)" }}
            />
            {errors.description && isEditing && (
              <span className="text-xs text-red-600">{errors.description.message}</span>
            )}
          </div>

          <FormField
            label="Mês de Referência *"
            id="referenceMonth"
            type="month"
            error={errors.referenceMonth?.message}
            disabled={!isEditing}
            value={referenceMonth || ""}
            onChange={(e) => setValue("referenceMonth", e.target.value, { shouldValidate: true })}
          />
        </FormSection>

        <div className="flex gap-2 md:hidden">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 size={16} className="mr-2" />
              Editar
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X size={16} className="mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSubmit(onSubmit)} loading={isPending}>
                <Save size={16} className="mr-2" />
                Salvar
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
