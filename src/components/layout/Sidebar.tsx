"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/services/auth/auth.service";
import { useRouter } from "next/navigation";
import { SidebarLink } from "./SidebarLink";
import { getRoleLabel } from "@/lib/auth/routes";
import {
  Home,
  Users,
  Calendar,
  FileText,
  CreditCard,
  ClipboardList,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Building2,
} from "lucide-react";

const baseModules = [
  { href: "/app", label: "Início", icon: <Home size={18} />, roles: ["Administrador", "Profissional", "Recepcao"] },
  { href: "/app/pacientes", label: "Pacientes", icon: <Users size={18} />, roles: ["Administrador", "Profissional", "Recepcao"] },
  { href: "/app/agenda", label: "Agenda", icon: <Calendar size={18} />, roles: ["Administrador", "Profissional", "Recepcao"] },
  { href: "/app/prontuarios", label: "Prontuários", icon: <FileText size={18} />, roles: ["Administrador", "Profissional"] },
];

const adminModules = [
  { href: "/app/pagamentos", label: "Pagamentos", icon: <CreditCard size={18} />, roles: ["Administrador", "Recepcao"] },
  { href: "/app/financeiro", label: "Financeiro", icon: <BarChart2 size={18} />, roles: ["Administrador"] },
  { href: "/app/usuarios", label: "Usuários", icon: <Shield size={18} />, roles: ["Administrador"] },
  { href: "/app/planos", label: "Planos", icon: <ClipboardList size={18} />, roles: ["Administrador"] },
];

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
  const { user, setUser } = useAuth();
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
      className="flex flex-col h-screen sticky top-0 bg-[#1e2d4a] border-r-2 border-[#121d33] px-3 py-6 overflow-hidden"
    >
      {/* Logo + botão colapsar */}
      <div className={`flex items-center mb-2 px-1 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="flex h-14 w-14 items-center justify-center rounded-sm border-2 border-[#5a9c94] bg-white text-[#1e2d4a] shadow-[0_0_0_3px_rgba(90,156,148,0.2)]">
              <Building2 size={28} />
            </div>
            <div className="text-center">
              <p className="text-white text-xs font-bold tracking-widest uppercase" style={{ fontFamily: "var(--font-serif)" }}>
                MultiClinica
              </p>
              <p className="text-[#5a9c94] text-[10px] tracking-widest uppercase">
                {area === "superadmin" ? "Painel Global" : user?.clinicName ?? "App Clínica"}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/20 ${collapsed ? "" : "ml-auto"}`}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Separador */}
      <div className="h-px bg-white/10 my-3 mx-2" />

      {/* Módulos */}
      <nav className="flex flex-col gap-1 flex-1">
        {modules.map((mod) => (
          <SidebarLink key={mod.href} {...mod} collapsed={collapsed} />
        ))}
      </nav>

      {/* Divisor */}
      <div className="h-px bg-white/10 my-4 mx-2" />

      {!collapsed && user && (
        <div className="mb-3 rounded-sm border border-white/10 bg-white/5 px-3 py-2">
          <p className="truncate text-xs font-semibold text-white">{user.name}</p>
          <p className="truncate text-[11px] text-white/50">{getRoleLabel(user.role)}</p>
        </div>
      )}

      {/* Sair */}
      <motion.button
        whileHover={{ x: collapsed ? 0 : 2 }}
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-semibold uppercase tracking-wider
          text-white/60 hover:text-red-400 hover:bg-white/5 transition-colors border-2 border-transparent hover:border-red-400/30 disabled:cursor-wait disabled:opacity-60
          ${collapsed ? "justify-center" : ""}`}
        style={{ fontFamily: "var(--font-serif)" }}
        title={collapsed ? "Sair" : undefined}
      >
        <LogOut size={18} />
        {!collapsed && <span>Sair</span>}
      </motion.button>
    </motion.aside>
  );
}
