"use client";

import type { RefObject } from "react";
import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import {
  CalendarDays,
  CreditCard,
  FileHeart,
  MessageCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils";

interface IntegrationNodeProps {
  label: string;
  icon: LucideIcon;
  nodeRef: RefObject<HTMLDivElement | null>;
  className?: string;
}

function IntegrationNode({ label, icon: Icon, nodeRef, className }: IntegrationNodeProps) {
  return (
    <div
      className={cn(
        "relative z-10 flex w-full max-w-[220px] items-center gap-3 rounded-xl border border-[var(--lp-line)] bg-[var(--lp-surface)] px-4 py-3 shadow-[var(--shadow-md)]",
        className,
      )}
    >
      <span
        ref={nodeRef}
        className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
      >
        <Icon size={19} aria-hidden="true" />
      </span>
      <span className="text-sm font-medium text-[var(--lp-ink)]">{label}</span>
    </div>
  );
}

export function IntegrationSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const whatsappRef = useRef<HTMLDivElement>(null);
  const agendaRef = useRef<HTMLDivElement>(null);
  const prontuarioRef = useRef<HTMLDivElement>(null);
  const pagamentoRef = useRef<HTMLDivElement>(null);
  const copilotoRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() === true;

  const nodes = [
    { label: "WhatsApp", icon: MessageCircle, ref: whatsappRef },
    { label: "Agenda", icon: CalendarDays, ref: agendaRef },
    { label: "Prontuário", icon: FileHeart, ref: prontuarioRef },
    { label: "Mercado Pago", icon: CreditCard, ref: pagamentoRef },
    { label: "Copiloto IA", icon: Sparkles, ref: copilotoRef },
  ];

  return (
    <section
      id="integracoes"
      aria-labelledby="integracoes-title"
      className="relative overflow-hidden border-t border-[var(--lp-line)] bg-[var(--lp-bg)] py-24 sm:py-32"
    >
      <DotPattern
        width={28}
        height={28}
        cr={1}
        className="text-[var(--lp-line)] opacity-70"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="integracoes-title"
            className="font-wide text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] tracking-[-0.03em] text-balance text-[var(--lp-ink)]"
          >
            Tudo conversa com tudo
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-base leading-7 text-[var(--lp-muted)]">
            WhatsApp, agenda, prontuário, pagamentos e copiloto operando sobre a mesma base — sem
            retrabalho e sem planilha no meio.
          </p>
        </div>

        <div
          ref={containerRef}
          className="relative mx-auto mt-16 grid max-w-3xl grid-cols-1 justify-items-center gap-10 md:mt-20 md:grid-cols-[1fr_auto_1fr] md:grid-rows-[auto_auto_auto] md:gap-x-16 md:gap-y-12"
        >
          {nodes.map((node, index) => (
            <AnimatedBeam
              key={node.label}
              containerRef={containerRef}
              fromRef={centerRef}
              toRef={node.ref}
              pathColor="var(--lp-line)"
              pathWidth={1.5}
              pathOpacity={0.9}
              gradientStartColor="var(--color-primary)"
              gradientStopColor="var(--color-primary-light)"
              duration={reduce ? 100000 : 4.5}
              delay={reduce ? 0 : 0.3 * index}
              repeat={reduce ? 0 : Infinity}
            />
          ))}

          <div className="relative z-10 order-1 flex justify-center md:col-start-2 md:row-span-2 md:row-start-1 md:self-center">
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-primary)] bg-[var(--lp-surface)] px-5 py-4 shadow-[var(--shadow-teal-md)]">
              <span
                ref={centerRef}
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--lp-bg)]"
              >
                <BrandLogo variant="mark" size={34} className="rounded-lg" />
              </span>
              <span>
                <span className="font-wide block text-base leading-tight text-[var(--lp-ink)]">
                  Cliniq Care
                </span>
                <span className="font-mono text-[10px] text-[var(--lp-muted)]">base única</span>
              </span>
            </div>
          </div>

          <div className="order-2 flex w-full flex-col items-center gap-10 md:col-start-1 md:row-span-2 md:row-start-1 md:justify-center md:gap-14">
            <IntegrationNode
              label="WhatsApp"
              icon={MessageCircle}
              nodeRef={whatsappRef}
            />
            <IntegrationNode label="Agenda" icon={CalendarDays} nodeRef={agendaRef} />
          </div>

          <div className="order-3 flex w-full flex-col items-center gap-10 md:col-start-3 md:row-span-2 md:row-start-1 md:justify-center md:gap-14">
            <IntegrationNode
              label="Prontuário"
              icon={FileHeart}
              nodeRef={prontuarioRef}
            />
            <IntegrationNode
              label="Mercado Pago"
              icon={CreditCard}
              nodeRef={pagamentoRef}
            />
          </div>

          <div className="order-4 flex justify-center md:col-start-2 md:row-start-3">
            <IntegrationNode label="Copiloto IA" icon={Sparkles} nodeRef={copilotoRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
