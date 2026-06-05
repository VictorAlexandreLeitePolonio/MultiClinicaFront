"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, useMotionValue, useTransform, animate, useInView } from "motion/react";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

const getFormattedDate = () =>
  new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

interface GreetingBannerProps {
  totalAppointments: number;
}

// Componente de contador animado
function AnimatedCounter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, {
        duration: 1.2,
        ease: "easeOut",
      });
      return controls.stop;
    }
  }, [isInView, value, count]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export function GreetingBanner({ totalAppointments }: GreetingBannerProps) {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80 }}
      className="relative w-full overflow-hidden rounded-3xl border border-[#99f6e4] bg-gradient-to-br from-[#0f766e] via-[#14b8a6] to-[#06b6d4] px-8 py-6 text-white shadow-[0_30px_90px_-48px_rgba(20,184,166,0.85)]"
    >
      {/* Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 20px
          )`
        }}
      />
      
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p 
            className="text-sm capitalize tracking-wide text-white/75"
          >
            {getFormattedDate()}
          </p>
          <h1 
            className="mt-1 text-2xl font-bold tracking-tight"
          >
            {getGreeting()}, {user?.name} — seja bem-vindo ao sistema.
          </h1>
        </div>

        {/* Contador de agendamentos animado */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="rounded-2xl border border-white/25 bg-white/15 px-6 py-3 text-right backdrop-blur-sm"
        >
          <p className="text-3xl font-bold">
            <AnimatedCounter value={totalAppointments} />
          </p>
          <p 
            className="text-xs uppercase tracking-wide text-white/75"
          >
            agendamentos hoje
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
