"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Logo } from "@/components/ui/Logo";
import { FormField } from "@/components/ui/FormField";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/Button";
import { ease } from "@/lib/motion";
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
    terms: z.boolean().refine((value) => value, "Aceite os termos para continuar."),
  })
  .refine((value) => value.password === value.confirmation, {
    path: ["confirmation"],
    message: "As senhas não coincidem.",
  });

type SignupFormData = z.infer<typeof signupSchema>;

const STEPS = [
  {
    id: "clinic",
    label: "Clínica",
    title: "Dados da clínica",
    fields: ["clinicName"],
  },
  {
    id: "owner",
    label: "Responsável",
    title: "Seu acesso",
    fields: ["ownerName", "email", "phone", "password", "confirmation"],
  },
  {
    id: "plan",
    label: "Plano",
    title: "Plano e termos",
    fields: ["terms"],
  },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  title: string;
  fields: ReadonlyArray<FieldPath<SignupFormData>>;
}>;

const cycleLabels = { Monthly: "mensal", Annual: "anual" } as const;

export function SignupForm() {
  const searchParams = useSearchParams();
  const selectedPlan = parseSignupPlan(searchParams.get("plano"), searchParams.get("ciclo"));
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduceMotion = useReducedMotion();

  const {
    register,
    handleSubmit,
    trigger,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      clinicName: "",
      ownerName: "",
      email: "",
      phone: "",
      password: "",
      confirmation: "",
      terms: false,
    },
  });

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

  const goNext = async () => {
    const valid = await trigger([...STEPS[step].fields]);
    if (!valid) return;
    setDirection(1);
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (step < STEPS.length - 1) {
      event.preventDefault();
      void goNext();
      return;
    }
    void handleSubmit(submit)(event);
  };

  const stepVariants = {
    enter: (move: number) => ({ opacity: 0, x: reduceMotion ? 0 : move * 12 }),
    center: { opacity: 1, x: 0 },
    exit: (move: number) => ({ opacity: 0, x: reduceMotion ? 0 : move * -12 }),
  };

  return (
    <AuthLayout>
      <div className="lg:hidden">
        <Logo light />
      </div>

      {sentTo ? (
        <>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-primary-dark)]">
              Comece grátis
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-secondary)]">
              Confira seu e-mail
            </h1>
            <p className="mt-2 text-sm text-[var(--color-gray-600)]">
              Enviamos um link de confirmação para <strong>{sentTo}</strong>. Abra o link para
              ativar sua conta.
            </p>
          </div>
          {selectedPlan && (
            <p className="rounded-xl bg-[var(--color-primary-muted)] px-4 py-3 text-sm text-[var(--color-primary-dark)]">
              Você escolheu o {PLAN_LABELS[selectedPlan.plan]} {cycleLabels[selectedPlan.cycle]} — o
              pagamento vem depois de confirmar o e-mail.
            </p>
          )}
          <Button type="button" variant="outline" onClick={() => void resend()} disabled={cooldown > 0}>
            {cooldown > 0 ? `Reenviar e-mail em ${cooldown}s` : "Reenviar e-mail"}
          </Button>
          <Link
            href="/login"
            className="text-center text-sm font-medium text-[var(--color-primary-dark)] transition-colors duration-150 hover:text-[var(--color-primary)] motion-reduce:transition-none"
          >
            Já confirmou? Entrar
          </Link>
        </>
      ) : (
        <>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-primary-dark)]">
              Comece grátis
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-secondary)]">
              Criar conta da clínica
            </h1>
            <p className="mt-1 text-sm text-[var(--color-gray-600)]">
              Comece grátis. Você só assina um plano pago quando quiser.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} noValidate className="flex flex-col gap-6">
            <ol className="flex gap-2" aria-label="Etapas do cadastro">
              {STEPS.map((item, index) => {
                const isActive = index === step;
                const isDone = index < step;
                return (
                  <li
                    key={item.id}
                    className="min-w-0 flex-1"
                    aria-current={isActive ? "step" : undefined}
                  >
                    <span
                      className={`block h-1 rounded-full transition-colors duration-150 motion-reduce:transition-none ${
                        isActive
                          ? "bg-[var(--color-primary)]"
                          : isDone
                            ? "bg-[var(--color-primary-light)]"
                            : "bg-[var(--color-gray-200)]"
                      }`}
                    />
                    <span
                      className={`mt-1.5 block truncate text-[11px] font-medium ${
                        isActive ? "text-[var(--color-secondary)]" : "text-[var(--color-gray-600)]"
                      }`}
                    >
                      {item.label}
                    </span>
                  </li>
                );
              })}
            </ol>

            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={STEPS[step].id}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.15, ease: ease.inOut }}
                className="flex flex-col gap-4"
              >
                <h2 className="text-base font-semibold text-[var(--color-secondary)]">
                  {STEPS[step].title}
                </h2>

                {step === 0 && (
                  <FormField
                    label="Nome da clínica"
                    id="signup-clinic"
                    required
                    light
                    error={errors.clinicName?.message}
                    {...register("clinicName")}
                  />
                )}

                {step === 1 && (
                  <>
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
                  </>
                )}

                {step === 2 && (
                  <>
                    {selectedPlan ? (
                      <p className="rounded-xl bg-[var(--color-primary-muted)] px-4 py-3 text-sm text-[var(--color-primary-dark)]">
                        Você escolheu o {PLAN_LABELS[selectedPlan.plan]}{" "}
                        {cycleLabels[selectedPlan.cycle]} — o pagamento vem depois de confirmar o
                        e-mail.
                      </p>
                    ) : (
                      <p className="rounded-xl bg-[var(--color-primary-muted)] px-4 py-3 text-sm text-[var(--color-primary-dark)]">
                        Plano Free — comece sem cartão. Você só assina um plano pago quando quiser.
                      </p>
                    )}

                    <label className="flex items-start gap-2.5 text-sm text-[var(--color-gray-600)]">
                      <input
                        type="checkbox"
                        id="signup-terms"
                        className="mt-0.5 size-4 shrink-0 accent-[var(--color-primary-dark)]"
                        {...register("terms")}
                      />
                      <span>
                        Li e aceito os termos de uso e a política de privacidade da Cliniq Care.
                      </span>
                    </label>
                    {errors.terms && (
                      <p className="text-xs font-medium text-red-600">{errors.terms.message}</p>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {errors.root && (
              <p role="alert" className="text-sm text-red-700">
                {errors.root.message}
              </p>
            )}

            <div className="flex items-center gap-3">
              {step > 0 && (
                <div className="flex-1">
                  <Button type="button" variant="outline" onClick={goBack}>
                    Voltar
                  </Button>
                </div>
              )}
              <div className="flex-[2]">
                {step < STEPS.length - 1 ? (
                  <Button type="button" onClick={() => void goNext()}>
                    Continuar
                  </Button>
                ) : (
                  <Button type="submit" loading={isSubmitting}>
                    Criar conta
                  </Button>
                )}
              </div>
            </div>
          </form>

          <Link
            href="/login"
            className="text-center text-sm font-medium text-[var(--color-primary-dark)] transition-colors duration-150 hover:text-[var(--color-primary)] motion-reduce:transition-none"
          >
            Já tem conta? Entrar
          </Link>
        </>
      )}
    </AuthLayout>
  );
}
