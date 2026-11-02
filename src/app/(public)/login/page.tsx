"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useLogin } from "./hooks/login";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPathByRole } from "@/lib/auth/routes";
import { ease } from "@/lib/motion";
import { loginSchema, LoginFormData } from "./schemas/loginSchema";
import { Logo } from "@/components/ui/Logo";
import { FormField } from "@/components/ui/FormField";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/Button";
import { resolvePostLoginPath } from "./utils/postLoginPath";

const LINK_CLASS =
  "text-center text-sm font-medium text-[var(--color-primary-dark)] transition-colors duration-150 hover:text-[var(--color-primary)] motion-reduce:transition-none";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { setAuth, isAuthenticated, user } = useAuth();
  const { loginUser, loading } = useLogin();
  const [loginError, setLoginError] = useState<string | null>(null);
  const shakeControls = useAnimationControls();
  const reduceMotion = useReducedMotion();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: searchParams.get("email") ?? "" },
  });

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(resolvePostLoginPath(getDashboardPathByRole(user.role), next));
    }
  }, [isAuthenticated, next, router, user]);

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    const result = await loginUser(data);
    if (result.success && result.auth) {
      setAuth(result.auth);
      router.replace(resolvePostLoginPath(getDashboardPathByRole(result.auth.user.role), next));
    } else {
      const message = result.error ?? "Erro ao fazer login.";
      setLoginError(message);
      toast.error(message);
      if (!reduceMotion) {
        void shakeControls.start({
          x: [0, -4, 4, -4, 4, 0],
          transition: { duration: 0.24, ease: ease.inOut },
        });
      }
    }
  };

  return (
    <AuthLayout>
      <div className="lg:hidden">
        <Logo light />
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-primary-dark)]">
          Área da clínica
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-secondary)]">
          Acesso ao Sistema
        </h1>
        <p className="mt-1 text-sm text-[var(--color-gray-600)]">
          Entre com suas credenciais para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <motion.div animate={shakeControls} className="flex flex-col gap-4">
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
        </motion.div>

        {loginError && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
          >
            {loginError}
          </p>
        )}

        <Button type="submit" loading={loading}>
          Entrar
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        <Link href="/cadastro" className={LINK_CLASS}>
          Ainda não tem conta? Comece grátis
        </Link>
        <Link href="/paciente/login" className={LINK_CLASS}>
          É paciente? Acesse o portal do paciente
        </Link>
        <Link href="/" className={LINK_CLASS}>
          Voltar para a página inicial
        </Link>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-bg-warm)]" />}>
      <LoginContent />
    </Suspense>
  );
}
