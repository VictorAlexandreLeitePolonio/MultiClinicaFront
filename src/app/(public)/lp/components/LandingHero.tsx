"use client";

import { useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowRight, CalendarCheck, Check, FileText, Pause, Play } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { LandingSmoothLink } from "./LandingSmoothLink";

export function LandingHero() {
  const section = useRef<HTMLElement>(null);
  const visible = useInView(section, { amount: 0.15 });
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);

  return (
    <section ref={section} data-mascot-anchor="hero" className="landing-hero landing-hero--immersive"
      data-running={visible && !paused && !reducedMotion}>
      <div className="landing-hero__opening">
        <h1><span>A clínica inteira.</span><span>Em uma visão só.</span></h1>
        <p>Da primeira consulta ao próximo passo.<br className="hidden sm:block" /> Agenda, cuidado e gestão no mesmo lugar.</p>
        <div className="landing-hero__actions">
          <LandingSmoothLink href="#modulos" className="landing-button landing-button--primary">
            Explorar o sistema <ArrowRight size={17} />
          </LandingSmoothLink>
          <LandingSmoothLink href="#contato" className="landing-button landing-button--secondary">Solicitar acesso</LandingSmoothLink>
        </div>
      </div>

      <div className="landing-hero__flow" aria-label="Exemplo ilustrativo de uma rotina conectada">
        <svg className="landing-hero__connections" viewBox="0 0 1000 220" fill="none" aria-hidden="true">
          <path className="hero-connection" d="M180 110H380Q410 110 430 110H570Q600 110 630 110H820" />
          <path className="hero-packet" d="M180 110H820" pathLength="100" />
          <circle cx="390" cy="110" r="4" /><circle cx="610" cy="110" r="4" />
        </svg>
        <div className="hero-flow-card hero-flow-card--appointment">
          <div className="hero-flow-card__heading"><CalendarCheck size={17} /><span>Agenda organizada</span><span className="hero-flow-card__check"><Check size={13} /></span></div>
          <div className="hero-flow-card__appointment"><time>09:00</time><div><strong>Marina Alves</strong><span>Fisioterapia</span></div></div>
          <div className="hero-flow-card__status"><span /> Atendimento confirmado</div>
        </div>
        <div className="hero-flow-hub" aria-hidden="true">
          <span className="hero-flow-hub__ring" /><span className="hero-flow-hub__ring hero-flow-hub__ring--outer" />
          <BrandLogo size={66} />
          <span className="hero-flow-hub__caption">Tudo se conecta.</span>
        </div>
        <div className="hero-flow-card hero-flow-card--record">
          <div className="hero-flow-card__heading"><FileText size={17} /><span>Cuidado contínuo</span></div>
          <div className="hero-flow-card__record"><span className="hero-flow-card__avatar">MA</span><div><strong>Marina Alves</strong><span>Histórico e evolução</span></div></div>
          <div className="hero-flow-card__timeline" aria-hidden="true"><i /><span /><i /><span /><i /></div>
          <p className="hero-flow-card__footnote">Cada atendimento, uma nova etapa.</p>
        </div>
      </div>

      <div className="landing-hero__bottom">
        <span>Demo sem login · Dados ilustrativos</span>
        <LandingSmoothLink href="#modulos" className="landing-hero__scroll">Conheça o Cliniq <ArrowDown size={15} /></LandingSmoothLink>
        {!reducedMotion && <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused}>
          {paused ? <Play size={13} /> : <Pause size={13} />}{paused ? "Reproduzir animação" : "Pausar animação"}
        </button>}
      </div>
    </section>
  );
}
