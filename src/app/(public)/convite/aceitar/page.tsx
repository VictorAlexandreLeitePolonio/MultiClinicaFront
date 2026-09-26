"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Logo } from "@/components/ui/Logo";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/utils/apiError";
import { acceptUserInvitation } from "@/app/(authenticated)/app/usuarios/services/users.service";

const schema = z.object({
  password: z.string().min(8, "Use pelo menos 8 caracteres.").max(64, "Use no máximo 64 caracteres.")
    .refine((value) => new TextEncoder().encode(value).length <= 72, "A senha é muito longa. Use menos caracteres."),
  confirmation: z.string(),
}).refine((value) => value.password === value.confirmation, { path: ["confirmation"], message: "As senhas não coincidem." });
type FormData = z.infer<typeof schema>;

function AcceptInvitation() {
  const token = useSearchParams().get("token") ?? "";
  const [accepted, setAccepted] = useState(false);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const submit = async (values: FormData) => {
    try {
      await acceptUserInvitation({ token, password: values.password });
      setAccepted(true);
    } catch (error) {
      setError("root", { message: getApiErrorMessage(error, "Não foi possível aceitar o convite. Tente novamente.") });
    }
  };

  return (
    <div className="theme-light flex min-h-screen">
      <AuthLayout>
        <Logo light />
        <h1 className="text-2xl font-bold text-slate-900">{accepted ? "Sua conta está pronta" : "Aceitar convite"}</h1>
        {accepted ? (
          <Link href="/login" className="font-semibold text-primary-dark underline">Entrar no Cliniq</Link>
        ) : !token ? (
          <p role="alert" className="text-sm text-slate-600">Link inválido. Solicite um novo convite ao administrador da clínica.</p>
        ) : (
          <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">Defina sua senha para acessar a equipe da clínica.</p>
            <PasswordField id="invite-password" label="Senha" light autoComplete="new-password" error={errors.password?.message} {...register("password")} />
            <PasswordField id="invite-confirmation" label="Confirmar senha" light autoComplete="new-password" error={errors.confirmation?.message} {...register("confirmation")} />
            {errors.root && <p role="alert" className="text-sm text-red-700">{errors.root.message}</p>}
            <Button type="submit" loading={isSubmitting}>Definir senha e aceitar convite</Button>
          </form>
        )}
      </AuthLayout>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return <Suspense><AcceptInvitation /></Suspense>;
}
