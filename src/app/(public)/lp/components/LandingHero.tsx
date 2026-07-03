"use client";

import { motion } from "motion/react";
import { ArrowRight, CalendarDays, CreditCard, FileText, Users } from "lucide-react";
import { fadeSlideUp, slideFromLeft, staggerContainer } from "@/lib/motion";

const highlights = [
  { label: "Agenda clínica", icon: CalendarDays },
  { label: "Pacientes", icon: Users },
  { label: "Prontuários", icon: FileText },
  { label: "Financeiro", icon: CreditCard },
];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-background bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.24),transparent_34%),linear-gradient(180deg,var(--color-bg-warm)_0%,var(--color-gray-50)_100%)]">
      <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[1fr_0.9fr]">
        <motion.div
          className="max-w-3xl"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.p
            variants={fadeSlideUp}
            className="mb-4 inline-flex rounded-full border border-primary/30 bg-card px-4 py-2 text-sm font-semibold text-primary-dark shadow-sm"
          >
            Um projeto novo, feito sob medida
          </motion.p>
          <motion.h1
            variants={fadeSlideUp}
            className="text-4xl font-bold tracking-tight text-secondary sm:text-5xl lg:text-6xl"
          >
            MultiClinica
          </motion.h1>
          <motion.p variants={fadeSlideUp} className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            Estou construindo o MultiClinica: um SaaS de gestão para clínicas —
            agenda, pacientes, prontuários e financeiro numa experiência só.
            Por enquanto, o acesso é feito por indicação ou liberação direta,
            enquanto a base de clientes cresce com cuidado.
          </motion.p>

          <motion.div variants={fadeSlideUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#contato"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_42px_-28px_rgba(20,184,166,0.95)] transition-colors hover:bg-primary-dark"
            >
              Pedir acesso
              <ArrowRight size={16} />
            </a>
            <a
              href="#modulos"
              className="inline-flex items-center justify-center rounded-xl border border-primary/30 bg-card px-5 py-3 text-sm font-semibold text-primary-dark shadow-sm transition-colors hover:bg-sidebar-active"
            >
              Ver módulos
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          variants={slideFromLeft}
          initial="hidden"
          animate="show"
          className="rounded-3xl border border-gray-200 bg-card/90 p-5 shadow-[0_32px_90px_-48px_rgba(15,23,42,0.45)] backdrop-blur-xl"
        >
          <div className="rounded-2xl bg-gradient-to-br from-[#0f766e] via-[#14b8a6] to-[#06b6d4] p-6 text-white">
            <p className="text-sm font-medium text-white/75">Painel operacional</p>
            <strong className="mt-2 block text-3xl">Visão completa da clínica</strong>
          </div>
          <div id="modulos" className="mt-5 grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-gray-200 bg-background p-4">
                  <Icon className="text-primary" size={22} />
                  <p className="mt-3 text-sm font-semibold text-secondary">{item.label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
