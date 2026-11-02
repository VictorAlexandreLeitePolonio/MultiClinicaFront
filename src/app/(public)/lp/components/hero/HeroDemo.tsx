"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, CheckCircle2, Sparkles } from "lucide-react";
import { BorderBeam } from "@/components/magicui/border-beam";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Phase = "recording" | "transcribing" | "soap" | "charged";

const PHASE_ORDER: Phase[] = ["recording", "transcribing", "soap", "charged"];
const PHASE_DURATION: Record<Phase, number> = {
  recording: 1600,
  transcribing: 1600,
  soap: 2200,
  charged: 1600,
};

const TRANSCRIPT = [
  "Dor lombar há 3 semanas, piora ao sentar.",
  "Melhorou após as últimas sessões.",
  "Escala de dor hoje: 4 de 10.",
];

const SOAP = [
  { letter: "S", label: "Subjetivo", text: "Dor lombar, piora sentado" },
  { letter: "O", label: "Objetivo", text: "Flexão 70°, dor 4/10" },
  { letter: "A", label: "Avaliação", text: "Evolução positiva" },
  { letter: "P", label: "Plano", text: "Manter 2x/semana" },
];

const SCRAMBLE_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789#%&";

const WAVE_BARS = Array.from({ length: 24 }, (_, index) => ({
  height: 24 + ((index * 37) % 62),
  delay: `${index * 45}ms`,
}));

const subscribeHydrated = () => () => {};
const getHydrated = () => true;
const getServerHydrated = () => false;

/** Evita divergência de hidratação ao consultar preferências só no cliente. */
function useHydrated() {
  return useSyncExternalStore(subscribeHydrated, getHydrated, getServerHydrated);
}

function scramble(text: string) {
  return text
    .split("")
    .map((character) => {
      if (character === " ") {
        return " ";
      }
      return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)] ?? character;
    })
    .join("");
}

function settle(text: string, progress: number) {
  return text
    .split("")
    .map((character, index) => {
      if (character === " ") {
        return " ";
      }
      const threshold = (index / Math.max(text.length, 1)) * 0.72;
      if (progress >= threshold) {
        return character;
      }
      return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)] ?? character;
    })
    .join("");
}

function DecryptLine({ text, delay }: { text: string; delay: number }) {
  const [output, setOutput] = useState(() => scramble(text));

  useEffect(() => {
    let interval = 0;
    const timeout = window.setTimeout(() => {
      const startedAt = Date.now();
      interval = window.setInterval(() => {
        const progress = Math.min((Date.now() - startedAt) / 600, 1);
        setOutput(progress >= 1 ? text : settle(text, progress));
        if (progress >= 1) {
          window.clearInterval(interval);
        }
      }, 32);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [delay, text]);

  return (
    <p className="font-mono text-[13px] leading-6 text-[var(--lp-ink)]">
      <span aria-hidden="true">{output}</span>
      <span className="sr-only">{text}</span>
    </p>
  );
}

function RecordingView() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--lp-ink)]">
          <span className="hero-demo__rec-dot size-2 rounded-full bg-red-500" aria-hidden="true" />
          Gravando
          <span className="font-mono text-xs font-normal text-[var(--lp-muted)]">00:12</span>
        </p>
        <span className="rounded-full border border-[var(--lp-line)] px-2.5 py-1 font-mono text-[10px] text-[var(--lp-muted)]">
          áudio na clínica
        </span>
      </div>

      <div className="mt-8 flex h-28 items-center justify-between gap-[3px]" aria-hidden="true">
        {WAVE_BARS.map((bar) => (
          <span
            key={bar.delay}
            className="hero-demo__wave-bar w-[3px] flex-1 rounded-full bg-[var(--color-primary)]"
            style={{ height: `${bar.height}%`, animationDelay: bar.delay }}
          />
        ))}
      </div>

      <div className="mt-auto flex items-end justify-between gap-4 pt-8">
        <p className="max-w-[34ch] text-xs leading-5 text-[var(--lp-muted)]">
          A IA transcreve a consulta e monta o relatório SOAP para você revisar.
        </p>
      </div>
    </div>
  );
}

function TranscribingView() {
  return (
    <div className="flex h-full flex-col">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--lp-ink)]">
        <Sparkles size={15} className="text-[var(--color-primary)]" aria-hidden="true" />
        Transcrevendo consulta
      </p>

      <div className="mt-6 grid gap-3">
        {TRANSCRIPT.map((line, index) => (
          <DecryptLine key={line} text={line} delay={index * 140} />
        ))}
      </div>

      <div className="mt-auto flex items-end justify-between gap-4 pt-8">
        <p className="max-w-[34ch] text-xs leading-5 text-[var(--lp-muted)]">
          Você revisa e edita antes de salvar no prontuário.
        </p>
      </div>
    </div>
  );
}

function SoapView({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--lp-ink)]">
          <Sparkles size={15} className="text-[var(--color-primary)]" aria-hidden="true" />
          Relatório SOAP
        </p>
        <span className="font-mono text-[10px] text-[var(--lp-muted)]">gerado pela IA</span>
      </div>

      <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-[var(--lp-line)] bg-[var(--lp-line)] sm:grid-cols-2">
        {SOAP.map((item, index) => (
          <motion.div
            key={item.letter}
            initial={reduceMotion ? false : { opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.32, delay: index * 0.12, ease: ease.out }}
            className="bg-[var(--lp-surface)] p-4"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xs text-[var(--color-primary)]">{item.letter}</span>
              <span className="text-xs font-semibold text-[var(--lp-ink)]">{item.label}</span>
            </div>
            <p className="mt-2 text-[13px] leading-6 text-[var(--lp-muted)]">{item.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-auto flex items-end justify-between gap-4 pt-5">
        <p className="inline-flex items-center gap-2 text-xs text-[var(--lp-muted)]">
          <Check size={14} className="text-[var(--color-primary)]" aria-hidden="true" />
          Pronto para revisar antes de salvar
        </p>
      </div>
    </div>
  );
}

function ChargeStatus({ paid }: { paid: boolean }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={paid ? "paid" : "pending"}
        initial={{ opacity: 0, filter: "blur(2px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(2px)" }}
        transition={{ duration: 0.22, ease: ease.out }}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
          paid
            ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
            : "border-[var(--signal)]/40 bg-[var(--signal)]/10 text-[var(--signal)]",
        )}
      >
        {paid ? <Check size={13} aria-hidden="true" /> : null}
        {paid ? "Pago" : "Pendente"}
      </motion.span>
    </AnimatePresence>
  );
}

function ChargedView({ paid }: { paid: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--lp-ink)]">
        <CheckCircle2 size={16} className="text-[var(--color-primary)]" aria-hidden="true" />
        Consulta finalizada
      </p>

      <div className="mt-6 grid gap-3">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--lp-line)] px-4 py-3">
          <div>
            <p className="text-[13px] font-semibold text-[var(--lp-ink)]">Relatório SOAP</p>
            <p className="mt-0.5 font-mono text-[10px] text-[var(--lp-muted)]">salvo no prontuário</p>
          </div>
          <Check size={16} className="text-[var(--color-primary)]" aria-hidden="true" />
        </div>

        <div className="rounded-xl border border-[var(--lp-line)] px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold text-[var(--lp-ink)]">
                Cobrança <span className="font-mono">R$ 180,00</span>
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-[var(--lp-muted)]">Pix · Mercado Pago</p>
            </div>
            <ChargeStatus paid={paid} />
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-end justify-between gap-4 pt-8">
        <p className="max-w-[34ch] text-xs leading-5 text-[var(--lp-muted)]">
          O paciente recebe o link e paga por Pix ou cartão.
        </p>
      </div>
    </div>
  );
}

export function HeroDemo() {
  const prefersReducedMotion = useReducedMotion();
  const hydrated = useHydrated();
  const reduceMotion = hydrated && Boolean(prefersReducedMotion);
  const [phase, setPhase] = useState<Phase>("recording");
  const [paid, setPaid] = useState(false);

  const activePhase: Phase = reduceMotion ? "soap" : phase;

  useEffect(() => {
    if (reduceMotion) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      const index = PHASE_ORDER.indexOf(phase);
      const next = PHASE_ORDER[(index + 1) % PHASE_ORDER.length] ?? "recording";
      if (next === "charged") {
        setPaid(false);
      }
      setPhase(next);
    }, PHASE_DURATION[phase]);

    return () => window.clearTimeout(timeout);
  }, [phase, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || phase !== "charged") {
      return undefined;
    }

    const timeout = window.setTimeout(() => setPaid(true), 450);
    return () => window.clearTimeout(timeout);
  }, [phase, reduceMotion]);

  const paidNow = reduceMotion ? true : paid;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[var(--lp-line)] bg-[var(--lp-surface)] shadow-[0_32px_80px_-48px_var(--lp-bg)]"
      data-phase={activePhase}
    >
      {!reduceMotion && (
        <BorderBeam
          size={110}
          duration={14}
          borderWidth={1}
          colorFrom="var(--color-primary)"
          colorTo="var(--color-primary-light)"
        />
      )}

      <div className="relative flex items-center justify-between gap-4 border-b border-[var(--lp-line)] px-5 py-3.5">
        <p className="flex min-w-0 items-center gap-2 text-[13px] text-[var(--lp-ink)]">
          <span className="font-semibold">Consulta</span>
          <span aria-hidden="true" className="text-[var(--lp-muted)]">·</span>
          <span className="truncate">Ana Souza</span>
          <span aria-hidden="true" className="text-[var(--lp-muted)]">·</span>
          <span className="font-mono text-xs text-[var(--lp-muted)]">14:30</span>
        </p>
        <span className="hidden shrink-0 rounded-full border border-[var(--lp-line)] px-2 py-0.5 font-mono text-[10px] text-[var(--lp-muted)] sm:inline-flex">
          Fisioterapia
        </span>
      </div>

      <div className="relative grid min-h-[420px] px-5 py-6 sm:min-h-[400px] sm:px-6" aria-hidden="true">
        {reduceMotion ? (
          <div className="grid h-full content-start gap-5">
            <SoapView reduceMotion />
            <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--lp-line)] px-4 py-3">
              <p className="text-[13px] font-semibold text-[var(--lp-ink)]">
                Cobrança <span className="font-mono">R$ 180,00</span>
              </p>
              <ChargeStatus paid />
            </div>
          </div>
        ) : (
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={activePhase}
              initial={{ opacity: 0, filter: "blur(2px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(2px)" }}
              transition={{ duration: 0.25, ease: ease.inOut }}
              className="col-start-1 row-start-1 h-full"
            >
              {activePhase === "recording" && <RecordingView />}
              {activePhase === "transcribing" && <TranscribingView />}
              {activePhase === "soap" && <SoapView reduceMotion={false} />}
              {activePhase === "charged" && <ChargedView paid={paidNow} />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <span className="sr-only">
        Demonstração: consulta gravada vira relatório SOAP e cobrança paga
      </span>
    </div>
  );
}
