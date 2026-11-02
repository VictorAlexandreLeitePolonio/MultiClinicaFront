"use client";

import type { ComponentType } from "react";
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  CobrancaVisual,
  ConsultaVisual,
  EvolucaoVisual,
  type FeatureVisualProps,
  WhatsappVisual,
} from "./FeatureVisuals";

interface Feature {
  id: string;
  title: string;
  description: string;
  bullets: string[];
  Visual: ComponentType<FeatureVisualProps>;
}

const FEATURES: Feature[] = [
  {
    id: "consulta",
    title: "Consulta gravada com relatório SOAP",
    description:
      "Grave a consulta, a IA transcreve e entrega o relatório SOAP pronto para revisar.",
    bullets: [
      "Transcrição automática",
      "SOAP revisável antes de salvar",
      "Áudio apagado após transcrever",
    ],
    Visual: ConsultaVisual,
  },
  {
    id: "evolucao",
    title: "Prontuário com evolução que se mede",
    description:
      "Fichas de medição viram gráfico: você vê se o paciente está melhorando.",
    bullets: [
      "Fichas de medição por sessão",
      "Gráfico de evolução automático",
      "Histórico completo do paciente",
    ],
    Visual: EvolucaoVisual,
  },
  {
    id: "agenda",
    title: "Agenda e copiloto no WhatsApp",
    description: "Pergunte ao copiloto quem você atende amanhã, direto no WhatsApp.",
    bullets: [
      "Copiloto responde no WhatsApp",
      "Agenda sincronizada em tempo real",
      "Lembretes de consulta automáticos",
    ],
    Visual: WhatsappVisual,
  },
  {
    id: "cobranca",
    title: "Cobrança online",
    description:
      "Envie a cobrança e receba por Pix ou cartão pelo Mercado Pago da sua clínica.",
    bullets: [
      "Pix ou cartão pelo Mercado Pago",
      "Cobrança enviada por link",
      "Baixa automática no financeiro",
    ],
    Visual: CobrancaVisual,
  },
];

function FeatureRow({ feature, reversed }: { feature: Feature; reversed: boolean }) {
  const visualRef = useRef<HTMLDivElement>(null);
  const inView = useInView(visualRef, { once: true, margin: "-80px" });
  const reduce = useReducedMotion() === true;
  const active = inView || reduce;
  const Visual = feature.Visual;

  return (
    <article className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
      <div className={cn("max-w-xl", reversed && "lg:order-2 lg:justify-self-end")}>
        <h3 className="font-wide text-balance text-2xl leading-tight tracking-[-0.02em] text-[var(--lp-ink)] sm:text-3xl">
          {feature.title}
        </h3>
        <p className="mt-4 text-base leading-7 text-[var(--lp-muted)]">{feature.description}</p>
        <ul className="mt-6 space-y-3">
          {feature.bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex items-start gap-3 text-sm leading-6 text-[var(--lp-ink)]"
            >
              <Check
                size={16}
                className="mt-1 shrink-0 text-[var(--color-primary)]"
                aria-hidden="true"
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      <motion.div
        ref={visualRef}
        className={cn("w-full", reversed && "lg:order-1")}
        initial={false}
        animate={active ? { opacity: 1, y: 0 } : { opacity: 0.6, y: 8 }}
        transition={reduce ? { duration: 0 } : { duration: 0.5, ease: ease.out }}
      >
        <Visual active={active} reduce={reduce} />
      </motion.div>
    </article>
  );
}

export function FeaturesSection() {
  return (
    <section
      id="funcionalidades"
      aria-labelledby="funcionalidades-title"
      className="relative border-t border-[var(--lp-line)] bg-[var(--lp-bg)] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl">
          <h2
            id="funcionalidades-title"
            className="font-wide text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] tracking-[-0.03em] text-balance text-[var(--lp-ink)]"
          >
            O que a sua clínica ganha no primeiro dia
          </h2>
          <p className="mt-5 max-w-[58ch] text-base leading-7 text-[var(--lp-muted)]">
            Quatro partes do dia a dia que deixam de dar trabalho manual — e passam a acontecer
            sozinhas.
          </p>
        </div>

        <div className="mt-16 space-y-20 sm:mt-20 sm:space-y-28">
          {FEATURES.map((feature, index) => (
            <FeatureRow key={feature.id} feature={feature} reversed={index % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
