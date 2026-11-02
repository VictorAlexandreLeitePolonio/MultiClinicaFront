"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "./ConfirmDialog";

export interface FocusFormSection {
  id: string;
  label: string;
}

interface FocusFormProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Seções navegáveis; cada uma deve ser renderizada com <FocusFormSectionBlock id=...>. */
  sections: FocusFormSection[];
  /** Ações da barra superior (ex.: botão Salvar com form="..."). */
  actions?: ReactNode;
  dirty?: boolean;
  children: ReactNode;
}

/** Formulário longo em tela cheia, sem sidebar, com navegação de seções e scrollspy. */
export function FocusForm({ open, onClose, title, sections, actions, dirty = false, children }: FocusFormProps) {
  const [confirming, setConfirming] = useState(false);
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const scrollRef = useRef<HTMLDivElement>(null);

  const requestClose = () => (dirty ? setConfirming(true) : onClose());

  useEffect(() => {
    const root = scrollRef.current;
    if (!open || !root || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { root, rootMargin: "0px 0px -60% 0px" },
    );
    root.querySelectorAll("[data-focus-section]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [open, sections]);

  const goTo = (id: string) => {
    const el = scrollRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setActive(id);
  };

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
                  className="inline-flex size-9 items-center justify-center rounded-xl text-[var(--color-gray-600)] transition-[background-color,transform] duration-150 hover:bg-[var(--color-gray-100)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] active:scale-[0.97]"
                >
                  <X size={18} aria-hidden="true" />
                </button>
                <Dialog.Title className="truncate text-base font-semibold">{title}</Dialog.Title>
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              </div>
              {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
            </header>
            <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 gap-10 px-4 sm:px-6">
              <nav aria-label="Seções do formulário" className="hidden w-48 shrink-0 pt-10 md:block">
                <ul className="sticky top-10 space-y-1">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <button
                        type="button"
                        onClick={() => goTo(section.id)}
                        aria-current={active === section.id ? "true" : undefined}
                        className={cn(
                          "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150",
                          active === section.id
                            ? "bg-[var(--color-primary-muted)] font-semibold text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)]"
                            : "text-[var(--color-gray-600)] hover:text-[var(--color-secondary)]",
                        )}
                      >
                        {section.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
              <div ref={scrollRef} className="min-w-0 flex-1 overflow-y-auto py-10">
                <div className="mx-auto max-w-[720px] space-y-12 pb-24">{children}</div>
              </div>
            </div>
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

export function FocusFormSectionBlock({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} data-focus-section className="scroll-mt-6">
      <h2 className="mb-5 text-lg font-semibold tracking-tight">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
