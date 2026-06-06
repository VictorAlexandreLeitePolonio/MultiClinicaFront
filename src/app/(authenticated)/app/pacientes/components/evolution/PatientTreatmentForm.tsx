"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { EvolutionTemplate } from "@/types/evolution";
import {
  PatientTreatmentFormData,
  PatientTreatmentSchema,
} from "./patientEvolution.schema";

interface PatientTreatmentFormProps {
  templates: EvolutionTemplate[];
  loading?: boolean;
  onSubmit: (data: PatientTreatmentFormData) => Promise<void>;
  onCancel: () => void;
}

export function PatientTreatmentForm({ templates, loading, onSubmit, onCancel }: PatientTreatmentFormProps) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<
    z.input<typeof PatientTreatmentSchema>,
    unknown,
    PatientTreatmentFormData
  >({
    resolver: zodResolver(PatientTreatmentSchema),
    defaultValues: {
      templateId: templates[0]?.id ?? 0,
      title: "",
      description: "",
      startedAt: new Date().toISOString().slice(0, 10),
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-2xl border border-[#d7f3ea] bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="treatment-template" className="text-sm font-semibold text-[#0f172a] dark:text-white">
            Modelo
          </label>
          <select
            id="treatment-template"
            className="rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-sm text-[#0f172a] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            {...register("templateId")}
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
          {errors.templateId?.message && <span className="text-xs font-medium text-red-600">{errors.templateId.message}</span>}
        </div>

        <FormField label="Início" id="treatment-started-at" type="date" error={errors.startedAt?.message} {...register("startedAt")} />
      </div>

      <FormField label="Título" id="treatment-title" error={errors.title?.message} {...register("title")} />

      <div className="flex flex-col gap-2">
        <label htmlFor="treatment-description" className="text-sm font-semibold text-[#0f172a] dark:text-white">Descrição</label>
        <textarea
          id="treatment-description"
          rows={3}
          className="rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-sm text-[#0f172a] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          {...register("description")}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Criar acompanhamento</Button>
      </div>
    </form>
  );
}
