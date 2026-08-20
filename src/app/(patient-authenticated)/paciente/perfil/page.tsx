"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCPF, unformatPhone } from "@/utils/formatters";
import { maskPhone } from "@/utils/masks";
import { patientProfileSchema, PatientProfileFormData } from "../schemas/patient-profile.schema";
import { usePatientMe, useUpdatePatientMe } from "../hooks/usePatientPortal";

export default function PatientProfilePage() {
  const { data, isLoading, isError, refetch } = usePatientMe();
  const update = useUpdatePatientMe();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientProfileFormData>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: { name: "", phone: "" },
  });

  useEffect(() => {
    if (data) {
      reset({ name: data.name ?? "", phone: maskPhone(data.phone ?? "") });
    }
  }, [data, reset]);

  const onSubmit = async (form: PatientProfileFormData) => {
    try {
      await update.mutateAsync({ name: form.name.trim(), phone: unformatPhone(form.phone) });
      toast.success("Perfil atualizado com sucesso.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Não foi possível atualizar o perfil."));
    }
  };

  if (isLoading) {
    return <p className="py-8 text-center text-sm text-[#64748b] dark:text-slate-400">Carregando...</p>;
  }

  if (isError || !data) {
    return <ErrorState message="Não foi possível carregar seu perfil." onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a] dark:text-white">Meu perfil</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <FormField label="Nome" light error={errors.name?.message} {...register("name")} />

        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <FormField
              label="Telefone"
              light
              error={errors.phone?.message}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(maskPhone(e.target.value))}
              onBlur={field.onBlur}
            />
          )}
        />

        <FormField label="E-mail" light disabled value={data.email ?? "-"} onChange={() => undefined} />
        <FormField
          label="CPF"
          light
          disabled
          value={data.cpf ? formatCPF(data.cpf) : "-"}
          onChange={() => undefined}
        />

        <div className="pt-2">
          <Button type="submit" loading={update.isPending} fullWidth={false}>
            Salvar alterações
          </Button>
        </div>
      </form>

      <div className="rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-[#0f172a] dark:text-white">Segurança</h2>
        <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
          Altere sua senha de acesso ao portal.
        </p>
        <Link href="/paciente/alterar-senha" className="mt-4 inline-block">
          <Button variant="outline" fullWidth={false}>
            <KeyRound size={16} />
            Alterar senha
          </Button>
        </Link>
      </div>
    </div>
  );
}
