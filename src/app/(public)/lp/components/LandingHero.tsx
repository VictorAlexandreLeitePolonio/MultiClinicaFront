import Link from "next/link";
import { ArrowRight, CalendarDays, CreditCard, FileText, Users } from "lucide-react";

const highlights = [
  { label: "Agenda clínica", icon: CalendarDays },
  { label: "Pacientes", icon: Users },
  { label: "Prontuários", icon: FileText },
  { label: "Financeiro", icon: CreditCard },
];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-[#f8fffc] bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.24),transparent_34%),linear-gradient(180deg,#f8fffc_0%,#f0fdf9_100%)]">
      <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[1fr_0.9fr]">
        <div className="max-w-3xl">
          <p className="mb-4 inline-flex rounded-full border border-[#a7f3d0] bg-white px-4 py-2 text-sm font-semibold text-[#0f766e] shadow-sm">
            Gestão moderna para clínicas em crescimento
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-[#0f172a] sm:text-5xl lg:text-6xl">
            MultiClinica
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#64748b]">
            Centralize agenda, pacientes, prontuários, pagamentos e operação administrativa em uma experiência SaaS limpa, segura e pronta para escalar.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#14b8a6] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_42px_-28px_rgba(20,184,166,0.95)] transition-colors hover:bg-[#0f766e]"
            >
              Acessar sistema
              <ArrowRight size={16} />
            </Link>
            <a
              href="#modulos"
              className="inline-flex items-center justify-center rounded-xl border border-[#99f6e4] bg-white px-5 py-3 text-sm font-semibold text-[#0f766e] shadow-sm transition-colors hover:bg-[#ecfdf5]"
            >
              Ver módulos
            </a>
          </div>
        </div>

        <div className="rounded-3xl border border-[#d7f3ea] bg-white/90 p-5 shadow-[0_32px_90px_-48px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <div className="rounded-2xl bg-gradient-to-br from-[#0f766e] via-[#14b8a6] to-[#06b6d4] p-6 text-white">
            <p className="text-sm font-medium text-white/75">Painel operacional</p>
            <strong className="mt-2 block text-3xl">Visão completa da clínica</strong>
          </div>
          <div id="modulos" className="mt-5 grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-[#d7f3ea] bg-[#f8fffc] p-4">
                  <Icon className="text-[#14b8a6]" size={22} />
                  <p className="mt-3 text-sm font-semibold text-[#0f172a]">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
