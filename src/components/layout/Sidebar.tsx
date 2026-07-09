"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/services/auth/auth.service";
import { useRouter } from "next/navigation";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarLink } from "./SidebarLink";
import { getRoleLabel } from "@/lib/auth/routes";
import {
  Home,
  Users,
  Calendar,
  FileText,
  Activity,
  CreditCard,
  ClipboardList,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Building2,
  Wallet,
} from "lucide-react";

const baseModules = [
  { href: "/app", label: "Início", icon: <Home size={18} />, roles: ["Administrador", "Profissional", "Recepcao"] },
  { href: "/app/pacientes", label: "Pacientes", icon: <Users size={18} />, roles: ["Administrador", "Profissional", "Recepcao"] },
  { href: "/app/agenda", label: "Agenda", icon: <Calendar size={18} />, roles: ["Administrador", "Profissional", "Recepcao"] },
  { href: "/app/prontuarios", label: "Prontuários", icon: <FileText size={18} />, roles: ["Administrador", "Profissional"] },
  { href: "/app/modelos-evolucao", label: "Modelos Evolução", icon: <Activity size={18} />, roles: ["Administrador", "Profissional", "Recepcao"] },
];

const adminModules = [
  { href: "/app/pagamentos", label: "Pagamentos", icon: <CreditCard size={18} />, roles: ["Administrador", "Recepcao"] },
  { href: "/app/financeiro", label: "Balanço (legado)", icon: <BarChart2 size={18} />, roles: ["Administrador"] },
  { href: "/app/usuarios", label: "Usuários", icon: <Shield size={18} />, roles: ["Administrador"] },
  { href: "/app/planos", label: "Planos", icon: <ClipboardList size={18} />, roles: ["Administrador"] },
];

const financeGroup = {
  label: "Financeiro",
  icon: <Wallet size={18} />,
  items: [
    {
      href: "/app/financeiro/configuracoes",
      label: "Configurações",
      permission: "financeiro.formas_pagamento.visualizar",
    },
    {
      href: "/app/financeiro/contas-a-receber",
      label: "Contas a Receber",
      permission: "financeiro.contas_receber.visualizar",
    },
  ],
};

const superAdminModules = [
  { href: "/superadmin", label: "Dashboard", icon: <Home size={18} /> },
  { href: "/superadmin/clinicas", label: "Clínicas", icon: <Building2 size={18} /> },
  { href: "/superadmin/cobrancas", label: "Cobranças", icon: <CreditCard size={18} /> },
  { href: "/superadmin/historico", label: "Histórico", icon: <ClipboardList size={18} /> },
];

interface SidebarProps {
  area: "clinic" | "superadmin";
}

export function Sidebar({ area }: SidebarProps) {
  const { user, setUser, can } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const clinicModules = [...baseModules, ...adminModules].filter((module) =>
    user ? module.roles.includes(user.role) : false
  );
  const modules = area === "superadmin" ? superAdminModules : clinicModules;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setUser(null);
      router.replace("/login");
      setIsLoggingOut(false);
    }
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="sticky top-0 flex h-screen flex-col overflow-hidden border-r border-[#d7f3ea] bg-white/95 px-3 py-6 shadow-[10px_0_40px_-34px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95"
    >
      {/* Logo + botão colapsar */}
      <div className={`flex items-center mb-2 px-1 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#a7f3d0] bg-gradient-to-br from-[#14b8a6] to-[#10b981] text-white shadow-[0_18px_34px_-24px_rgba(20,184,166,0.85)]">
              <Building2 size={28} />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-[#0f172a] dark:text-white">
                MultiClinica
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#14b8a6]">
                {area === "superadmin" ? "Painel Global" : user?.clinicName ?? "App Clínica"}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`rounded-xl border border-transparent p-1.5 text-[#64748b] transition-colors hover:border-[#d7f3ea] hover:bg-[#ecfdf5] hover:text-[#0f766e] dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white ${collapsed ? "" : "ml-auto"}`}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Separador */}
      <div className="mx-2 my-3 h-px bg-[#d7f3ea] dark:bg-slate-800" />

      {/* Módulos */}
      <nav className="flex flex-col gap-1 flex-1">
        {modules.map((mod) => (
          <SidebarLink key={mod.href} {...mod} collapsed={collapsed} />
        ))}
        {area === "clinic" && (
          <SidebarGroup
            label={financeGroup.label}
            icon={financeGroup.icon}
            items={financeGroup.items}
            can={can}
            collapsed={collapsed}
          />
        )}
      </nav>

      {/* Divisor */}
      <div className="mx-2 my-4 h-px bg-[#d7f3ea] dark:bg-slate-800" />

      {!collapsed && user && (
        <div className="mb-3 rounded-2xl border border-[#d7f3ea] bg-[#f8fffc] px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="truncate text-xs font-semibold text-[#0f172a] dark:text-white">{user.name}</p>
          <p className="truncate text-[11px] text-[#64748b] dark:text-slate-300">{getRoleLabel(user.role)}</p>
        </div>
      )}

      {/* Sair */}
      <motion.button
        whileHover={{ x: collapsed ? 0 : 2 }}
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold
          text-[#64748b] transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600 disabled:cursor-wait disabled:opacity-60 dark:text-slate-300 dark:hover:border-red-900/60 dark:hover:bg-red-950/30 dark:hover:text-red-300
          ${collapsed ? "justify-center" : ""}`}
        title={collapsed ? "Sair" : undefined}
      >
        <LogOut size={18} />
        {!collapsed && <span>Sair</span>}
      </motion.button>
    </motion.aside>
  );
}
