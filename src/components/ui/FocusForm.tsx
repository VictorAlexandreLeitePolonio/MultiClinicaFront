"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, X } from "lucide-react";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "./ConfirmDialog";

export interface FocusFormStep {
  id: string;
  label: string;
  title: string;
  description?: string;
}

interface FocusFormProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Descrição acessível do formulário; o conteúdo de cada etapa tem seu próprio texto. */
  description?: string;
  steps: FocusFormStep[];
  step: number;
  onStepChange: (step: number) => void;
  dirty?: boolean;
  /** Rodapé fixo. A função recebe o fechamento protegido por confirmação de alterações. */
  footer?: ReactNode | ((requestClose: () => void) => ReactNode);
  children: ReactNode;
}

/** Tela em foco com etapas: uma decisão por vez, sem sidebar e sem formulário longo. */
export function FocusForm({
  open,
  onClose,
  title,
  description,
  steps,
  step,
  onStepChange,
  dirty = false,
  footer,
  children,
}: FocusFormProps) {
  const [confirming, setConfirming] = useState(false);
  const reduceMotion = useReducedMotion() === true;
  const scrollRef = useRef<HTMLDivElement>(null);
  const current = steps[step] ?? steps[0];

  const requestClose = () => (dirty ? setConfirming(true) : onClose());

  useEffect(() => {
    scrollRef.current?.scrollTo?.({ top: 0, behavior: "auto" });
  }, [step]);

  if (!current) return null;

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(next) => !next && requestClose()}>
        <Dialog.Portal>
          <Dialog.Content className="focus-form fixed inset-0 z-50 flex flex-col bg-[var(--color-bg-warm)] text-[var(--color-secondary)] focus:outline-none">
            <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-[var(--color-gray-200)] bg-[var(--color-card)] px-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={requestClose}
                  aria-label="Fechar"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-[var(--color-gray-600)] transition-[background-color,transform] duration-150 hover:bg-[var(--color-gray-100)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] active:scale-[0.97] motion-reduce:active:scale-100"
                >
                  <X size={18} aria-hidden="true" />
                </button>
                <Dialog.Title className="truncate text-base font-semibold">{title}</Dialog.Title>
                <Dialog.Description className="sr-only">
                  {description ?? title}
                </Dialog.Description>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-[var(--color-gray-600)]">
                Etapa {step + 1} de {steps.length}
              </span>
            </header>

            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-2xl px-5 pb-10 pt-6 sm:px-6 sm:pt-8">
                <ol aria-label="Etapas do formulário" className="flex items-center gap-2">
                  {steps.map((item, index) => {
                    const isActive = index === step;
                    const isComplete = index < step;

                    return (
                      <li
                        key={item.id}
                        className={cn(
                          "flex min-w-0 items-center gap-2",
                          index < steps.length - 1 && "flex-1",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => isComplete && onStepChange(index)}
                          disabled={!isComplete}
                          aria-current={isActive ? "step" : undefined}
                          aria-label={`Etapa ${index + 1}: ${item.label}`}
                          className={cn(
                            "flex min-w-0 items-center gap-2 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-warm)]",
                            isComplete && "cursor-pointer",
                            isActive && "cursor-default",
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors duration-150",
                              isActive && "border-[var(--color-primary-dark)] bg-[var(--color-primary-dark)] text-white",
                              isComplete && "border-[var(--color-primary)] bg-[var(--color-primary-muted)] text-[var(--color-primary-dark)]",
                              !isActive && !isComplete && "border-[var(--color-gray-200)] bg-[var(--color-card)] text-[var(--color-gray-600)]",
                            )}
                          >
                            {isComplete ? <Check size={14} aria-hidden="true" /> : index + 1}
                          </span>
                          <span
                            className={cn(
                              "hidden truncate text-sm font-semibold transition-colors duration-150 sm:block",
                              isActive && "text-[var(--color-secondary)]",
                              isComplete && "text-[var(--color-primary-dark)]",
                              !isActive && !isComplete && "text-[var(--color-gray-600)]",
                            )}
                          >
                            {item.label}
                          </span>
                        </button>
                        {index < steps.length - 1 && (
                          <span
                            aria-hidden="true"
                            className={cn(
                              "h-px min-w-3 flex-1 transition-colors duration-150",
                              isComplete
                                ? "bg-[var(--color-primary)]"
                                : "bg-[var(--color-gray-200)]",
                            )}
                          />
                        )}
                      </li>
                    );
                  })}
                </ol>

                <div className="mt-8">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={current.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                      transition={{ duration: reduceMotion ? 0 : 0.18, ease: ease.out }}
                    >
                      <h2 className="text-xl font-semibold tracking-tight">{current.title}</h2>
                      {current.description && (
                        <p className="mt-1.5 text-sm text-[var(--color-gray-600)]">
                          {current.description}
                        </p>
                      )}
                      <div className="mt-6">{children}</div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {footer && (
              <footer className="shrink-0 border-t border-[var(--color-gray-200)] bg-[var(--color-card)]">
                <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-5 py-4 sm:px-6">
                  {typeof footer === "function" ? footer(requestClose) : footer}
                </div>
              </footer>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={confirming}
        title="Descartar alterações?"
        description="Você tem alterações que ainda não foram salvas."
        confirmLabel="Descartar"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          onClose();
        }}
      />
    </>
  );
}
