"use client";

import { EVOLUTION_UNIT_LABELS } from "@/utils/formatters";
import {
  EvolutionFormValue,
  isNumericEvolutionField,
} from "@/app/(authenticated)/app/modelos-evolucao/services/evolutionPayload";
import { EvolutionTemplateField } from "@/types/evolution";

interface EvolutionFieldInputProps {
  field: EvolutionTemplateField;
  value: EvolutionFormValue;
  onChange: (value: EvolutionFormValue) => void;
  /** Última leitura concluída do paciente, exibida ao lado do campo. */
  previousValue?: number | null;
  disabled?: boolean;
  showRequired?: boolean;
  idPrefix?: string;
}

const inputStyles =
  "w-full rounded-xl border border-[#d7f3ea] bg-white px-3 py-2 text-sm text-[#0f172a] transition-colors focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-[#67e8f9] dark:focus:ring-[#134e4a]";

export function parseEvolutionSelectOptions(
  optionsJson: string | null,
): { label: string; value: number }[] {
  if (!optionsJson) return [];

  try {
    const parsed = JSON.parse(optionsJson) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is { label: string; value: number } =>
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

export function EvolutionFieldInput({
  field,
  value,
  onChange,
  previousValue,
  disabled,
  showRequired = true,
  idPrefix = "evolution-field",
}: EvolutionFieldInputProps) {
  const id = `${idPrefix}-${field.id}`;
  const stringValue = value === null || value === undefined ? "" : String(value);
  const showPrevious = previousValue !== null && previousValue !== undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-[#0f172a] dark:text-white">
          {field.label}
          {showRequired && field.required && <span className="ml-1 text-red-600">*</span>}
        </label>
        {showPrevious && (
          <span className="shrink-0 text-xs font-medium text-[#475569] dark:text-slate-300">
            antes: {String(previousValue)}
          </span>
        )}
      </div>

      {field.type === "Boolean" ? (
        <div className="flex min-h-10 items-center gap-3 rounded-xl border border-[#d7f3ea] bg-white px-3 py-2 text-sm text-[#0f172a] dark:border-slate-700 dark:bg-slate-900 dark:text-white">
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            disabled={disabled}
            onChange={(event) => onChange(event.target.checked)}
            className="h-4 w-4 accent-[#14b8a6]"
          />
          <label htmlFor={id} className="cursor-pointer select-none">
            Sim
          </label>
        </div>
      ) : field.type === "Text" ? (
        <textarea
          id={id}
          rows={3}
          value={stringValue}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={inputStyles}
        />
      ) : field.type === "SelectScore" ? (
        <select
          id={id}
          value={stringValue}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={inputStyles}
        >
          <option value="">Selecione</option>
          {parseEvolutionSelectOptions(field.optionsJson).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type="number"
          step="0.01"
          min={field.minValue ?? undefined}
          max={field.maxValue ?? undefined}
          value={stringValue}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={inputStyles}
        />
      )}

      {isNumericEvolutionField(field.type) && (
        <span className="text-xs text-[#475569] dark:text-slate-300">
          {[
            EVOLUTION_UNIT_LABELS[field.unit] || null,
            field.targetValue !== null ? `Meta: ${field.targetValue}` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </span>
      )}
    </div>
  );
}
