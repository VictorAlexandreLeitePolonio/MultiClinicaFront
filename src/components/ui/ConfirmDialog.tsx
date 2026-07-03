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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Content className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:border-slate-700 dark:bg-slate-900">
            <Dialog.Title className="text-lg font-bold text-secondary dark:text-slate-50">
              {title}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-600 dark:text-slate-300">
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
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
