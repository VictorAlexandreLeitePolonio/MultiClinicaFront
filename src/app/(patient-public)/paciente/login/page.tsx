"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { FormField } from "@/components/ui/FormField";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/utils/apiError";
import { usePatientAuth } from "@/contexts/PatientAuthContext";
import { resendActivation } from "../services/patient-auth.service";
import { patientLoginSchema, PatientLoginFormData } from "../schemas/patient-auth.schema";
import { PatientAuthShell } from "../components/PatientAuthShell";

export default function PatientLoginPage() {
  const router = useRouter();
  const { login } = usePatientAuth();
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientLoginFormData>({
    resolver: zodResolver(patientLoginSchema),
  });

  const onSubmit = async (data: PatientLoginFormData) => {
    setLoading(true);
    setPendingEmail(null);
    try {
      await login(data.email, data.password);
      router.replace("/paciente");
    } catch (err) {
      // 403 = conta pendente de ativação: orienta a ativação/reenvio.
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setPendingEmail(data.email);
      } else {
        toast.error(getApiErrorMessage(err, "Não foi possível entrar. Tente novamente."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingEmail) return;
    setResending(true);
    try {
      await resendActivation(pendingEmail);
      toast.success("Se houver uma conta pendente para este e-mail, o convite foi reenviado.");
    } catch {
      toast.error("Não foi possível reenviar o convite agora.");
    } finally {
      setResending(false);
    }
  };

  return (
    <PatientAuthShell
      title="Portal do Paciente"
      subtitle="Entre para acompanhar suas consultas e clínicas"
      footer={
        <span className="flex flex-col items-center gap-1">
          <Link href="/paciente/esqueci-senha" className="font-medium text-[#0f766e] hover:text-[#14b8a6]">
            Esqueci minha senha
          </Link>
          <Link href="/" className="font-medium text-[#0f766e] hover:text-[#14b8a6]">
            Voltar para a página inicial
          </Link>
        </span>
      }
    >
      {pendingEmail && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          <p className="font-semibold">Conta ainda não ativada</p>
          <p className="mt-1">
            Verifique seu e-mail para ativar a conta. Não recebeu o convite?
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="mt-2 font-semibold underline disabled:opacity-60"
          >
            {resending ? "Reenviando..." : "Reenviar convite de ativação"}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          label="E-mail"
          id="email"
          type="email"
          placeholder="seu@email.com"
          light
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          label="Senha"
          id="password"
          placeholder="Sua senha"
          light
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" loading={loading}>
          Entrar
        </Button>
      </form>
    </PatientAuthShell>
  );
}
