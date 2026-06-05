"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleLabel } from "@/lib/auth/routes";

interface TopbarProps {
  area: "clinic" | "superadmin";
}

function formatBreadcrumbSegment(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function Topbar({ area }: TopbarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const segments = pathname.split("/").filter(Boolean);
  const areaLabel = area === "superadmin" ? "SuperAdmin" : user?.clinicName ?? "App";

  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-[#d7f3ea] bg-white/85 px-6 py-3 shadow-[0_10px_34px_-32px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
      <div className="min-w-0">
        <nav className="flex flex-wrap items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#64748b] dark:text-slate-400">
          <span>{areaLabel}</span>
          {segments.slice(1).map((segment) => (
            <span key={segment} className="flex items-center gap-1">
              <span className="text-[#14b8a6]">/</span>
              <span>{formatBreadcrumbSegment(segment)}</span>
            </span>
          ))}
        </nav>
        {user && (
          <p className="mt-1 truncate text-sm font-medium text-[#0f172a] dark:text-white">
            {user.name} · {getRoleLabel(user.role)}
          </p>
        )}
      </div>
      <ThemeToggle />
    </header>
  );
}
