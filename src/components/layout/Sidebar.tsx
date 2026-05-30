"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/app/(public)/login/hooks/logout";
import { useRouter } from "next/navigation";
import { SidebarLink } from "./SidebarLink";
import logo from "@/../public/logoLaiza.png";
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
  MessageSquare,
} from "lucide-react";
import Image from "next/image";

const baseModules = [
  { href: "/bem-vindo", label: "Início", icon: <Home size={18} /> },
  { href: "/pacientes", label: "Pacientes", icon: <Users size={18} /> },
  { href: "/agenda", label: "Agenda", icon: <Calendar size={18} /> },
  { href: "/prontuarios", label: "Prontuários", icon: <FileText size={18} /> },
];

const adminModules = [
  { href: "/pagamentos", label: "Pagamentos", icon: <CreditCard size={18} /> },
  { href: "/financeiro", label: "Financeiro", icon: <BarChart2 size={18} /> },
  { href: "/whatsapp-logs", label: "WhatsApp Logs", icon: <MessageSquare size={18} /> },
  { href: "/usuarios", label: "Usuários", icon: <Shield size={18} /> },
  { href: "/planos", label: "Planos", icon: <ClipboardList size={18} /> },
];

export function Sidebar() {
  const { user, setUser } = useAuth();
  const { logoutUser } = useLogout();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const modules = user?.role === "Admin"
    ? [...baseModules, ...adminModules]
    : baseModules;

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    router.replace("/login");
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
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-2 border-[#5a9c94] shadow-[0_0_0_3px_rgba(90,156,148,0.2)]">
              <Image src={logo} alt="Logo" width={56} height={56} className="object-contain" />
            </div>
            <div className="text-center">
              <p className="text-white text-xs font-bold tracking-widest uppercase" style={{ fontFamily: "var(--font-serif)" }}>
                Dra. Laiza Polonio
              </p>
              <p className="text-[#5a9c94] text-[10px] tracking-widest uppercase">
                Fisioterapeuta
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

      {/* Sair */}
      <motion.button
        whileHover={{ x: collapsed ? 0 : 2 }}
        onClick={handleLogout}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-semibold uppercase tracking-wider
          text-white/60 hover:text-red-400 hover:bg-white/5 transition-colors border-2 border-transparent hover:border-red-400/30
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
