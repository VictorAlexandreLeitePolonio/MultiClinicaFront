"use client";

import { LandingProductPreview } from "./LandingProductPreview";
import { landingModules, type LandingModuleId } from "./landingModules";

interface LandingFeaturesProps {
  activeModuleId: LandingModuleId;
  onModuleChange: (moduleId: LandingModuleId) => void;
}

export function LandingFeatures({ activeModuleId, onModuleChange }: LandingFeaturesProps) {
  return (
    <section id="modulos" data-mascot-anchor="modulos" data-landing-reveal className="landing-modules py-24 sm:py-32">
      <div className="mx-auto max-w-[88rem] px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-bold leading-tight tracking-[-0.045em] text-slate-950 sm:text-5xl">
            Uma visão rápida de cada frente da clínica.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Explore os módulos e veja como cada parte da operação encontra o seu lugar,
            sem abrir telas complexas ou tirar você da página.
          </p>
        </div>

        <div className="landing-modules__grid mt-14 grid items-start gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
          <div className="landing-module-list" aria-label="Módulos da clínica">
            {landingModules.map((module) => {
              const Icon = module.icon;
              const isActive = module.id === activeModuleId;

              return (
                <button
                  key={module.id}
                  type="button"
                  className="landing-module-row"
                  data-active={isActive}
                  aria-pressed={isActive}
                  onClick={() => onModuleChange(module.id)}
                >
                  <span className="landing-module-row__icon">
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block text-sm font-bold text-slate-900">{module.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{module.description}</span>
                  </span>
                  <span className="landing-module-row__arrow">→</span>
                </button>
              );
            })}
          </div>

          <div className="landing-modules__preview lg:sticky lg:top-28">
            <LandingProductPreview
              compact
              activeModuleId={activeModuleId}
              onModuleChange={onModuleChange}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
