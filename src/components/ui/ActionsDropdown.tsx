"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MoreVertical } from "lucide-react";
import { createPortal } from "react-dom";
import { hoverShift } from "@/lib/motion";

interface ActionItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger" | "success";
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface ActionsDropdownProps {
  actions: ActionItem[];
  label?: string;
}

interface Position {
  top: number;
  left: number;
  width: number;
}

export function ActionsDropdown({ actions, label = "Ações" }: ActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0, width: 140 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calcula a posição do dropdown baseada no botão
  useLayoutEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 140;
      
      // Verifica se há espaço suficiente à direita
      const rightSpace = window.innerWidth - rect.right;
      const left = rightSpace < dropdownWidth 
        ? rect.left - dropdownWidth + rect.width  // Abre para a esquerda se não houver espaço
        : rect.left;  // Abre alinhado com o botão

      setPosition({
        top: rect.bottom + 4,
        left: Math.max(8, left), // Garante que não saia da tela pela esquerda
        width: dropdownWidth,
      });
    }
  }, [isOpen]);

  // Fecha o dropdown quando clica fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    // Fecha ao pressionar Escape
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Fecha o dropdown ao rolar a página
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isOpen]);

  const handleAction = (action: ActionItem) => {
    if (!action.disabled) {
      action.onClick();
      setIsOpen(false);
    }
  };

  const buttonBaseStyles = "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors";
  
  const variantStyles = {
    default: "text-[#0f172a] hover:bg-[#ecfdf5] dark:text-white dark:hover:bg-slate-800",
    danger: "text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40",
    success: "text-emerald-600 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40",
  };

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            width: position.width,
            zIndex: 9999,
          }}
          className="overflow-hidden rounded-xl border border-[#d7f3ea] bg-white shadow-[0_20px_60px_-28px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="py-1">
            {actions.map((action, index) => (
              <motion.button
                key={index}
                onClick={() => handleAction(action)}
                disabled={action.disabled}
                whileHover={action.disabled ? {} : hoverShift}
                className={`${buttonBaseStyles} ${variantStyles[action.variant || "default"]} 
                  ${action.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {action.icon && <span>{action.icon}</span>}
                {action.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ x: -1, y: -1 }}
        whileTap={{ x: 2, y: 2 }}
        className="flex items-center gap-1 rounded-xl border border-[#99f6e4] bg-white px-3 py-1.5 text-xs font-semibold text-[#0f766e] shadow-sm transition-all hover:border-[#14b8a6] hover:bg-[#ecfdf5] dark:border-slate-700 dark:bg-slate-900 dark:text-[#67e8f9] dark:hover:bg-slate-800"
      >
        <MoreVertical size={14} />
        {label}
      </motion.button>

      {isOpen && typeof document !== "undefined" && createPortal(dropdownContent, document.body)}
    </>
  );
}
