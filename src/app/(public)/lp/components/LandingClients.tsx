"use client";

import { useRef, useState } from "react";
import { useScroll, useMotionValueEvent, useReducedMotion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { ModuleWorkspace } from "./LandingProductPreview";
import { type LandingModuleId } from "./landingModules";

const moments = [
  { id: "agenda", label: "Atender", time: "09:00", text: "Um dia organizado começa antes da primeira consulta." },
  { id: "prontuarios", label: "Registrar", time: "09:42", text: "O atendimento vira história. Cada registro, no lugar certo." },
  { id: "evolucao", label: "Acompanhar", time: "14:00", text: "O cuidado continua, com os próximos passos à vista." },
  { id: "financeiro", label: "Organizar", time: "18:00", text: "Ao fechar o dia, uma visão clara de toda a operação." },
] satisfies { id: LandingModuleId; label: string; time: string; text: string }[];

export function LandingClients() {
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start 100px", "end end"] });
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [keyboardInput, setKeyboardInput] = useState(false);
  const moment = moments[active];

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (reducedMotion || !window.matchMedia("(min-width: 1024px)").matches) return;
    setKeyboardInput(false);
    setActive(Math.min(moments.length - 1, Math.floor(Math.max(0, progress) * moments.length)));
  });

  return (
    <section ref={section} id="como-funciona" data-mascot-anchor="rotina" className="landing-day landing-day--scroll" data-keyboard={keyboardInput}>
      <div className="landing-day__layout">
        <div className="landing-day__intro">
          <h2>Um dia na clínica.<br /><span>Tudo conectado.</span></h2>
          <p>Da recepção ao fechamento do mês, cada parte da rotina encontra seu lugar.</p>
          <div className="landing-day__steps" aria-label="Momentos da rotina">
            {moments.map((item, index) => (
              <button key={item.id} type="button" aria-pressed={active === index} data-active={active === index}
                onClick={(event) => { setActive(index); setKeyboardInput(event.detail === 0); }}>
                <span className="landing-day__node" aria-hidden="true">{index + 1}</span>
                <span>{item.label}</span><time>{item.time}</time>
              </button>
            ))}
          </div>
          <p className="landing-day__scroll-note"><ArrowDown size={14} /> Role para acompanhar ou escolha uma etapa.</p>
        </div>
        <div className="landing-day__scene">
          <div className="landing-day__orbit" aria-hidden="true" />
          <div className="landing-day__window">
            <div className="landing-day__window-bar"><span>Cliniq / {moment.label}</span><span>Dados ilustrativos</span></div>
            <div key={moment.id} className="landing-day__content">
              <div className="landing-day__caption"><time>{moment.time}</time><h3>{moment.text}</h3></div>
              <ModuleWorkspace moduleId={moment.id} />
            </div>
            <div className="landing-day__track" aria-hidden="true">{moments.map((item, index) => <span key={item.id} data-active={index <= active} />)}</div>
          </div>
          <p className="landing-day__note">Uma operação. Mais tempo para cuidar.</p>
        </div>
      </div>
    </section>
  );
}
