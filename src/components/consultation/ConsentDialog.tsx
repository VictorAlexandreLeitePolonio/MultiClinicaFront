"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/Button";

interface ConsentDialogProps {
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConsentDialog({
  open,
  loading = false,
  onCancel,
  onConfirm,
}: ConsentDialogProps) {
  const [confirmed, setConfirmed] = useState(false);

  function handleCancel() {
    setConfirmed(false);
    onCancel();
  }

  function handleConfirm() {
    setConfirmed(false);
    onConfirm();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && !loading && handleCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Content
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:border-slate-700 dark:bg-slate-900"
            onEscapeKeyDown={(event) => loading && event.preventDefault()}
          >
            <Dialog.Title className="text-lg font-bold text-secondary dark:text-slate-50">
              Iniciar consulta
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-600 dark:text-slate-300">
              Confirme o consentimento antes de gravar o áudio da consulta.
            </Dialog.Description>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <input
                type="checkbox"
                checked={confirmed}
                disabled={loading}
                onChange={(event) => setConfirmed(event.target.checked)}
                className="mt-1 h-4 w-4 accent-[#14b8a6]"
              />
              <span className="text-sm font-medium text-secondary dark:text-white">
                O paciente autorizou a gravação desta consulta
              </span>
            </label>

            <div className="mt-6 flex gap-3">
              <Button type="button" variant="outline" disabled={loading} onClick={handleCancel}>
                Cancelar
              </Button>
              <Button
                type="button"
                loading={loading}
                disabled={!confirmed}
                onClick={handleConfirm}
              >
                Confirmar
              </Button>
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
