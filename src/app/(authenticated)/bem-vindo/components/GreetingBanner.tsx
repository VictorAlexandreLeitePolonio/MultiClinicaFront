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
      className="w-full bg-[#5a9c94] text-white px-8 py-6 rounded-sm border-2 border-[#4a8880] shadow-[6px_6px_0_0_#1a2a4a] relative overflow-hidden"
    >
      {/* Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
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
            className="text-sm text-white/70 capitalize tracking-wider"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {getFormattedDate()}
          </p>
          <h1 
            className="text-2xl font-bold mt-1"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {getGreeting()}, {user?.name} — seja bem-vindo ao sistema.
          </h1>
        </div>

        {/* Contador de agendamentos animado */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="text-right bg-white/10 px-6 py-3 rounded-sm border border-white/20"
        >
          <p className="text-3xl font-bold">
            <AnimatedCounter value={totalAppointments} />
          </p>
          <p 
            className="text-xs text-white/70 uppercase tracking-wider"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            agendamentos hoje
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
