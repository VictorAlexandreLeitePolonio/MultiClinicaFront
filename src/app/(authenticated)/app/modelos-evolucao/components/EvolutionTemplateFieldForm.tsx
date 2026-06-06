"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import {
  evolutionDirections,
  evolutionFieldTypes,
  evolutionFieldUnits,
  EvolutionTemplateFieldFormData,
  EvolutionTemplateFieldSchema,
} from "../schemas/evolutionTemplate.schema";
import { EvolutionTemplateField } from "@/types/evolution";
import { isNumericEvolutionField } from "@/services/evolution/evolutionPayload";

interface EvolutionTemplateFieldFormProps {
  field?: EvolutionTemplateField | null;
  loading?: boolean;
  readOnly?: boolean;
  onSubmit: (data: EvolutionTemplateFieldFormData) => Promise<void>;
  onCancel?: () => void;
}

const labels = {
  type: {
    Number: "Número",
    Scale: "Escala",
    Percentage: "Percentual",
    Boolean: "Sim/Não",
    Text: "Texto",
    SelectScore: "Score selecionável",
  },
  unit: {
    None: "Sem unidade",
    Points: "Pontos",
    Percentage: "Percentual",
    Kg: "Kg",
    G: "g",
    Mg: "mg",
    Cm: "cm",
    Mm: "mm",
    M: "m",
    Degrees: "Graus",
    Seconds: "Segundos",
    Minutes: "Minutos",
    Hours: "Horas",
    Days: "Dias",
    Repetitions: "Repetições",
    Liters: "Litros",
    Ml: "ml",
    Score: "Score",
  },
  direction: {
    Neutral: "Neutro",
    Increase: "Melhora aumentando",
    Decrease: "Melhora diminuindo",
  },
};

function formatScoreOptions(optionsJson: string | null | undefined): string {
  if (!optionsJson) return "";

  try {
    const parsed = JSON.parse(optionsJson) as unknown;
    if (!Array.isArray(parsed)) return "";

    return parsed
      .filter((item): item is { label: string; value: number } =>
        typeof item === "object" &&
        item !== null &&
        "label" in item &&
        "value" in item &&
        typeof item.label === "string" &&
        typeof item.value === "number",
      )
      .map((item) => `${item.label} = ${item.value}`)
      .join("\n");
  } catch {
    return "";
  }
}

function parseScoreOptions(optionsText: string | undefined): string | null {
  const lines = (optionsText ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  const options = lines.map((line) => {
    const [label, value] = line.split("=").map((part) => part.trim());
    const parsedValue = Number(value);

    if (!label || !Number.isFinite(parsedValue)) {
      throw new Error("Use uma opção por linha no formato Texto = número.");
    }

    return { label, value: parsedValue };
  });

  return JSON.stringify(options);
}

export function EvolutionTemplateFieldForm({
  field,
  loading,
  readOnly,
  onSubmit,
  onCancel,
}: EvolutionTemplateFieldFormProps) {
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const {
    handleSubmit,
    register,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<
    z.input<typeof EvolutionTemplateFieldSchema>,
    unknown,
    EvolutionTemplateFieldFormData
  >({
    resolver: zodResolver(EvolutionTemplateFieldSchema),
    defaultValues: {
      label: "",
      type: "Text",
      unit: "None",
      minValue: null,
      maxValue: null,
      targetValue: null,
      expectedDirection: "Neutral",
      weight: 1,
      required: false,
      showInChart: false,
      order: 0,
      optionsJson: "",
    },
  });

  useEffect(() => {
    if (field) {
      reset({
        label: field.label,
        type: field.type,
        unit: field.unit,
        minValue: field.minValue,
        maxValue: field.maxValue,
        targetValue: field.targetValue,
        expectedDirection: field.expectedDirection,
        weight: field.weight,
        required: field.required,
        showInChart: field.showInChart,
        order: field.order,
        optionsJson: formatScoreOptions(field.optionsJson),
      });
    }
  }, [field, reset]);

  const type = useWatch({ control, name: "type" });
  const required = useWatch({ control, name: "required" });
  const showInChart = useWatch({ control, name: "showInChart" });
  const isNumeric = isNumericEvolutionField(type);

  const handleValidSubmit = async (data: EvolutionTemplateFieldFormData) => {
    setOptionsError(null);

    if (data.type === "SelectScore") {
      try {
        const optionsJson = parseScoreOptions(data.optionsJson);
        if (!optionsJson) {
          setOptionsError("Informe ao menos uma opção no formato Texto = número.");
          return;
        }
        await onSubmit({ ...data, optionsJson });
        return;
      } catch (error) {
        setOptionsError(error instanceof Error ? error.message : "Opções inválidas.");
        return;
      }
    }

    await onSubmit({ ...data, optionsJson: undefined });
  };

  return (
    <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-4 rounded-2xl border border-[#d7f3ea] bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Nome do campo" id="field-label" placeholder="Ex.: Dor, Mobilidade, Observação" disabled={readOnly} error={errors.label?.message} {...register("label")} />

        <div className="flex flex-col gap-2">
          <label htmlFor="field-type" className="text-sm font-semibold text-[#0f172a] dark:text-white">Tipo</label>
          <select
            id="field-type"
            disabled={readOnly || !!field}
            value={type}
            onChange={(event) => setValue("type", event.target.value as EvolutionTemplateFieldFormData["type"], { shouldValidate: true })}
            className="rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-sm text-[#0f172a] disabled:cursor-not-allowed disabled:bg-[#f0fdf9] disabled:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            {evolutionFieldTypes.map((option) => (
              <option key={option} value={option}>{labels.type[option]}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="field-unit" className="text-sm font-semibold text-[#0f172a] dark:text-white">Unidade</label>
          <p className="text-xs text-[#64748b] dark:text-slate-300">
            Use &quot;Sem unidade&quot; quando o campo não tiver medida, como uma escala subjetiva.
          </p>
          <select
            id="field-unit"
            disabled={readOnly || !isNumeric || !!field}
            {...register("unit")}
            className="rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-sm text-[#0f172a] disabled:cursor-not-allowed disabled:bg-[#f0fdf9] disabled:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            {evolutionFieldUnits.map((option) => (
              <option key={option} value={option}>{labels.unit[option]}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="field-direction" className="text-sm font-semibold text-[#0f172a] dark:text-white">Direção esperada</label>
          <p className="text-xs text-[#64748b] dark:text-slate-300">
            Define se melhorar significa aumentar, diminuir ou apenas acompanhar o valor.
          </p>
          <select
            id="field-direction"
            disabled={readOnly || !isNumeric || !!field}
            {...register("expectedDirection")}
            className="rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-sm text-[#0f172a] disabled:cursor-not-allowed disabled:bg-[#f0fdf9] disabled:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            {evolutionDirections.map((option) => (
              <option key={option} value={option}>{labels.direction[option]}</option>
            ))}
          </select>
        </div>

        {isNumeric && (
          <>
            <FormField label="Valor mínimo permitido" id="field-min" type="number" step="0.01" placeholder="Ex.: 0" disabled={readOnly || !!field} error={errors.minValue?.message} {...register("minValue")} />
            <FormField label="Valor máximo permitido" id="field-max" type="number" step="0.01" placeholder="Ex.: 10" disabled={readOnly || !!field} error={errors.maxValue?.message} {...register("maxValue")} />
            <FormField label="Meta desejada" id="field-target" type="number" step="0.01" placeholder="Ex.: 2 para dor baixa" disabled={readOnly || !!field} error={errors.targetValue?.message} {...register("targetValue")} />
          </>
        )}

        <FormField label="Peso no cálculo de progresso" id="field-weight" type="number" step="0.01" disabled={readOnly} error={errors.weight?.message} {...register("weight")} />
        <FormField label="Ordem de exibição" id="field-order" type="number" disabled={readOnly} error={errors.order?.message} {...register("order")} />
      </div>

      {type === "SelectScore" && (
        <div className="flex flex-col gap-2">
          <label htmlFor="field-options" className="text-sm font-semibold text-[#0f172a] dark:text-white">
            Opções de pontuação
          </label>
          <p className="text-xs text-[#64748b] dark:text-slate-300">
            Escreva uma opção por linha no formato <strong>Texto = número</strong>. Ex.: Ruim = 1.
          </p>
          <textarea
            id="field-options"
            disabled={readOnly || !!field}
            rows={3}
            placeholder={"Ruim = 1\nRegular = 3\nBom = 5"}
            className="rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-sm text-[#0f172a] disabled:cursor-not-allowed disabled:bg-[#f0fdf9] disabled:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            {...register("optionsJson")}
          />
          {optionsError && <span className="text-xs font-medium text-red-600">{optionsError}</span>}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex items-center gap-3 rounded-xl border border-[#d7f3ea] px-4 py-3 text-sm font-semibold text-[#0f172a] dark:border-slate-800 dark:text-white">
          <input
            type="checkbox"
            checked={required}
            disabled={readOnly}
            onChange={(event) => setValue("required", event.target.checked, { shouldValidate: true })}
            className="h-4 w-4 accent-[#14b8a6]"
          />
          Obrigatório quando concluído
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-[#d7f3ea] px-4 py-3 text-sm font-semibold text-[#0f172a] dark:border-slate-800 dark:text-white">
          <input
            type="checkbox"
            checked={showInChart}
            disabled={readOnly || !isNumeric}
            onChange={(event) => setValue("showInChart", event.target.checked, { shouldValidate: true })}
            className="h-4 w-4 accent-[#14b8a6]"
          />
          Exibir em gráfico
        </label>
      </div>

      {!readOnly && (
        <div className="flex flex-col gap-2 sm:flex-row">
          {onCancel && <Button variant="outline" onClick={onCancel}>Cancelar</Button>}
          <Button type="submit" loading={loading}>{field ? "Salvar campo" : "Adicionar campo"}</Button>
        </div>
      )}
    </form>
  );
}
