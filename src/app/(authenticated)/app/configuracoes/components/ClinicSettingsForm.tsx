"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { ClinicSettings, UpdateClinicSettingsRequest } from "@/types";
import { ClinicThemePreview } from "./ClinicThemePreview";
import { ColorInput } from "./ColorInput";
import { LogoPreview } from "./LogoPreview";
import {
  clinicSettingsSchema,
  ClinicSettingsFormValues,
  toClinicSettingsFormValues,
  toUpdateClinicSettingsRequest,
} from "../schemas/clinic-settings.schema";

interface ClinicSettingsFormProps {
  settings: ClinicSettings;
  canEdit?: boolean;
  loading?: boolean;
  onSubmit: (payload: UpdateClinicSettingsRequest) => Promise<void> | void;
}

export function ClinicSettingsForm({
  settings,
  canEdit = true,
  loading = false,
  onSubmit,
}: ClinicSettingsFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClinicSettingsFormValues>({
    resolver: zodResolver(clinicSettingsSchema),
    values: toClinicSettingsFormValues(settings),
  });
  const watchedValues = useWatch({ control });
  const values = {
    displayName: watchedValues.displayName ?? "",
    logoUrl: watchedValues.logoUrl ?? "",
    primaryColor: watchedValues.primaryColor ?? "",
    secondaryColor: watchedValues.secondaryColor ?? "",
    accentColor: watchedValues.accentColor ?? "",
    contactEmail: watchedValues.contactEmail ?? "",
    contactPhone: watchedValues.contactPhone ?? "",
  };

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(toUpdateClinicSettingsRequest(data)))} className="space-y-6">
      <section className="grid gap-6 rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-5">
          <div data-tutorial="settings-identity" className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Minha clínica</h2>
              <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
                Atualize a identidade visual e os canais públicos da clínica.
              </p>
            </div>
            <FormField
              id="clinic-settings-display-name"
              label="Nome de exibição"
              disabled={!canEdit}
              error={errors.displayName?.message}
              {...register("displayName")}
            />
          </div>
          <div data-tutorial="settings-logo">
            <FormField
              id="clinic-settings-logo-url"
              label="Logo URL"
              type="url"
              disabled={!canEdit}
              error={errors.logoUrl?.message}
              {...register("logoUrl")}
            />
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-[#0f172a] dark:text-white">Preview da logo</p>
          <LogoPreview logoUrl={values.logoUrl} displayName={values.displayName} />
        </div>
      </section>

      <section data-tutorial="settings-colors" className="rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Cores da clínica</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {([
            ["primaryColor", "Cor primária"],
            ["secondaryColor", "Cor secundária"],
            ["accentColor", "Cor de destaque"],
          ] as const).map(([name, label]) => (
            <Controller
              key={name}
              name={name}
              control={control}
              render={({ field, fieldState }) => (
                <ColorInput
                  id={`clinic-settings-${name}`}
                  label={label}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  disabled={!canEdit}
                />
              )}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div data-tutorial="settings-contact" className="space-y-5 rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Contato</h2>
            <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">Dados exibidos para os pacientes.</p>
          </div>
          <FormField
            id="clinic-settings-contact-email"
            label="Email de contato"
            type="email"
            disabled={!canEdit}
            error={errors.contactEmail?.message}
            {...register("contactEmail")}
          />
          <FormField
            id="clinic-settings-contact-phone"
            label="Telefone de contato"
            disabled={!canEdit}
            error={errors.contactPhone?.message}
            {...register("contactPhone")}
          />
        </div>
        <div data-tutorial="settings-preview" className="rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Preview visual</h2>
          <div className="mt-5">
            <ClinicThemePreview
              displayName={values.displayName}
              logoUrl={values.logoUrl}
              primaryColor={values.primaryColor}
              secondaryColor={values.secondaryColor}
              accentColor={values.accentColor}
            />
          </div>
        </div>
      </section>

      {canEdit && (
        <div data-tutorial="settings-save" className="flex justify-end">
          <div className="w-full sm:w-48">
            <Button type="submit" loading={loading}>
              Salvar alterações
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
