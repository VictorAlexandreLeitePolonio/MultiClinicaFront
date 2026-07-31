"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

export interface SidebarGroupChild {
  href: string;
  label: string;
  permission: string;
}

interface SidebarGroupProps {
  label: string;
  icon: React.ReactNode;
  items: SidebarGroupChild[];
  can: (permission: string) => boolean;
  collapsed?: boolean;
}

export function SidebarGroup({ label, icon, items, can, collapsed }: SidebarGroupProps) {
  const pathname = usePathname();
  const visibleChildren = items.filter((child) => can(child.permission));
  const hasActiveChild = visibleChildren.some((child) => pathname === child.href);
  const [open, setOpen] = useState(hasActiveChild);

  if (visibleChildren.length === 0) return null;

  return (
    <div>
      <motion.button
        type="button"
        whileHover={{ x: collapsed ? 0 : 2 }}
        transition={{ type: "spring", stiffness: 300 }}
        onClick={() => setOpen((current) => !current)}
        title={collapsed ? label : undefined}
        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all
          ${collapsed ? "justify-center" : ""}
          ${
            hasActiveChild
              ? "border-[#a7f3d0] bg-[#ecfdf5] text-[#0f766e] shadow-[0_12px_26px_-22px_rgba(20,184,166,0.9)] dark:border-[#0f766e] dark:bg-slate-900 dark:text-[#67e8f9]"
              : "border-transparent text-[#64748b] hover:border-[#d7f3ea] hover:bg-[#f8fffc] hover:text-[#0f766e] dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
          }`}
      >
        <span className={hasActiveChild ? "opacity-100" : "opacity-75"}>{icon}</span>
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{label}</span>
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 300 }}>
              <ChevronDown size={14} />
            </motion.span>
          </>
        )}
      </motion.button>

      {!collapsed && open && (
        <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-[#d7f3ea] pl-3 dark:border-slate-800">
          {visibleChildren.map((child) => {
            const isActive = pathname === child.href;

            return (
              <Link
                key={child.href}
                href={child.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#ecfdf5] text-[#0f766e] dark:bg-slate-900 dark:text-[#67e8f9]"
                    : "text-[#64748b] hover:bg-[#f8fffc] hover:text-[#0f766e] dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                }`}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
