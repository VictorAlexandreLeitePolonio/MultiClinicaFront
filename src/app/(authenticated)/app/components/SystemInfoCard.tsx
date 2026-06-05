"use client";

import { motion } from "motion/react";
import { fadeSlideUp } from "@/lib/motion";
import { CheckCircle, Stethoscope, ClipboardList, Users, Shield } from "lucide-react";

const features = [
  { icon: <Users size={16} />, text: "Gerenciamento completo de pacientes e prontuários" },
  { icon: <ClipboardList size={16} />, text: "Agenda integrada com controle de sessões" },
  { icon: <Stethoscope size={16} />, text: "Acompanhamento de tratamentos e evolução" },
  { icon: <CheckCircle size={16} />, text: "Controle financeiro e relatórios" },
  { icon: <Shield size={16} />, text: "Acesso seguro com níveis de permissão" },
];

export function SystemInfoCard() {
  return (
    <motion.div
      variants={fadeSlideUp}
      className="rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#14b8a6] to-[#06b6d4] shadow-[0_16px_34px_-24px_rgba(20,184,166,0.9)]"
        >
              <span className="text-white font-bold text-sm">MC</span>
        </div>
        <div>
          <h3 
            className="text-lg font-bold text-[#0f172a] dark:text-white"
          >
            MultiClinica
          </h3>
          <p className="text-xs font-medium text-[#0f766e] dark:text-[#67e8f9]">Sistema de Gestão</p>
        </div>
      </div>
      
      <p 
        className="mb-5 text-sm leading-relaxed text-[#64748b] dark:text-slate-300"
      >
        Sistema completo para gestão de clínicas de fisioterapia. 
        Organize sua rotina, acompanhe seus pacientes e gerencie 
        toda a operação em um só lugar.
      </p>
      
      <div className="my-4 h-px bg-[#d7f3ea] dark:bg-slate-800" />
      
      <ul className="space-y-3">
        {features.map((feature) => (
          <li key={feature.text} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border border-[#a7f3d0] bg-[#ecfdf5]">
              <span className="text-[#0f766e]">{feature.icon}</span>
            </div>
            <span 
              className="text-sm text-[#0f172a] dark:text-white"
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
