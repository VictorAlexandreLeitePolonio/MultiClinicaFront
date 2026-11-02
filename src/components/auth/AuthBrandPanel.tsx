"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { HeroDemo } from "@/app/(public)/lp/components/hero/HeroDemo";
import { BrandLogo } from "@/components/ui/BrandLogo";

const HeroShader = dynamic(
  () => import("@/app/(public)/lp/components/hero/HeroShader").then((module) => module.HeroShader),
  { ssr: false },
);

export type AuthBrandVariant = "staff" | "patient";

const COPY: Record<AuthBrandVariant, { phrase: string; support: string; footer: string }> = {
  staff: {
    phrase: "Sua clínica no automático.",
    support: "Agenda, prontuário, consulta gravada e cobrança num sistema só.",
    footer: "Agenda · Prontuário · Cobrança",
  },
  patient: {
    phrase: "Suas consultas e cobranças num lugar só.",
    support: "Acompanhe atendimentos, recibos e pagamentos sem precisar ligar para a clínica.",
    footer: "Consultas · Cobranças · Clínicas",
  },
};

/**
 * Painel escuro das telas de autenticação. Só aparece a partir de 1024px;
 * abaixo disso o formulário ocupa a tela inteira.
 */
export function AuthBrandPanel({ variant }: { variant: AuthBrandVariant }) {
  const copy = COPY[variant];

  return (
    <aside className="auth-brand theme-lp relative isolate hidden shrink-0 overflow-hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[44%] lg:max-w-[640px] lg:flex-col lg:justify-between">
      <HeroShader />

      <div className="relative z-10 flex items-center px-8 pt-8 xl:px-12 xl:pt-10">
        <Link
          href="/"
          aria-label="Cliniq — página inicial"
          className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lp-bg)]"
        >
          <BrandLogo variant="mark" size={32} className="rounded-[10px]" priority />
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--lp-ink)]">
            Cliniq Care
          </span>
        </Link>
      </div>

      <div className="relative z-10 flex flex-col px-8 py-10 xl:px-12 xl:py-12">
        <p className="font-wide max-w-[16ch] text-[clamp(2.25rem,3.2vw,3.25rem)] leading-[1.04] tracking-[-0.03em] text-balance text-[var(--lp-ink)]">
          {copy.phrase}
        </p>
        <p className="mt-5 max-w-[42ch] text-sm leading-6 text-[var(--lp-muted)] sm:text-base sm:leading-7">
          {copy.support}
        </p>

        {variant === "staff" && (
          <div className="auth-brand__demo mt-9">
            <HeroDemo />
          </div>
        )}
      </div>

      <div className="relative z-10 px-8 pb-8 xl:px-12 xl:pb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--lp-muted)]">
          {copy.footer}
        </p>
      </div>
    </aside>
  );
}
