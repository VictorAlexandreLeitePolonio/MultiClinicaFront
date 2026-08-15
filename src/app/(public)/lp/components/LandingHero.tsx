"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { LandingProductPreview } from "./LandingProductPreview";
import { RobotAvatar } from "@/components/mascot/RobotAvatar";
import { LandingSmoothLink } from "./LandingSmoothLink";
import type { LandingModuleId } from "./landingModules";

interface LandingHeroProps {
  activeModuleId: LandingModuleId;
  onModuleChange: (moduleId: LandingModuleId) => void;
}

export function LandingHero({ activeModuleId, onModuleChange }: LandingHeroProps) {
  return (
    <section
      data-mascot-anchor="hero"
      className="landing-hero relative overflow-hidden"
    >
      <div className="landing-hero__glow landing-hero__glow--top" />
      <div className="landing-hero__glow landing-hero__glow--bottom" />
      <div className="landing-hero__inner relative mx-auto grid min-h-[min(760px,calc(100vh-76px))] max-w-[88rem] items-center gap-14 px-6 py-20 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16 lg:px-8">
        <div className="relative z-10 max-w-2xl">
          <div className="landing-hero__signal">
            <span className="landing-hero__signal-dot" />
            Gestão clínica com visão de ponta a ponta
          </div>
          <h1 className="mt-7 max-w-xl text-5xl font-bold leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[4.7rem]">
            A clínica inteira, em uma visão só.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            Agenda, pacientes, prontuários, evolução e operação administrativa
            conectados em um sistema feito para o ritmo real da sua clínica.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <LandingSmoothLink
              href="#modulos"
              className="landing-button landing-button--primary"
            >
              Explorar o sistema
              <ArrowRight size={17} />
            </LandingSmoothLink>
            <LandingSmoothLink
              href="#contato"
              className="landing-button landing-button--secondary"
            >
              Solicitar acesso
            </LandingSmoothLink>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-2">
              <Sparkles size={14} className="text-teal-600" />
              Demo sem login
            </span>
            <span>Dados ilustrativos</span>
            <span>Acesso por indicação</span>
          </div>
        </div>

        <div className="landing-hero__preview-wrap relative z-10">
          <div className="landing-hero__preview-note">
            <span>Toque nos módulos</span>
            <ArrowRight size={14} />
          </div>
          <div className="landing-hero__robot-sticker">
            <RobotAvatar />
          </div>
          <LandingProductPreview
            activeModuleId={activeModuleId}
            onModuleChange={onModuleChange}
          />
        </div>
      </div>
    </section>
  );
}
