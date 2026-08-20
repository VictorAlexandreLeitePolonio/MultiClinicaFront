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
import { activate } from "../services/patient-auth.service";
import { activateAccountSchema, ActivateAccountFormData } from "../schemas/patient-auth.schema";
import { PatientAuthShell } from "../components/PatientAuthShell";

function ActivateForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivateAccountFormData>({
    resolver: zodResolver(activateAccountSchema),
  });

  if (!token) {
    return (
      <PatientAuthShell title="Link inválido" subtitle="Este link de ativação é inválido ou está incompleto.">
        <p className="text-center text-sm text-[#64748b] dark:text-slate-400">
          Solicite um novo convite à sua clínica ou tente novamente pelo e-mail recebido.
        </p>
        <div className="mt-6 text-center text-sm">
          <Link href="/paciente/login" className="font-medium text-[#0f766e] hover:text-[#14b8a6]">
            Ir para o login
          </Link>
        </div>
      </PatientAuthShell>
    );
  }

  const onSubmit = async (data: ActivateAccountFormData) => {
    setLoading(true);
    try {
      await activate({ token, password: data.password });
      toast.success("Conta ativada com sucesso! Faça login para continuar.");
      router.replace("/paciente/login");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Não foi possível ativar a conta. O link pode ter expirado."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PatientAuthShell title="Ativar conta" subtitle="Defina uma senha para acessar o portal">
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
          Ativar conta
        </Button>
      </form>
    </PatientAuthShell>
  );
}

export default function ActivateAccountPage() {
  return (
    <Suspense>
      <ActivateForm />
    </Suspense>
  );
}
