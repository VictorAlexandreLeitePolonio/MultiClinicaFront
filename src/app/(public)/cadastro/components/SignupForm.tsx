"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Logo } from "@/components/ui/Logo";
import { FormField } from "@/components/ui/FormField";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/utils/apiError";
import { PLAN_LABELS } from "@/utils/plans";
import { resendSignupEmail, signup } from "../services/signup.service";
import { parseSignupPlan, saveSignupPlan } from "../signupPlan";

const signupSchema = z
  .object({
    clinicName: z.string().min(2, "Informe o nome da clínica."),
    ownerName: z.string().min(2, "Informe seu nome."),
    email: z.string().email("Informe um e-mail válido."),
    phone: z.string().min(1, "Informe um telefone."),
    password: z
      .string()
      .min(8, "Use pelo menos 8 caracteres.")
      .max(64, "Use no máximo 64 caracteres.")
      .refine(
        (value) => new TextEncoder().encode(value).length <= 72,
        "A senha é muito longa. Use menos caracteres.",
      ),
    confirmation: z.string(),
  })
  .refine((value) => value.password === value.confirmation, {
    path: ["confirmation"],
    message: "As senhas não coincidem.",
  });

type SignupFormData = z.infer<typeof signupSchema>;

const cycleLabels = { Monthly: "mensal", Annual: "anual" } as const;

export function SignupForm() {
  const searchParams = useSearchParams();
  const selectedPlan = parseSignupPlan(searchParams.get("plano"), searchParams.get("ciclo"));
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const submit = async (values: SignupFormData) => {
    saveSignupPlan(selectedPlan);
    try {
      await signup({
        clinicName: values.clinicName,
        ownerName: values.ownerName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      setSentTo(values.email);
    } catch (error) {
      setError("root", {
        message: getApiErrorMessage(error, "Não foi possível criar sua conta. Tente novamente."),
      });
    }
  };

  const resend = async () => {
    if (!sentTo || cooldown > 0) return;
    try {
      await resendSignupEmail(sentTo);
      toast.success("E-mail reenviado.");
      setCooldown(60);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível reenviar o e-mail."));
    }
  };

  return (
    <div className="theme-light flex min-h-screen">
      <AuthLayout>
        <Logo light />
        {sentTo ? (
          <>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Confira seu e-mail</h1>
              <p className="mt-2 text-sm text-[#64748b]">
                Enviamos um link de confirmação para <strong>{sentTo}</strong>. Abra o link para
                ativar sua conta.
              </p>
            </div>
            {selectedPlan && (
              <p className="rounded-xl bg-[#ecfdf5] px-4 py-3 text-sm text-[#0f766e]">
                Você escolheu o {PLAN_LABELS[selectedPlan.plan]} {cycleLabels[selectedPlan.cycle]} — o
                pagamento vem depois de confirmar o e-mail.
              </p>
            )}
            <Button type="button" variant="outline" onClick={() => void resend()} disabled={cooldown > 0}>
              {cooldown > 0 ? `Reenviar e-mail em ${cooldown}s` : "Reenviar e-mail"}
            </Button>
            <Link
              href="/login"
              className="text-center text-sm font-medium text-[#0f766e] transition-colors hover:text-[#14b8a6]"
            >
              Já confirmou? Entrar
            </Link>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Criar conta da clínica</h1>
              <p className="mt-1 text-sm text-[#64748b]">
                Comece grátis. Você só assina um plano pago quando quiser.
              </p>
            </div>

            {selectedPlan && (
              <p className="rounded-xl bg-[#ecfdf5] px-4 py-3 text-sm text-[#0f766e]">
                Você escolheu o {PLAN_LABELS[selectedPlan.plan]} {cycleLabels[selectedPlan.cycle]} — o
                pagamento vem depois de confirmar o e-mail.
              </p>
            )}

            <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-4">
              <FormField
                label="Nome da clínica"
                id="signup-clinic"
                required
                light
                error={errors.clinicName?.message}
                {...register("clinicName")}
              />
              <FormField
                label="Seu nome"
                id="signup-owner"
                required
                light
                error={errors.ownerName?.message}
                {...register("ownerName")}
              />
              <FormField
                label="E-mail"
                id="signup-email"
                type="email"
                required
                light
                placeholder="seu@email.com"
                error={errors.email?.message}
                {...register("email")}
              />
              <FormField
                label="Telefone"
                id="signup-phone"
                type="tel"
                required
                light
                placeholder="(11) 99999-9999"
                error={errors.phone?.message}
                {...register("phone")}
              />
              <PasswordField
                label="Senha"
                id="signup-password"
                required
                light
                autoComplete="new-password"
                error={errors.password?.message}
                {...register("password")}
              />
              <PasswordField
                label="Confirmar senha"
                id="signup-confirmation"
                required
                light
                autoComplete="new-password"
                error={errors.confirmation?.message}
                {...register("confirmation")}
              />
              {errors.root && (
                <p role="alert" className="text-sm text-red-700">
                  {errors.root.message}
                </p>
              )}
              <Button type="submit" loading={isSubmitting}>
                Criar conta
              </Button>
            </form>

            <Link
              href="/login"
              className="text-center text-sm font-medium text-[#0f766e] transition-colors hover:text-[#14b8a6]"
            >
              Já tem conta? Entrar
            </Link>
          </>
        )}
      </AuthLayout>
    </div>
  );
}
