"use client";

import { FieldErrors, UseFormRegister } from "react-hook-form";
import { FormField } from "@/components/ui/FormField";
import { ClinicSettingsFormValues } from "../schemas/clinic-settings.schema";

interface Props {
  register: UseFormRegister<ClinicSettingsFormValues>;
  errors: FieldErrors<ClinicSettingsFormValues>;
  disabled?: boolean;
}

export function ClinicPublicProfileSection({ register, errors, disabled }: Props) {
  return (
    <section className="space-y-5 rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Perfil público</h2>
        <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
          Como sua clínica aparece na página pública e no marketplace.
        </p>
      </div>

      <FormField
        id="clinic-public-slug"
        label="Slug (endereço público)"
        placeholder="minha-clinica"
        disabled={disabled}
        error={errors.publicSlug?.message}
        {...register("publicSlug")}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="clinic-description" className="text-sm font-semibold text-[#0f172a] dark:text-white">
          Descrição
        </label>
        <textarea
          id="clinic-description"
          rows={4}
          disabled={disabled}
          className="w-full rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-[#0f172a] transition-all focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 disabled:cursor-not-allowed disabled:bg-[#f0fdf9] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          {...register("description")}
        />
        {errors.description && <span className="text-sm text-red-600">{errors.description.message}</span>}
      </div>
    </section>
  );
}
