"use client";

import { forwardRef } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const baseStyles =
  "w-full appearance-none rounded-xl border bg-white bg-[length:1.1rem] bg-[right_0.85rem_center] bg-no-repeat px-4 py-2.5 pr-10 text-sm text-[#0f172a] transition-all focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-900 dark:text-white dark:focus:border-[#67e8f9] dark:focus:ring-[#134e4a]";

// Chevron embutido via data-URI (herda cor por currentColor não funciona em bg, então 2 variantes por tema).
const chevronLight =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className, children, ...rest }, ref) => {
    const select = (
      <select
        ref={ref}
        id={id}
        style={{ backgroundImage: chevronLight }}
        className={`${baseStyles} ${error ? "border-red-500" : "border-[#d7f3ea] dark:border-slate-800"} ${className ?? ""}`}
        {...rest}
      >
        {children}
      </select>
    );

    if (!label) return select;

    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-[#0f172a] dark:text-white">
          {label}
        </label>
        {select}
        {error && <span className="text-xs font-medium text-red-600">{error}</span>}
      </div>
    );
  },
);

Select.displayName = "Select";
