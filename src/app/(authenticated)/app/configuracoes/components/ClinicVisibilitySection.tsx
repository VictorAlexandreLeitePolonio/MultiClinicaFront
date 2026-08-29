"use client";

import { Control, Controller } from "react-hook-form";
import { ClinicSettingsFormValues } from "../schemas/clinic-settings.schema";
import { Toggle } from "./Toggle";

interface Props {
  control: Control<ClinicSettingsFormValues>;
  disabled?: boolean;
}

export function ClinicVisibilitySection({ control, disabled }: Props) {

  return (
    <section className="space-y-5 rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Visibilidade</h2>
        <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
          Controle a presença pública e o recebimento de solicitações.
        </p>
      </div>

      <Controller
        control={control}
        name="isPublic"
        render={({ field }) => (
          <Toggle
            id="clinic-is-public"
            label="Perfil público ativo"
            description="Exibe a página pública da clínica em /clinicas."
            checked={field.value}
            onChange={field.onChange}
            disabled={disabled}
          />
        )}
      />

      <Controller
        control={control}
        name="acceptsAppointmentRequests"
        render={({ field }) => (
          <Toggle
            id="clinic-accepts-requests"
            label="Aceitar solicitações online"
            description="Seus pacientes vinculados podem solicitar consultas pelo portal; com o perfil público ativo, qualquer paciente pode solicitar pelo marketplace."
            checked={field.value}
            onChange={field.onChange}
            disabled={disabled}
          />
        )}
      />
    </section>
  );
}
