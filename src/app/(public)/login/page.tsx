"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import type { AuthRobotState } from "@/components/auth/AuthMouseRobot";
import { useLogin } from "./hooks/login";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPathByRole } from "@/lib/auth/routes";
import { loginSchema, LoginFormData } from "./schemas/loginSchema";
import { Logo } from "@/components/ui/Logo";
import { FormField } from "@/components/ui/FormField";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, user } = useAuth();
  const { loginUser, loading } = useLogin();
  const [robotState, setRobotState] = useState<AuthRobotState>("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(getDashboardPathByRole(user.role));
    }
  }, [isAuthenticated, router, user]);

  const onSubmit = async (data: LoginFormData) => {
    setRobotState("loading");
    const result = await loginUser(data);
    if (result.success && result.auth) {
      setRobotState("success");
      setAuth(result.auth);
      router.replace(getDashboardPathByRole(result.auth.user.role));
    } else {
      setRobotState("error");
      toast.error(result.error ?? "Erro ao fazer login.");
      window.setTimeout(() => setRobotState("idle"), 1400);
    }
  };

  return (
    <div className="theme-light flex min-h-screen">
      <AuthLayout robotState={loading ? "loading" : robotState}>
        <Logo light />

        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-[#0f172a]"
          >
            Acesso ao Sistema
          </h1>
          <p className="mt-1 text-sm text-[#64748b]">
            Entre com suas credenciais para continuar
          </p>
        </div>

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

        <Link
          href="/paciente/login"
          className="text-center text-sm font-medium text-[#0f766e] transition-colors hover:text-[#14b8a6]"
        >
          É paciente? Acesse o portal do paciente
        </Link>
        <Link
          href="/"
          className="text-center text-sm font-medium text-[#0f766e] transition-colors hover:text-[#14b8a6]"
        >
          Voltar para a página inicial
        </Link>
      </AuthLayout>
    </div>
  );
}
