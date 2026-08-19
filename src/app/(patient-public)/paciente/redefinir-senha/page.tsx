"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/utils/apiError";
import { resetPassword } from "../services/patient-auth.service";
import { resetPasswordSchema, ResetPasswordFormData } from "../schemas/patient-auth.schema";
import { PatientAuthShell } from "../components/PatientAuthShell";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <PatientAuthShell title="Link inválido" subtitle="Este link de redefinição é inválido ou está incompleto.">
        <div className="text-center text-sm">
          <Link href="/paciente/esqueci-senha" className="font-medium text-[#0f766e] hover:text-[#14b8a6]">
            Solicitar um novo link
          </Link>
        </div>
      </PatientAuthShell>
    );
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);
    try {
      await resetPassword({ token, password: data.password });
      toast.success("Senha redefinida com sucesso! Faça login com a nova senha.");
      router.replace("/paciente/login");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Não foi possível redefinir a senha. O link pode ter expirado."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PatientAuthShell title="Redefinir senha" subtitle="Escolha uma nova senha para sua conta">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <PasswordField
          label="Nova senha"
          id="password"
          placeholder="Mínimo de 8 caracteres"
          light
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordField
          label="Confirmar senha"
          id="confirmPassword"
          placeholder="Repita a senha"
          light
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <Button type="submit" loading={loading}>
          Redefinir senha
        </Button>
      </form>
    </PatientAuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
