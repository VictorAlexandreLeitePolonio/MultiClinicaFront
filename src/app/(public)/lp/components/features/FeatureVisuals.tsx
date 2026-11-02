"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import {
  Activity,
  ArrowRight,
  Check,
  CreditCard,
  MessageCircle,
  Mic,
  ShieldCheck,
} from "lucide-react";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface FeatureVisualProps {
  active: boolean;
  reduce: boolean;
}

const WAVE_HEIGHTS = [
  10, 18, 30, 16, 24, 38, 20, 12, 28, 34, 18, 10, 22, 32, 14, 26, 36, 20, 12,
  24, 30, 16, 28, 38, 22, 14, 18, 26, 34, 20, 12, 24,
];

const SOAP = [
  { letter: "S", text: "Dor lombar há 3 semanas" },
  {
    letter: "O",
    text: (
      <>
        Flexão <span className="font-mono">70°</span> · dor <span className="font-mono">4/10</span>
      </>
    ),
  },
  { letter: "A", text: "Melhorou nas últimas sessões" },
  { letter: "P", text: "Manter 2 sessões por semana" },
];

const PAIN_PATH = "M36,24 L86,40 L135,56 L185,72 L234,88 L284,104";
const SESSION_X = [36, 86, 135, 185, 234, 284];
const PAIN_POINTS = [
  { x: 36, y: 24 },
  { x: 86, y: 40 },
  { x: 135, y: 56 },
  { x: 185, y: 72 },
  { x: 234, y: 88 },
  { x: 284, y: 104 },
];

const CHAT = [
  { from: "owner", content: "Quem eu atendo amanhã?" },
  {
    from: "copilot",
    content: (
      <>
        5 consultas. A primeira é Ana Souza, às <span className="font-mono">08:30</span>.
      </>
    ),
  },
  {
    from: "owner",
    content: (
      <>
        Manda um lembrete pra ela às <span className="font-mono">08:00</span>.
      </>
    ),
  },
] as const;

function VisualFrame({
  icon,
  title,
  meta,
  children,
}: {
  icon: ReactNode;
  title: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--lp-line)] bg-[var(--lp-surface)] shadow-[var(--shadow-lg)]">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--lp-line)] px-5 py-3.5">
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--lp-ink)]">
          {icon}
          <span>{title}</span>
        </div>
        {meta ? (
          <span className="font-mono text-[11px] text-[var(--lp-muted)]">{meta}</span>
        ) : null}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

export function ConsultaVisual({ active, reduce }: FeatureVisualProps) {
  return (
    <div role="img" aria-label="Demonstração de uma consulta gravada com onda de áudio e relatório SOAP">
      <VisualFrame
        icon={<Mic size={14} className="text-[var(--color-primary)]" aria-hidden="true" />}
        title="Consulta · Ana Souza"
        meta="14:30"
      >
        <div className="rounded-xl border border-[var(--lp-line)] bg-[var(--lp-bg)] p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 font-mono text-[11px] text-[var(--lp-muted)]">
              <span className="size-1.5 rounded-full bg-[var(--color-signal)]" aria-hidden="true" />
              Gravando 00:12
            </span>
            <span className="font-mono text-[10px] text-[var(--lp-muted)]">áudio · pt-BR</span>
          </div>
          <div className="mt-4 flex h-16 items-end gap-[3px]" aria-hidden="true">
            {WAVE_HEIGHTS.map((height, index) => (
              <span
                key={index}
                className="min-w-[2px] flex-1 rounded-full bg-[var(--color-primary)] opacity-70"
                style={{ height }}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SOAP.map((item) => (
            <div
              key={item.letter}
              className="rounded-lg border border-[var(--lp-line)] bg-[var(--lp-bg)] px-3 py-2.5"
            >
              <span className="font-mono text-[10px] font-semibold text-[var(--color-primary)]">
                {item.letter}
              </span>
              <p className="mt-1 text-xs leading-5 text-[var(--lp-ink)]">{item.text}</p>
            </div>
          ))}
        </div>

        <motion.p
          className="mt-4 flex items-center gap-2 text-[11px] text-[var(--lp-muted)]"
          initial={false}
          animate={active ? { opacity: 1 } : { opacity: 0.6 }}
          transition={reduce ? { duration: 0 } : { duration: 0.4, ease: ease.out }}
        >
          <ShieldCheck size={13} className="text-[var(--color-primary)]" aria-hidden="true" />
          Áudio apagado após transcrever
        </motion.p>
      </VisualFrame>
    </div>
  );
}

export function EvolucaoVisual({ active, reduce }: FeatureVisualProps) {
  return (
    <div role="img" aria-label="Gráfico de evolução da dor de 8 para 3 em seis sessões">
      <VisualFrame
        icon={<Activity size={14} className="text-[var(--color-primary)]" aria-hidden="true" />}
        title="Evolução · Escala de dor"
        meta="6 sessões"
      >
        <div className="rounded-xl border border-[var(--lp-line)] bg-[var(--lp-bg)] px-3 pb-3 pt-4">
          <svg viewBox="0 0 300 132" className="h-auto w-full" aria-hidden="true">
            {[24, 44, 64, 84, 104].map((y) => (
              <line
                key={y}
                x1="24"
                x2="292"
                y1={y}
                y2={y}
                stroke="var(--lp-line)"
                strokeWidth="1"
                strokeDasharray="2 6"
              />
            ))}

            <text x="0" y="28" className="font-mono" fontSize="10" fill="var(--lp-muted)">
              8
            </text>
            <text x="0" y="108" className="font-mono" fontSize="10" fill="var(--lp-muted)">
              3
            </text>

            <motion.path
              d={PAIN_PATH}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              initial={false}
              animate={{ pathLength: active ? 1 : 0.45 }}
              transition={reduce ? { duration: 0 } : { duration: 1.1, ease: ease.out }}
            />

            {PAIN_POINTS.map((point) => (
              <circle
                key={point.x}
                cx={point.x}
                cy={point.y}
                r="3"
                fill="var(--lp-surface)"
                stroke="var(--color-primary)"
                strokeWidth="2"
              />
            ))}

            {SESSION_X.map((x, index) => (
              <text
                key={x}
                x={x}
                y="124"
                textAnchor="middle"
                className="font-mono"
                fontSize="10"
                fill="var(--lp-muted)"
              >
                {index + 1}
              </text>
            ))}
          </svg>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--lp-muted)]">
          <span>Ana Souza · evolução da dor</span>
          <span className="font-mono text-[var(--lp-ink)]">8 → 3 em 6 sessões</span>
        </div>
      </VisualFrame>
    </div>
  );
}

export function WhatsappVisual({ active, reduce }: FeatureVisualProps) {
  return (
    <div role="img" aria-label="Conversa no WhatsApp com o copiloto da clínica sobre a agenda do dia seguinte">
      <VisualFrame
        icon={
          <MessageCircle size={14} className="text-[var(--color-primary)]" aria-hidden="true" />
        }
        title="WhatsApp · Copiloto"
        meta="online"
      >
        <div className="space-y-3">
          {CHAT.map((message, index) => (
            <motion.div
              key={index}
              className={cn("flex", message.from === "owner" ? "justify-end" : "justify-start")}
              initial={false}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0.6, y: 6 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 0.4, ease: ease.out, delay: index * 0.08 }
              }
            >
              <div
                className={cn(
                  "max-w-[86%] rounded-2xl border border-[var(--lp-line)] px-3.5 py-2.5 text-xs leading-5 text-[var(--lp-ink)]",
                  message.from === "owner"
                    ? "rounded-br-md bg-[var(--color-primary-muted)]"
                    : "rounded-bl-md bg-[var(--lp-bg)]",
                )}
              >
                {message.from === "copilot" ? (
                  <span className="mb-1 block font-mono text-[10px] text-[var(--lp-muted)]">
                    Copiloto
                  </span>
                ) : null}
                {message.content}
              </div>
            </motion.div>
          ))}
        </div>
      </VisualFrame>
    </div>
  );
}

export function CobrancaVisual({ active, reduce }: FeatureVisualProps) {
  return (
    <div role="img" aria-label="Cobrança de cento e oitenta reais passando de pendente para paga pelo Mercado Pago">
      <VisualFrame
        icon={<CreditCard size={14} className="text-[var(--color-primary)]" aria-hidden="true" />}
        title="Cobrança · Consulta"
        meta="Mercado Pago"
      >
        <div className="rounded-xl border border-[var(--lp-line)] bg-[var(--lp-bg)] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-[var(--lp-muted)]">Fisioterapia</p>
              <p className="mt-1 text-sm font-medium text-[var(--lp-ink)]">Ana Souza</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-lg font-semibold tracking-tight text-[var(--lp-ink)]">
                R$ 180,00
              </p>
              <p className="font-mono text-[10px] text-[var(--lp-muted)]">14:30</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--lp-line)] pt-4">
            <span className="inline-flex items-center rounded-full border border-[var(--color-signal)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-signal)]">
              Pendente
            </span>
            <ArrowRight size={14} className="text-[var(--lp-muted)]" aria-hidden="true" />
            <motion.span
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-primary)] bg-[var(--color-primary-muted)] px-2.5 py-1 text-[11px] font-medium text-[var(--lp-ink)]"
              initial={false}
              animate={active ? { opacity: 1, y: 0 } : { opacity: 0.6, y: 6 }}
              transition={
                reduce ? { duration: 0 } : { duration: 0.4, ease: ease.out, delay: 0.12 }
              }
            >
              <Check size={12} className="text-[var(--color-primary)]" aria-hidden="true" />
              Pago
            </motion.span>
            <span className="ml-auto font-mono text-[10px] text-[var(--lp-muted)]">Pix</span>
          </div>
        </div>
      </VisualFrame>
    </div>
  );
}
