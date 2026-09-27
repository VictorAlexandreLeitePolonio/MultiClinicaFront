"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, Clock3, MapPin, Search } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

const steps = [
  { id: "discover", title: "Encontre sua clínica", description: "Consulte os perfis públicos e conheça as especialidades." },
  { id: "request", title: "Solicite uma consulta", description: "Envie a solicitação pelo portal e aguarde a avaliação da clínica." },
  { id: "follow", title: "Acompanhe os próximos passos", description: "Veja o status das solicitações, as próximas consultas e seu histórico." },
] as const;

export function LandingPatientExperience() {
  const [active, setActive] = useState<(typeof steps)[number]["id"]>("discover");
  const [keyboardInput, setKeyboardInput] = useState(false);
  return (
    <section id="portal-paciente" className="landing-patient" data-keyboard={keyboardInput}>
      <div className="landing-patient__layout">
        <div className="landing-patient__copy">
          <h2>Uma clínica conectada.<br /><span>Um paciente mais próximo.</span></h2>
          <p>O cuidado também passa pela experiência fora do consultório. Seu paciente encontra a clínica e acompanha suas consultas em um só lugar.</p>
          <div className="landing-patient__steps" aria-label="Explore o portal do paciente">
            {steps.map((step) => <button key={step.id} type="button" aria-pressed={active === step.id} data-active={active === step.id}
              onClick={(event) => { setActive(step.id); setKeyboardInput(event.detail === 0); }}>
              <span><strong>{step.title}</strong><span>{step.description}</span></span><ArrowRight size={18} />
            </button>)}
          </div>
          <Link href="/paciente/login" className="landing-patient__link">Acessar o portal do paciente <ArrowRight size={16} /></Link>
        </div>
        <div className="landing-patient__visual">
          <div className="landing-patient__phone" aria-label="Prévia ilustrativa do portal">
            <div className="landing-patient__phone-top" aria-hidden="true"><span>9:41</span><span /></div>
            <div className="landing-patient__phone-brand"><BrandLogo size={26} /><span>Portal do paciente</span></div>
            <div key={active} className="landing-patient__screen">
              {active === "discover" && <>
                <h3>Seu próximo cuidado<br />começa aqui.</h3>
                <div className="landing-patient__search"><Search size={14} /> Buscar clínica ou especialidade</div>
                <div className="landing-patient__clinic"><span className="landing-patient__clinic-icon"><MapPin size={28} /></span><h4>Clínica Horizonte</h4><p>Fisioterapia · Pilates</p><span className="landing-patient__demo-action">Conhecer a clínica <ArrowRight size={13} /></span></div>
                <p className="landing-patient__screen-note">Encontre informações e formas de atendimento.</p>
              </>}
              {active === "request" && <>
                <h3>Um novo passo<br />para se cuidar.</h3>
                <div className="landing-patient__calendar"><CalendarDays size={24} /><strong>Solicitação enviada</strong><p>Avaliação de fisioterapia</p></div>
                <div className="landing-patient__notice"><Clock3 size={17} /><span>Aguardando a clínica<br /><small>A confirmação aparece no portal.</small></span></div>
                <p className="landing-patient__screen-note">Enviar uma solicitação não confirma o agendamento.</p>
              </>}
              {active === "follow" && <>
                <h3>Tudo pronto para<br />a próxima consulta.</h3>
                <div className="landing-patient__calendar"><CalendarDays size={24} /><strong>Consulta confirmada</strong><p>18 de junho · 09:00</p><p>Clínica Horizonte</p></div>
                <div className="landing-patient__notice"><Check size={17} /><span>Solicitação aprovada<br /><small>Veja os detalhes em Minhas consultas.</small></span></div>
                <p className="landing-patient__screen-note">Próximas consultas e histórico sempre à mão.</p>
              </>}
            </div>
            <div className="landing-patient__phone-bottom" aria-hidden="true" />
          </div>
          <p className="landing-patient__disclaimer">Demonstração com clínica e dados fictícios.</p>
        </div>
      </div>
    </section>
  );
}
