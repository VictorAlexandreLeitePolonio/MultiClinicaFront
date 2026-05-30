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
              className="bg-white rounded-sm border-2 border-[#1a2a4a] shadow-[8px_8px_0_0_#1a2a4a] p-6 max-w-md w-full"
            >
              <h2 
                className="text-xl font-bold text-[#1a2a4a] mb-2"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Excluir {entityLabel}
              </h2>
              <p 
                className="text-[#4a6354] mb-6"
                style={{ fontFamily: "var(--font-serif)" }}
              >
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
