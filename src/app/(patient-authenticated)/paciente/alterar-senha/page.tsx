"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/utils/apiError";
import { changePassword } from "@/app/(patient-public)/paciente/services/patient-auth.service";
import {
  changePasswordSchema,
  ChangePasswordFormData,
} from "@/app/(patient-public)/paciente/schemas/patient-auth.schema";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setLoading(true);
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success("Senha alterada com sucesso.");
      reset();
      router.replace("/paciente");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Não foi possível alterar a senha."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-10">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm font-medium text-[#0f766e] hover:text-[#14b8a6]"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <div className="rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-bold text-[#0f172a] dark:text-white">Alterar senha</h1>
        <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
          Informe a senha atual e escolha uma nova.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
          <PasswordField
            label="Senha atual"
            id="currentPassword"
            light
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />
          <PasswordField
            label="Nova senha"
            id="newPassword"
            placeholder="Mínimo de 8 caracteres"
            light
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <PasswordField
            label="Confirmar nova senha"
            id="confirmPassword"
            light
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <Button type="submit" loading={loading}>
            Salvar nova senha
          </Button>
        </form>
      </div>
    </div>
  );
}
