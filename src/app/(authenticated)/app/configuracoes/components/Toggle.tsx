"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

/** Switch acessível para flags booleanas das configurações. */
export function Toggle({ checked, onChange, label, description, disabled, id }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start justify-between gap-4 ${disabled ? "opacity-60" : "cursor-pointer"}`}
    >
      <span>
        <span className="block text-sm font-semibold text-[#0f172a] dark:text-white">{label}</span>
        {description && (
          <span className="mt-0.5 block text-sm text-[#64748b] dark:text-slate-400">{description}</span>
        )}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[#14b8a6]" : "bg-gray-300 dark:bg-slate-700"
        } ${disabled ? "cursor-not-allowed" : ""}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}
