"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  collapsed?: boolean;
}

export function SidebarLink({ href, label, icon, collapsed }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <motion.div 
      whileHover={{ x: collapsed ? 0 : 2 }} 
      transition={{ type: "spring", stiffness: 300 }}
      className="relative"
    >
      {/* Indicador animado de item ativo */}
      {isActive && (
        <motion.div
          layoutId="active-indicator"
          className="absolute bottom-2 left-0 top-2 w-1 rounded-full bg-[#14b8a6]"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all
          ${collapsed ? "justify-center" : ""}
          ${isActive
            ? "border-[#a7f3d0] bg-[#ecfdf5] text-[#0f766e] shadow-[0_12px_26px_-22px_rgba(20,184,166,0.9)] dark:border-[#0f766e] dark:bg-slate-900 dark:text-[#67e8f9]"
            : "border-transparent text-[#64748b] hover:border-[#d7f3ea] hover:bg-[#f8fffc] hover:text-[#0f766e] dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
          }`}
      >
        <span className={isActive ? "opacity-100" : "opacity-75"}>{icon}</span>
        {!collapsed && <span>{label}</span>}
      </Link>
    </motion.div>
  );
}
