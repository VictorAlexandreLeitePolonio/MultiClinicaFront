"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const questions = [
  {
    id: "what-is",
    question: "O que é o Cliniq?",
    answer: "É um sistema de gestão para conectar a rotina clínica e administrativa em uma experiência única.",
  },
  {
    id: "modules",
    question: "Quais módulos estão disponíveis?",
    answer: "A plataforma reúne agenda, pacientes, prontuários, evolução, pagamentos, balanço, estoque e permissões.",
  },
  {
    id: "access",
    question: "Como funciona o acesso?",
    answer: "O acesso real é liberado por indicação ou contato direto. Você pode explorar a visão geral da demo sem login.",
  },
  {
    id: "multiple-clinics",
    question: "Posso organizar mais de uma unidade?",
    answer: "A estrutura foi pensada para separar clínicas, equipes e permissões com clareza, conforme a configuração da operação.",
  },
  {
    id: "security",
    question: "Como os acessos são organizados?",
    answer: "Cada pessoa pode ter um perfil de acesso adequado à sua função, reduzindo exposição desnecessária de informações.",
  },
  {
    id: "support",
    question: "Como funciona o suporte?",
    answer: "O contato inicial é próximo e orientado a entender a rotina da clínica antes da liberação do acesso.",
  },
];

export function LandingFaq() {
  const [openId, setOpenId] = useState<string | null>(questions[0]?.id ?? null);

  return (
    <section id="faq" data-mascot-anchor="faq" data-landing-reveal className="landing-faq py-24 sm:py-32">
      <div className="landing-faq__grid mx-auto grid max-w-[88rem] gap-12 px-6 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24 lg:px-8">
        <div>
          <h2 className="text-4xl font-bold leading-tight tracking-[-0.045em] text-slate-950 sm:text-5xl">
            Perguntas que aparecem antes do primeiro passo.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
            Uma visão direta para você entender o produto antes de pedir acesso.
          </p>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {questions.map((item) => {
            const isOpen = openId === item.id;
            const answerId = `faq-answer-${item.id}`;

            return (
              <div key={item.id} className="landing-faq__item" data-open={isOpen}>
                <button
                  type="button"
                  className="landing-faq__question"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                >
                  <span>{item.question}</span>
                  <ChevronDown size={18} aria-hidden="true" />
                </button>
                <div id={answerId} className="landing-faq__answer" hidden={!isOpen}>
                  <p>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
