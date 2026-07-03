"use client";

import { motion, AnimatePresence } from "motion/react";
import { scaleIn } from "@/lib/motion";
import { Button } from "./Button";

interface DeleteConfirmDialogProps {
  open: boolean;
  entityLabel?: string;
  name: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  open,
  entityLabel = "item",
  name,
  loading,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="show"
              exit="exit"
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:border-slate-700 dark:bg-slate-900"
            >
              <h2 className="text-xl font-bold text-secondary dark:text-slate-50 mb-2">
                Excluir {entityLabel}
              </h2>
              <p className="text-gray-600 dark:text-slate-300 mb-6">
                Tem certeza que deseja excluir <strong>{name}</strong>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button variant="danger" onClick={onConfirm} disabled={loading}>
                  {loading ? "Excluindo..." : "Excluir"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
