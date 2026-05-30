"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { AuthLayout } from "@/app/(public)/login/components/layout/AuthLayout";
import { AuthRightPanel } from "@/app/(public)/login/components/layout/AuthRightPanel";
import { Logo } from "@/components/ui/Logo";
import { FormField } from "@/components/ui/FormField";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/Button";
import { loginSchema, LoginFormData } from "@/app/(public)/login/schemas/loginSchema";
import { useLogin } from "@/app/(public)/login/hooks/login";

export default function HomePage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { loginUser, loading, error } = useLogin();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const email = watch("email");
  const password = watch("password");

  const onSubmit = async (data: LoginFormData) => {
    const result = await loginUser(data);

    if (result.success && result.user) {
      setUser({
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role as UserRole,
      });
      router.push("/bem-vindo");
    }
  };

  return (
    <div className="flex min-h-screen">
      <AuthLayout>
        <Logo />

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <FormField
              label="E-mail"
              type="email"
              id="email"
              name="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              value={email || ""}
              onChange={(e) => setValue("email", e.target.value, { shouldValidate: true })}
            />

            <PasswordField
              label="Senha"
              id="password"
              name="password"
              placeholder="••••••••"
              error={errors.password?.message}
              value={password || ""}
              onChange={(e) => setValue("password", e.target.value, { shouldValidate: true })}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <div className="pt-2">
            <Button type="submit" loading={loading}>
              Entrar
            </Button>
          </div>
        </form>
      </AuthLayout>

      <AuthRightPanel />
    </div>
  );
}
