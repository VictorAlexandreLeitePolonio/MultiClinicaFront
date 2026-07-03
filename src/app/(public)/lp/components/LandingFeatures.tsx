"use client";

import { motion } from "motion/react";
import { Activity, CalendarDays, CreditCard, FileText, ShieldCheck, Users } from "lucide-react";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

const features = [
  {
    icon: CalendarDays,
    title: "Agenda clínica",
    description: "Marcação de consultas por profissional, com status e histórico completo.",
  },
  {
    icon: Users,
    title: "Pacientes",
    description: "Cadastro completo, perfil 360° com consultas, prontuários e pagamentos.",
  },
  {
    icon: FileText,
    title: "Prontuários",
    description: "Registro clínico estruturado, anexos e modelos de evolução reutilizáveis.",
  },
  {
    icon: CreditCard,
    title: "Financeiro",
    description: "Pagamentos por plano, controle de gastos e saldo mensal em um só lugar.",
  },
  {
    icon: Activity,
    title: "Evolução do paciente",
    description: "Acompanhamento de tratamento e progresso ao longo do tempo.",
  },
  {
    icon: ShieldCheck,
    title: "Acesso controlado",
    description: "Times e permissões por clínica, sem exposição de dados entre unidades.",
  },
];

export function LandingFeatures() {
  return (
    <section id="beneficios" className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-dark">Features</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
            Tudo que uma clínica precisa, num só sistema
          </h2>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={fadeSlideUp}
                className="rounded-2xl border border-gray-200 bg-card p-6 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sidebar-active text-primary-dark">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 text-base font-bold text-secondary">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
