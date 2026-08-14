import { Activity, CalendarDays, FileText, WalletCards } from "lucide-react";
import { ScrollStack, ScrollStackItem } from "./ScrollStack";

const routineCards: ScrollStackItem[] = [
  {
    id: "1",
    title: "Abertura do dia",
    label: "Agenda e atendimentos",
    description: "Comece sabendo quem chega, com qual profissional e o que precisa de atenção.",
    icon: CalendarDays,
  },
  {
    id: "2",
    title: "Durante o atendimento",
    label: "Paciente e prontuário",
    description: "Tenha o contexto do paciente à mão para registrar o que realmente importa.",
    icon: FileText,
  },
  {
    id: "3",
    title: "Acompanhamento",
    label: "Evolução do paciente",
    description: "Conecte cada evolução ao percurso do tratamento e enxergue o progresso com mais clareza.",
    icon: Activity,
  },
  {
    id: "4",
    title: "Fechamento",
    label: "Pagamentos e balanço",
    description: "Veja o movimento da clínica e organize os próximos passos sem juntar informações de lugares diferentes.",
    icon: WalletCards,
  },
  {
    id: "5",
    title: "Próximo passo",
    label: "Gestão e crescimento",
    description: "Com a rotina organizada, a equipe ganha tempo para cuidar melhor da clínica.",
    icon: Activity,
  },
];

export function LandingTestimonials() {
  return (
    <section id="como-funciona" data-mascot-anchor="rotina" data-landing-reveal className="landing-routine border-y border-slate-200 bg-white py-24 sm:py-32">
      <div className="landing-routine__grid mx-auto grid max-w-[88rem] gap-12 px-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:px-8">
        <div className="landing-routine__intro lg:sticky lg:top-32 lg:h-fit">
          <h2 className="text-4xl font-bold leading-tight tracking-[-0.045em] text-slate-950 sm:text-5xl">
            O sistema acompanha a rotina, não o contrário.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
            Uma sequência de pequenas decisões fica mais simples quando a equipe
            encontra tudo no mesmo lugar.
          </p>
          <div className="landing-routine__note mt-8">
            <span className="landing-routine__note-dot" />
            Uma visão por etapa, do primeiro atendimento ao próximo passo.
          </div>
        </div>
        <ScrollStack items={routineCards} />
      </div>
    </section>
  );
}
