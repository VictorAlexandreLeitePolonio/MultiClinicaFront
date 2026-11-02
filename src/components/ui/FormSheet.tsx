"use client";

import { useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "./ConfirmDialog";

interface FormSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Com alterações não salvas, fechar pede confirmação. */
  dirty?: boolean;
  /** Rodapé fixo (ex.: Cancelar / Salvar). */
  footer?: ReactNode;
  size?: "md" | "lg";
  children: ReactNode;
}

/**
 * Painel lateral direito para cadastro/edição/detalhe curtos. A lista continua visível atrás.
 * Entra 240ms (ease-drawer) e sai 180ms via CSS (`.form-sheet` no globals.css).
 */
export function FormSheet({ open, onClose, title, description, dirty = false, footer, size = "md", children }: FormSheetProps) {
  const [confirming, setConfirming] = useState(false);

  const requestClose = () => (dirty ? setConfirming(true) : onClose());

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(next) => !next && requestClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className="form-sheet__overlay fixed inset-0 z-40 bg-[oklch(0.21_0.025_230/0.32)]" />
          <Dialog.Content
            className={cn(
              "form-sheet fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-[var(--color-gray-200)] bg-[var(--color-card)] text-[var(--color-secondary)] shadow-[var(--shadow-lg)] focus:outline-none",
              size === "lg" ? "sm:max-w-[640px]" : "sm:max-w-[480px]",
            )}
          >
            <header className="flex items-start justify-between gap-4 border-b border-[var(--color-gray-200)] px-6 py-5">
              <div className="min-w-0">
                <Dialog.Title className="text-lg font-semibold tracking-tight [text-wrap:balance]">{title}</Dialog.Title>
                {description ? (
                  <Dialog.Description className="mt-1 text-sm text-[var(--color-gray-600)]">{description}</Dialog.Description>
                ) : (
                  <Dialog.Description className="sr-only">{title}</Dialog.Description>
                )}
              </div>
              <button
                type="button"
                onClick={requestClose}
                aria-label="Fechar"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-[var(--color-gray-600)] transition-[background-color,transform] duration-150 hover:bg-[var(--color-gray-100)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] active:scale-[0.97]"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>
            {footer && (
              <footer className="flex items-center justify-end gap-2 border-t border-[var(--color-gray-200)] px-6 py-4">{footer}</footer>
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
