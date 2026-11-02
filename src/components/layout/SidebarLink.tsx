"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { trackModuleClick } from "@/lib/analytics";

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  collapsed?: boolean;
}

export function SidebarLink({ href, label, icon, collapsed }: SidebarLinkProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={() => trackModuleClick(href, label)}
      title={collapsed ? label : undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-[160ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
        collapsed && "justify-center",
        isActive
          ? "text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)]"
          : "text-[var(--color-gray-600)] hover:text-[var(--color-primary-dark)] dark:hover:text-[var(--color-primary-light)]",
      )}
    >
      {isActive &&
        (reduceMotion ? (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-xl bg-[var(--color-primary-muted)]"
          />
        ) : (
          <motion.span
            aria-hidden="true"
            layoutId="sidebar-active"
            transition={spring.ui}
            className="absolute inset-0 rounded-xl bg-[var(--color-primary-muted)]"
          />
        ))}
      <span className="relative shrink-0">{icon}</span>
      {!collapsed && <span className="relative truncate">{label}</span>}
    </Link>
  );
}
