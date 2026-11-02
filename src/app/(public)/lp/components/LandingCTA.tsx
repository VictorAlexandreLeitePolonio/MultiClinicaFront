"use client";

import { ArrowRight } from "lucide-react";
import { ShimmerLink } from "@/components/magicui/shimmer-button";

export function LandingCTA() {
  return (
    <section
      id="contato"
      aria-labelledby="cta-title"
      className="border-t border-[var(--lp-line)] bg-[var(--lp-bg)] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-[88rem] px-6 lg:px-8">
        <div className="rounded-3xl border border-[var(--lp-line)] bg-[var(--lp-surface)] px-6 py-14 text-center sm:px-10 sm:py-20">
          <h2
            id="cta-title"
            className="font-wide mx-auto max-w-3xl text-balance text-[clamp(2rem,5vw,4rem)] leading-[1.02] tracking-[-0.03em] text-[var(--lp-ink)]"
          >
            Pronto para tirar a clínica do papel?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[var(--lp-muted)]">
            Agenda, prontuário, consulta gravada e cobrança online num sistema só. Comece
            pelo plano Free e cresça quando fizer sentido.
          </p>

          <div className="mt-9 flex justify-center">
            <ShimmerLink
              href="/cadastro"
              background="var(--color-primary)"
              shimmerColor="var(--lp-ink)"
              className="lp-shimmer gap-2 px-6 py-3.5 text-sm font-semibold text-[var(--lp-bg)]"
            >
              Começar grátis
              <ArrowRight size={16} aria-hidden="true" />
            </ShimmerLink>
          </div>

          <p className="mt-4 font-mono text-xs text-[var(--lp-muted)]">
            Sem cartão · Plano Free para sempre
          </p>
        </div>
      </div>
    </section>
  );
}
