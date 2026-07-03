"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { PatientEvolution, PatientEvolutionPayload, EvolutionTemplateField } from "@/types/evolution";
import {
  buildEvolutionValuesPayload,
  getInitialEvolutionFormValues,
  isNumericEvolutionField,
  EvolutionFormValues,
} from "@/services/evolution/evolutionPayload";
import { PatientEvolutionFormData, PatientEvolutionSchema } from "./patientEvolution.schema";

interface PatientEvolutionFormProps {
  fields: EvolutionTemplateField[];
  evolution?: PatientEvolution | null;
  loading?: boolean;
  onSubmit: (payload: PatientEvolutionPayload) => Promise<void>;
  onCancel: () => void;
}

function toDateInputValue(date?: string | null): string {
  if (!date) return new Date().toISOString().slice(0, 10);
  return new Date(date).toISOString().slice(0, 10);
}

function getSelectOptions(optionsJson: string | null): { label: string; value: number }[] {
  if (!optionsJson) return [];
  try {
    const parsed = JSON.parse(optionsJson) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is { label: string; value: number } =>
        typeof item === "object" &&
        item !== null &&
        "label" in item &&
        "value" in item &&
        typeof item.label === "string" &&
        typeof item.value === "number",
      );
  } catch {
    return [];
  }
}

export function PatientEvolutionForm({
  fields,
  evolution,
  loading,
  onSubmit,
  onCancel,
}: PatientEvolutionFormProps) {
  const activeFields = useMemo(() => fields.filter((field) => field.isActive), [fields]);
  const [fieldValues, setFieldValues] = useState<EvolutionFormValues>(() =>
    getInitialEvolutionFormValues(activeFields, evolution?.values),
  );
  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors },
  } = useForm<PatientEvolutionFormData>({
    resolver: zodResolver(PatientEvolutionSchema),
    defaultValues: {
      date: toDateInputValue(evolution?.date),
      description: evolution?.description ?? "",
      conduct: evolution?.conduct ?? "",
      observations: evolution?.observations ?? "",
      nextGuidance: evolution?.nextGuidance ?? "",
      status: evolution?.status === "Canceled" ? "Draft" : evolution?.status ?? "Completed",
    },
  });

  useEffect(() => {
    reset({
      date: toDateInputValue(evolution?.date),
      description: evolution?.description ?? "",
      conduct: evolution?.conduct ?? "",
      observations: evolution?.observations ?? "",
      nextGuidance: evolution?.nextGuidance ?? "",
      status: evolution?.status === "Canceled" ? "Draft" : evolution?.status ?? "Completed",
    });
  }, [activeFields, evolution, reset]);

  const status = useWatch({ control, name: "status" });

  const handleValueChange = (fieldId: number, value: string | number | boolean) => {
    setFieldValues((current) => ({ ...current, [fieldId]: value }));
  };

  const submit = async (data: PatientEvolutionFormData) => {
    const payloadValues = buildEvolutionValuesPayload(activeFields, fieldValues);
    if (data.status === "Completed") {
      const presentFields = new Set(payloadValues.map((value) => value.fieldId));
      const missingRequired = activeFields.find((field) => field.required && !presentFields.has(field.id));
      if (missingRequired) {
        toast.error(`Campo obrigatório ausente: ${missingRequired.label}.`);
        return;
      }
    }

    await onSubmit({
      date: data.date ? new Date(data.date).toISOString() : null,
      description: data.description || null,
      conduct: data.conduct || null,
      observations: data.observations || null,
      nextGuidance: data.nextGuidance || null,
      status: data.status,
      values: payloadValues,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="evolution-date" className="text-sm font-semibold text-secondary dark:text-white">Data</label>
          <input
            id="evolution-date"
            type="date"
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-secondary dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            {...register("date")}
          />
          {errors.date?.message && <span className="text-xs font-medium text-red-600">{errors.date.message}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="evolution-status" className="text-sm font-semibold text-secondary dark:text-white">Status</label>
          <select
            id="evolution-status"
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-secondary dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            {...register("status")}
          >
            <option value="Completed">Concluída</option>
            <option value="Draft">Rascunho</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {activeFields.map((field) => (
          <div key={field.id} className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-secondary dark:text-white">
              {field.label}
              {status === "Completed" && field.required && <span className="ml-1 text-red-600">*</span>}
            </label>
            {field.type === "Boolean" ? (
              <label className="flex h-12 items-center gap-3 rounded-xl border border-gray-200 px-4 text-sm text-secondary dark:border-slate-800 dark:text-white">
                <input
                  type="checkbox"
                  checked={Boolean(fieldValues[field.id])}
                  onChange={(event) => handleValueChange(field.id, event.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                Sim
              </label>
            ) : field.type === "Text" ? (
              <textarea
                rows={3}
                value={String(fieldValues[field.id] ?? "")}
                onChange={(event) => handleValueChange(field.id, event.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-secondary dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            ) : field.type === "SelectScore" ? (
              <select
                value={String(fieldValues[field.id] ?? "")}
                onChange={(event) => handleValueChange(field.id, event.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-secondary dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                <option value="">Selecione</option>
                {getSelectOptions(field.optionsJson).map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                step="0.01"
                min={field.minValue ?? undefined}
                max={field.maxValue ?? undefined}
                value={String(fieldValues[field.id] ?? "")}
                onChange={(event) => handleValueChange(field.id, event.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-secondary dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            )}
            {isNumericEvolutionField(field.type) && (
              <span className="text-xs text-gray-600 dark:text-slate-300">
                {[field.unit !== "None" ? field.unit : null, field.targetValue !== null ? `Meta: ${field.targetValue}` : null].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {([
          ["description", "Descrição"],
          ["conduct", "Conduta"],
          ["observations", "Observações"],
          ["nextGuidance", "Próxima orientação"],
        ] as const).map(([name, label]) => (
          <div key={name} className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-secondary dark:text-white">{label}</label>
            <textarea
              rows={3}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-secondary dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              {...register(name)}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>{evolution ? "Salvar evolução" : "Registrar evolução"}</Button>
      </div>
    </form>
  );
}
