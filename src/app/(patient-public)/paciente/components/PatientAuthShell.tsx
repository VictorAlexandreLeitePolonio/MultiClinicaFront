"use client";

import { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { AuthLayout } from "@/components/auth/AuthLayout";
import type { AuthRobotState } from "@/components/auth/AuthMouseRobot";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  robotState?: AuthRobotState;
}

/** Shell das telas públicas do paciente — mesmo palco do login da clínica (robô flutuante). */
export function PatientAuthShell({ title, subtitle, children, footer, robotState = "idle" }: Props) {
  return (
    <div className="theme-light flex min-h-screen">
      <AuthLayout robotState={robotState}>
        <Logo light />

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-[#64748b]">{subtitle}</p>}
        </div>

        {children}

        {footer && <div className="text-center text-sm">{footer}</div>}
      </AuthLayout>
    </div>
  );
}
