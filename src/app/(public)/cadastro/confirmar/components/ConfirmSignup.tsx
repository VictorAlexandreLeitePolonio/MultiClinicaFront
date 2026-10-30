"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Logo } from "@/components/ui/Logo";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/utils/apiError";
import { confirmSignup, resendSignupEmail } from "../../services/signup.service";
import { readSignupPlan } from "../../signupPlan";

type Status = "loading" | "success" | "error";

function isInvalidToken(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as { response?: { data?: { code?: string } } }).response?.data?.code === "INVALID_TOKEN"
  );
}

function buildLoginHref(email: string) {
  const storedPlan = readSignupPlan();
  const destination = storedPlan
    ? `/app/configuracoes/plano?assinar=${storedPlan.plan}&ciclo=${storedPlan.cycle}`
    : "/app";
  return `/login?email=${encodeURIComponent(email)}&next=${encodeURIComponent(destination)}`;
}

export function ConfirmSignup() {
  const token = useSearchParams().get("token") ?? "";
  const started = useRef(false);
  const [status, setStatus] = useState<Status>(token ? "loading" : "error");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("Link inválido ou expirado");
  const [resendEmail, setResendEmail] = useState("");
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (started.current || !token) return;
    started.current = true;

    confirmSignup(token)
      .then((result) => {
        setEmail(result.email);
        setStatus("success");
      })
      .catch((error) => {
        setErrorMessage(
          isInvalidToken(error)
            ? "Link inválido ou expirado"
            : "Não foi possível confirmar seu e-mail. Tente novamente.",
        );
        setStatus("error");
      });
  }, [token]);

  const resend = async () => {
    if (!resendEmail.trim()) return;
    try {
      await resendSignupEmail(resendEmail.trim());
      setResendSent(true);
      toast.success("E-mail reenviado.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível reenviar o e-mail."));
    }
  };

  return (
    <div className="theme-light flex min-h-screen">
      <AuthLayout>
        <Logo light />
        {status === "loading" && (
          <p role="status" className="text-sm text-slate-600">
            Confirmando seu e-mail…
          </p>
        )}

        {status === "success" && (
          <>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">E-mail confirmado</h1>
              <p className="mt-2 text-sm text-slate-600">
                Sua conta está ativa. Use <strong>{email}</strong> para entrar.
              </p>
            </div>
            <Link
              href={buildLoginHref(email)}
              className="text-center font-semibold text-primary-dark underline"
            >
              Entrar
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{errorMessage}</h1>
              <p className="mt-2 text-sm text-slate-600">
                Informe o e-mail da clínica para receber um novo link de confirmação.
              </p>
            </div>
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void resend();
              }}
            >
              <FormField
                label="E-mail"
                id="confirm-resend-email"
                type="email"
                light
                placeholder="seu@email.com"
                value={resendEmail}
                onChange={(event) => setResendEmail(event.target.value)}
              />
              {resendSent ? (
                <p role="status" className="text-sm text-[#0f766e]">
                  Se este e-mail estiver cadastrado, enviaremos um novo link.
                </p>
              ) : (
                <Button type="submit">Reenviar e-mail</Button>
              )}
            </form>
            <Link
              href="/cadastro"
              className="text-center text-sm font-medium text-[#0f766e] transition-colors hover:text-[#14b8a6]"
            >
              Voltar para o cadastro
            </Link>
          </>
        )}
      </AuthLayout>
    </div>
  );
}
