"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./Button";

interface MotivoDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (motivo: string) => void;
}

export function MotivoDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  loading,
  onCancel,
  onConfirm,
}: MotivoDialogProps) {
  const [motivo, setMotivo] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setMotivo("");
      onCancel();
    }
  };

  const handleConfirm = () => {
    onConfirm(motivo.trim());
    setMotivo("");
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900">
          <Dialog.Title className="text-lg font-bold text-[#0f172a] dark:text-white">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-[#64748b] dark:text-slate-300">
            {description}
          </Dialog.Description>

          <div className="mt-4 flex flex-col gap-2">
            <label htmlFor="motivo-dialog-input" className="text-sm font-semibold text-[#0f172a] dark:text-white">
              Motivo
            </label>
            <textarea
              id="motivo-dialog-input"
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              rows={3}
              className="w-full rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-[#0f172a] transition-all focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="mt-6 flex gap-3">
            <Dialog.Close asChild>
              <Button type="button" variant="outline" disabled={loading}>
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              type="button"
              variant="danger"
              loading={loading}
              disabled={motivo.trim().length === 0}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
