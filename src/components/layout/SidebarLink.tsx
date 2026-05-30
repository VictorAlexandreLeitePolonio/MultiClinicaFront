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
          className="absolute left-0 top-0 bottom-0 w-1 bg-[#5a9c94] rounded-full"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all
          ${collapsed ? "justify-center" : ""}
          ${isActive
            ? "bg-[#5a9c94] text-white border-2 border-[#4a8880] shadow-[2px_2px_0_0_#4a8880]"
            : "text-white/70 hover:bg-white/10 hover:text-white border-2 border-transparent"
          }`}
        style={{ fontFamily: "var(--font-serif)" }}
      >
        <span className={isActive ? "opacity-100" : "opacity-70"}>{icon}</span>
        {!collapsed && <span>{label}</span>}
      </Link>
    </motion.div>
  );
}
