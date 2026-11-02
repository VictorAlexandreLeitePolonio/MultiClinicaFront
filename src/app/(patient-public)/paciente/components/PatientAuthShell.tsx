"use client";

import { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { AuthLayout } from "@/components/auth/AuthLayout";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Shell das telas públicas do paciente — mesmo split da clínica, com a marca do paciente. */
export function PatientAuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <AuthLayout variant="patient">
      <div className="lg:hidden">
        <Logo light />
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-primary-dark)]">
          Portal do paciente
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-secondary)]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-[var(--color-gray-600)]">{subtitle}</p>}
      </div>

      {children}

      {footer && <div className="text-center text-sm">{footer}</div>}
    </AuthLayout>
  );
}
