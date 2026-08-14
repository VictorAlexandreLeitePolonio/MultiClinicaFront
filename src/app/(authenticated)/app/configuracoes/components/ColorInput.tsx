"use client";

import { Check } from "lucide-react";
import { DEFAULT_TENANT_THEME, isValidHexColor } from "@/utils/tenant";

interface ColorInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  disabled?: boolean;
}

// Paleta de presets para o usuário não precisar caçar cores no picker.
const PRESETS = [
  "#14B8A6", "#2563EB", "#0EA5E9", "#6366F1",
  "#8B5CF6", "#EC4899", "#F43F5E", "#F97316",
  "#EAB308", "#22C55E", "#0F172A", "#64748B",
];

export function ColorInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
}: ColorInputProps) {
  const colorValue = isValidHexColor(value) ? value : DEFAULT_TENANT_THEME.primaryColor;
  const normalized = value.trim().toUpperCase();

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={id} className="text-sm font-semibold text-[#0f172a] dark:text-white">
        {label}
      </label>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const active = normalized === preset;
          return (
            <button
              key={preset}
              type="button"
              disabled={disabled}
              aria-label={`Usar cor ${preset}`}
              aria-pressed={active}
              onClick={() => {
                onChange(preset);
                onBlur();
              }}
              style={{ backgroundColor: preset }}
              className={`flex h-8 w-8 items-center justify-center rounded-lg shadow-sm ring-offset-2 transition-transform hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-slate-900 ${
                active ? "ring-2 ring-[#0f172a] dark:ring-white" : "ring-1 ring-black/10"
              }`}
            >
              {active && <Check size={15} className="text-white drop-shadow" strokeWidth={3} />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <input
          aria-label={`${label} seletor`}
          type="color"
          value={colorValue}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-14 cursor-pointer rounded-xl border border-[#d7f3ea] bg-white p-1 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-900"
        />
        <input
          id={id}
          name={id}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          placeholder="#2563EB"
          className={`min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm uppercase transition-all focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:bg-slate-900 dark:text-white ${
            error ? "border-red-500" : "border-[#d7f3ea] dark:border-slate-800"
          }`}
        />
      </div>
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </div>
  );
}
