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
      className="bg-white rounded-sm border-2 border-[#1a2a4a] p-6 shadow-[4px_4px_0_0_#1a2a4a]"
    >
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-10 h-10 rounded-sm flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #1a4a3a 0%, #143d2f 100%)",
            border: "2px solid #1a2a4a",
          }}
        >
          <span className="text-white font-bold text-sm">LP</span>
        </div>
        <div>
          <h3 
            className="text-lg font-bold text-[#1a2a4a]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            ProjetoLP
          </h3>
          <p className="text-xs text-[#1a4a3a]">Sistema de Gestão</p>
        </div>
      </div>
      
      <p 
        className="text-sm text-[#4a6354] mb-5 leading-relaxed"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Sistema completo para gestão de clínicas de fisioterapia. 
        Organize sua rotina, acompanhe seus pacientes e gerencie 
        toda a operação em um só lugar.
      </p>
      
      <div className="h-px bg-[#e2ebe6] my-4" />
      
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-sm bg-[#f0f4f2] border border-[#e2ebe6] flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[#1a4a3a]">{feature.icon}</span>
            </div>
            <span 
              className="text-sm text-[#1a2a4a]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
