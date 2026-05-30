"use client";

import { motion, AnimatePresence } from "motion/react";
import { scaleIn } from "@/lib/motion";
import { Button } from "./Button";

interface StatusToggleModalProps {
  open: boolean;
  entityLabel?: string;
  name: string;
  isActive: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function StatusToggleModal({
  open,
  entityLabel = "item",
  name,
  isActive,
  loading,
  onClose,
  onConfirm,
}: StatusToggleModalProps) {
  const action = isActive ? "inativar" : "ativar";

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
                {isActive ? "Inativar" : "Ativar"} {entityLabel}
              </h2>
              <p 
                className="text-[#4a6354] mb-6"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Tem certeza que deseja <strong>{action}</strong> o {entityLabel.toLowerCase()}{" "}
                <strong>{name}</strong>?
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button
                  variant={isActive ? "danger" : "primary"}
                  onClick={onConfirm}
                  disabled={loading}
                >
                  {loading ? "Aguarde..." : isActive ? "Inativar" : "Ativar"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
