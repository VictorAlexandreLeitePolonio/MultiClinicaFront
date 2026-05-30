"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  loading,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-[#1a2a4a] bg-white p-6 shadow-[6px_6px_0_0_rgba(26,42,74,0.25)] dark:border-slate-700 dark:bg-slate-900">
        <Dialog.Title className="text-lg font-bold text-[#1a2a4a] dark:text-slate-50">
          {title}
        </Dialog.Title>
        <Dialog.Description className="mt-2 text-sm text-[#4a6354] dark:text-slate-300">
          {description}
        </Dialog.Description>
        <div className="mt-6 flex gap-3">
          <Dialog.Close asChild>
            <Button type="button" variant="outline" disabled={loading}>
              Cancelar
            </Button>
          </Dialog.Close>
          <Button type="button" variant="danger" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
