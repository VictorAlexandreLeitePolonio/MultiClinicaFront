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
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const buttonBaseStyles = "w-full text-left px-3 py-2 text-xs font-medium rounded-sm transition-colors flex items-center gap-2";
  
  const variantStyles = {
    default: "text-[#1a2a4a] hover:bg-[#f0f4f2]",
    danger: "text-red-600 hover:bg-red-50",
    success: "text-green-600 hover:bg-green-50",
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
          className="bg-white border-2 border-[#e2ebe6] rounded-sm shadow-lg overflow-hidden"
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
                style={{ fontFamily: "var(--font-serif)" }}
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
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider
          bg-white text-[#5a9c94] border-2 border-[#5a9c94] rounded-sm
          shadow-[3px_3px_0_0_#5a9c94] hover:bg-[#e8f4f3] transition-all"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        <MoreVertical size={14} />
        {label}
      </motion.button>

      {mounted && createPortal(dropdownContent, document.body)}
    </>
  );
}
