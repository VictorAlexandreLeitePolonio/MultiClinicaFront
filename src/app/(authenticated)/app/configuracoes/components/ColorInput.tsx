"use client";

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

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-[#0f172a] dark:text-white">
        {label}
      </label>
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
