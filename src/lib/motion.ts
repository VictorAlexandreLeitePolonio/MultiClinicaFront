import { Variants } from "motion/react";

// Curvas e springs do sistema (ver docs/superpowers/plans/2026-11-02-redesign-tech.md).
export const ease = { out: [0.23, 1, 0.32, 1], inOut: [0.77, 0, 0.175, 1], drawer: [0.32, 0.72, 0, 1] } as const;
export const spring = {
  ui: { type: "spring", duration: 0.35, bounce: 0 },
  soft: { type: "spring", duration: 0.6, bounce: 0.15 },
} as const;
export const easeCss = { out: "cubic-bezier(0.23, 1, 0.32, 1)", inOut: "cubic-bezier(0.77, 0, 0.175, 1)" } as const;

// Container com stagger para animações sequenciais
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

// Container mais lento para tabelas
export const staggerContainerSlow: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
}

// Fade + slide up — entrada suave de baixo
export const fadeSlideUp: Variants = {
  hidden: { y: 16, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring" as const, stiffness: 100, damping: 20 } 
  },
}

// Fade in simples
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1, 
    transition: { duration: 0.5 } 
  },
}

// Slide da esquerda — para títulos de página
export const slideFromLeft: Variants = {
  hidden: { x: -40, opacity: 0 },
  show: { 
    x: 0, 
    opacity: 1, 
    transition: { type: "spring" as const, stiffness: 100, damping: 20 } 
  },
}

// Scale + fade — para modais
export const scaleIn: Variants = {
  hidden: { scale: 0.92, opacity: 0 },
  show: { 
    scale: 1, 
    opacity: 1, 
    transition: { type: "spring" as const, stiffness: 300, damping: 25 } 
  },
  exit: { 
    scale: 0.96, 
    opacity: 0,
    transition: { duration: 0.15 } 
  },
}

// Slide down — para dropdowns
export const slideDown: Variants = {
  hidden: { y: -8, opacity: 0, scale: 0.98 },
  show: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 30 } 
  },
  exit: { 
    y: -6, 
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.12 } 
  },
}

// Hover lift — para cards interativos
export const hoverLift = {
  y: -3,
  boxShadow: "4px 6px 0 0 rgba(26, 42, 74, 0.15)",
  transition: { type: "spring" as const, stiffness: 400, damping: 25 }
}

// Hover shift — para itens de lista
export const hoverShift = {
  x: 2,
  transition: { type: "spring" as const, stiffness: 400, damping: 25 }
}

// Pulse — para ícones de foco
export const pulse = {
  scale: 1.15,
  transition: { type: "spring" as const, stiffness: 400, damping: 15 }
}
