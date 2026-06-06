"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormSection";
import {
  EvolutionTemplateFormData,
  EvolutionTemplateSchema,
} from "../schemas/evolutionTemplate.schema";
import { EvolutionTemplate } from "@/types/evolution";

interface EvolutionTemplateFormProps {
  template?: EvolutionTemplate | null;
  loading?: boolean;
  readOnly?: boolean;
  onSubmit: (data: EvolutionTemplateFormData) => Promise<void>;
}

export function EvolutionTemplateForm({
  template,
  loading,
  readOnly,
  onSubmit,
}: EvolutionTemplateFormProps) {
  const {
    handleSubmit,
    register,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<
    z.input<typeof EvolutionTemplateSchema>,
    unknown,
    EvolutionTemplateFormData
  >({
    resolver: zodResolver(EvolutionTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      isDefault: false,
    },
  });

  useEffect(() => {
    if (template) {
      reset({
        name: template.name,
        description: template.description ?? "",
        category: template.category ?? "",
        isDefault: template.isDefault,
      });
    }
  }, [reset, template]);

  const isDefault = useWatch({ control, name: "isDefault" });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormSection title="Dados do modelo" columns={1}>
        <FormField
          label="Nome"
          id="template-name"
          disabled={readOnly}
          error={errors.name?.message}
          {...register("name")}
        />

        <div className="flex flex-col gap-2">
          <label htmlFor="template-description" className="text-sm font-semibold text-[#0f172a] dark:text-white">
            Descrição
          </label>
          <textarea
            id="template-description"
            disabled={readOnly}
            rows={3}
            className="w-full rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-sm text-[#0f172a] focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 disabled:cursor-not-allowed disabled:bg-[#f0fdf9] disabled:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            {...register("description")}
          />
        </div>

        <FormField
          label="Categoria"
          id="template-category"
          disabled={readOnly}
          error={errors.category?.message}
          {...register("category")}
        />

        <label className="flex items-center gap-3 rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-sm font-semibold text-[#0f172a] dark:border-slate-800 dark:bg-slate-900 dark:text-white">
          <input
            type="checkbox"
            checked={isDefault}
            disabled={readOnly}
            onChange={(event) => setValue("isDefault", event.target.checked, { shouldValidate: true })}
            className="h-4 w-4 accent-[#14b8a6]"
          />
          Modelo padrão
        </label>
      </FormSection>

      {!readOnly && (
        <Button type="submit" loading={loading}>
          {template ? "Salvar modelo" : "Criar modelo"}
        </Button>
      )}
    </form>
  );
}
