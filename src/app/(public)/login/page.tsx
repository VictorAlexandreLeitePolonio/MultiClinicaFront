"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthLayout } from "./components/layout/AuthLayout";
import { AuthRightPanel } from "./components/layout/AuthRightPanel";
import { useLogin } from "./hooks/login";
import { useAuth } from "@/contexts/AuthContext";
import { loginSchema, LoginFormData } from "./schemas/loginSchema";
import { Logo } from "@/components/ui/Logo";
import { FormField } from "@/components/ui/FormField";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, isAuthenticated } = useAuth();
  const { loginUser, loading } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/bem-vindo");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginFormData) => {
    const result = await loginUser(data);
    if (result.success && result.user) {
      setUser(result.user);
      router.replace("/bem-vindo");
    } else {
      toast.error(result.error ?? "Erro ao fazer login.");
    }
  };

  return (
    <div className="flex min-h-screen">
      <AuthLayout>
        <Logo />

        <div>
          <h1
            className="text-2xl font-bold text-[#1a2a4a]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Acesso ao Sistema
          </h1>
          <p className="text-sm text-[#4a6354] mt-1" style={{ fontFamily: "var(--font-serif)" }}>
            Entre com suas credenciais para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            label="E-mail"
            id="email"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <PasswordField
            label="Senha"
            id="password"
            placeholder="Sua senha"
            error={errors.password?.message}
            {...register("password")}
          />

          <Button type="submit" loading={loading}>
            Entrar
          </Button>
        </form>
      </AuthLayout>

      <AuthRightPanel />
    </div>
  );
}
