"use client";

import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import { ShimmerLink } from "@/components/magicui/shimmer-button";
import { LandingSmoothLink } from "../LandingSmoothLink";
import { HeroDemo } from "./HeroDemo";

const HeroShader = dynamic(
  () => import("./HeroShader").then((module) => module.HeroShader),
  { ssr: false },
);

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative isolate overflow-hidden bg-[var(--lp-bg)] px-5 pb-16 pt-28 text-[var(--lp-ink)] sm:px-8 lg:px-8 lg:pb-24 lg:pt-36"
    >
      <HeroShader />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 lg:col-span-5">
          <h1 className="font-wide max-w-[18ch] text-[clamp(2.5rem,5vw,4.75rem)] leading-[1.02] tracking-[-0.03em] text-balance">
            Sua clínica no automático. Você no paciente.
          </h1>

          <p className="mt-6 max-w-[52ch] text-base leading-7 text-[var(--lp-muted)] sm:text-lg sm:leading-8">
            Agenda, prontuário, consulta gravada com relatório SOAP pela IA e cobrança online. Tudo
            num sistema só, feito para quem ainda resolve a clínica no papel e no WhatsApp.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ShimmerLink
              href="/cadastro"
              className="hero-cta min-h-12 rounded-full px-7 text-sm font-semibold text-[var(--lp-bg)]"
              background="var(--color-primary)"
              shimmerColor="var(--color-primary-light)"
              shimmerDuration="4s"
              borderRadius="9999px"
            >
              Começar grátis
            </ShimmerLink>

            <LandingSmoothLink
              href="#funcionalidades"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-semibold text-[var(--lp-ink)] transition-colors hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lp-bg)]"
            >
              Ver como funciona
              <ArrowRight size={16} aria-hidden="true" />
            </LandingSmoothLink>
          </div>

          <p className="mt-6 font-mono text-xs text-[var(--lp-muted)]">
            Sem cartão · Plano Free para sempre
          </p>
        </div>

        <div className="min-w-0 lg:col-span-7">
          <HeroDemo />
        </div>
      </div>
    </section>
  );
}
