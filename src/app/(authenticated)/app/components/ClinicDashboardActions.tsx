import Link from "next/link";
import {
  ArrowRight,
  BarChart2,
  Calendar,
  ClipboardList,
  CreditCard,
  FileText,
  Shield,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { UserRole } from "@/types";

interface ClinicDashboardActionsProps {
  role: UserRole;
}

interface DashboardAction {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  roles: UserRole[];
}

const dashboardActions: DashboardAction[] = [
  {
    href: "/app/agenda",
    title: "Agenda",
    description: "Acompanhar horários, sessões e atendimentos do dia.",
    icon: Calendar,
    roles: ["Administrador", "Profissional", "Recepcao"],
  },
  {
    href: "/app/pacientes",
    title: "Pacientes",
    description: "Consultar cadastro, histórico e dados de contato.",
    icon: Users,
    roles: ["Administrador", "Profissional", "Recepcao"],
  },
  {
    href: "/app/prontuarios",
    title: "Prontuários",
    description: "Registrar evolução, exames e informações clínicas.",
    icon: FileText,
    roles: ["Administrador", "Profissional"],
  },
  {
    href: "/app/pagamentos",
    title: "Pagamentos",
    description: "Conferir pagamentos de pacientes e pendências operacionais.",
    icon: CreditCard,
    roles: ["Administrador", "Recepcao"],
  },
  {
    href: "/app/financeiro",
    title: "Financeiro",
    description: "Ver despesas, entradas e saldo interno da clínica.",
    icon: BarChart2,
    roles: ["Administrador"],
  },
  {
    href: "/app/planos",
    title: "Planos",
    description: "Gerenciar pacotes, tipos de sessão e valores.",
    icon: ClipboardList,
    roles: ["Administrador"],
  },
  {
    href: "/app/usuarios",
    title: "Usuários",
    description: "Controlar acessos e perfis da equipe.",
    icon: Shield,
    roles: ["Administrador"],
  },
];

const roleCopy: Record<Exclude<UserRole, "SuperAdmin">, { title: string; description: string }> = {
  Administrador: {
    title: "Operação completa",
    description: "Acompanhe agenda, pacientes, pagamentos, financeiro e gestão da equipe.",
  },
  Profissional: {
    title: "Rotina clínica",
    description: "Priorize atendimentos, pacientes e prontuários para manter a evolução em dia.",
  },
  Recepcao: {
    title: "Atendimento e recepção",
    description: "Acesse rapidamente agenda, pacientes e pagamentos do fluxo de entrada.",
  },
};

export function ClinicDashboardActions({ role }: ClinicDashboardActionsProps) {
  if (role === "SuperAdmin") return null;

  const visibleActions = dashboardActions.filter((action) => action.roles.includes(role));
  const copy = roleCopy[role];

  return (
    <section className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#5a9c94] dark:text-[#7bbfb8]">
          {copy.title}
        </p>
        <h2 className="mt-1 text-lg font-bold text-[#1a2a4a] dark:text-slate-50">
          Atalhos prioritários
        </h2>
        <p className="mt-1 text-sm text-[#4a6354] dark:text-slate-300">{copy.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              aria-label={`Abrir ${action.title}`}
              className="group rounded-sm border-2 border-[#e2ebe6] bg-white p-5 shadow-[2px_2px_0_0_#e2ebe6] transition-colors hover:border-[#5a9c94] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[2px_2px_0_0_#334155]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-sm bg-[#e8f4f3] p-2 text-[#1a4a3a] dark:bg-slate-800 dark:text-[#7bbfb8]">
                  <Icon size={20} />
                </div>
                <ArrowRight
                  size={16}
                  className="text-[#5a9c94] transition-transform group-hover:translate-x-1"
                />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#1a2a4a] dark:text-slate-50">
                {action.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4a6354] dark:text-slate-300">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
