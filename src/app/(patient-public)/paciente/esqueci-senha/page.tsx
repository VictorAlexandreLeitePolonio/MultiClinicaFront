"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { forgotPassword } from "../services/patient-auth.service";
import { forgotPasswordSchema, ForgotPasswordFormData } from "../schemas/patient-auth.schema";
import { PatientAuthShell } from "../components/PatientAuthShell";

const NEUTRAL_MESSAGE =
  "Se houver uma conta para este e-mail, enviamos as instruções de redefinição de senha.";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      await forgotPassword(data.email);
    } catch {
      // Resposta sempre neutra: não revela se o e-mail existe nem falhas.
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  const backToLogin = (
    <Link href="/paciente/login" className="font-medium text-[#0f766e] hover:text-[#14b8a6]">
      Voltar para o login
    </Link>
  );

  if (submitted) {
    return (
      <PatientAuthShell title="Verifique seu e-mail" footer={backToLogin}>
        <div className="flex flex-col items-center gap-3 text-center">
          <MailCheck size={40} className="text-[#14b8a6]" />
          <p className="text-sm text-[#64748b] dark:text-slate-400">{NEUTRAL_MESSAGE}</p>
        </div>
      </PatientAuthShell>
    );
  }

  return (
    <PatientAuthShell
      title="Recuperar senha"
      subtitle="Informe seu e-mail para receber as instruções"
      footer={backToLogin}
    >
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
        <Button type="submit" loading={loading}>
          Enviar instruções
        </Button>
      </form>
    </PatientAuthShell>
  );
}
