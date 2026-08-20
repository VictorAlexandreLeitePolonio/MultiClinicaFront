"use client";

import { FieldErrors, UseFormRegister } from "react-hook-form";
import { FormField } from "@/components/ui/FormField";
import { ClinicSettingsFormValues } from "../schemas/clinic-settings.schema";

interface Props {
  register: UseFormRegister<ClinicSettingsFormValues>;
  errors: FieldErrors<ClinicSettingsFormValues>;
  disabled?: boolean;
}

export function ClinicAddressSection({ register, errors, disabled }: Props) {
  return (
    <section className="space-y-5 rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Endereço</h2>
        <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
          Usado na página pública. O mapa será adicionado numa fase futura.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="clinic-rua" label="Rua" disabled={disabled} error={errors.rua?.message} {...register("rua")} />
        <FormField id="clinic-numero" label="Número" disabled={disabled} error={errors.numero?.message} {...register("numero")} />
        <FormField id="clinic-bairro" label="Bairro" disabled={disabled} error={errors.bairro?.message} {...register("bairro")} />
        <FormField id="clinic-cidade" label="Cidade" disabled={disabled} error={errors.cidade?.message} {...register("cidade")} />
        <FormField id="clinic-estado" label="Estado" disabled={disabled} error={errors.estado?.message} {...register("estado")} />
        <FormField id="clinic-cep" label="CEP" disabled={disabled} error={errors.cep?.message} {...register("cep")} />
        <FormField id="clinic-latitude" label="Latitude" disabled={disabled} error={errors.latitude?.message} {...register("latitude")} />
        <FormField id="clinic-longitude" label="Longitude" disabled={disabled} error={errors.longitude?.message} {...register("longitude")} />
      </div>
    </section>
  );
}
