import { Plus } from "lucide-react";

const questions = [
  {
    id: "what-is",
    question: "O que é o Cliniq?",
    answer:
      "É um sistema de gestão para conectar a rotina clínica e administrativa em uma experiência única.",
  },
  {
    id: "modules",
    question: "Quais módulos estão disponíveis?",
    answer:
      "A plataforma reúne agenda, pacientes, prontuários, evolução, pagamentos, balanço e permissões.",
  },
  {
    id: "free-plan",
    question: "Posso começar grátis?",
    answer:
      "Sim. O plano Free é gratuito para sempre e você assina um plano pago quando quiser.",
  },
  {
    id: "access",
    question: "Como funciona o acesso?",
    answer:
      "O acesso real é liberado por indicação ou contato direto. Você pode explorar a visão geral da demo sem login.",
  },
  {
    id: "multiple-clinics",
    question: "Posso organizar mais de uma unidade?",
    answer:
      "A estrutura foi pensada para separar clínicas, equipes e permissões com clareza, conforme a configuração da operação.",
  },
  {
    id: "security",
    question: "Como os acessos são organizados?",
    answer:
      "Cada pessoa pode ter um perfil de acesso adequado à sua função, reduzindo exposição desnecessária de informações.",
  },
  {
    id: "support",
    question: "Como funciona o suporte?",
    answer:
      "O contato inicial é próximo e orientado a entender a rotina da clínica antes da liberação do acesso.",
  },
];

export function LandingFaq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="border-t border-[var(--lp-line)] bg-[var(--lp-bg)] py-24 sm:py-28"
    >
      <div className="mx-auto grid max-w-[88rem] gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8">
        <div>
          <h2
            id="faq-title"
            className="font-wide text-balance text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] tracking-[-0.03em] text-[var(--lp-ink)]"
          >
            Perguntas que aparecem antes do primeiro passo.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-[var(--lp-muted)]">
            Uma visão direta para você entender o produto antes de pedir acesso.
          </p>
        </div>

        <div className="lp-faq border-t border-[var(--lp-line)]">
          {questions.map((item, index) => (
            <details
              key={item.id}
              name="lp-faq"
              open={index === 0}
              className="group border-b border-[var(--lp-line)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-[0.95rem] font-semibold text-[var(--lp-ink)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lp-bg)] [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <Plus
                  size={18}
                  className="shrink-0 text-[var(--color-primary)] transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </summary>
              <p className="max-w-[60ch] pb-5 pr-8 text-sm leading-7 text-[var(--lp-muted)]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
