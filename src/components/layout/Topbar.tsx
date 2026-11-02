"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { RecordingIndicator } from "@/components/consultation/RecordingIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleLabel } from "@/lib/auth/routes";

interface TopbarProps {
  area: "clinic" | "superadmin";
}

function formatBreadcrumbSegment(segment: string): string {
  if (segment === "financeiro") return "Balanço";

  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function Topbar({ area }: TopbarProps) {
  const pathname = usePathname();
  const { user, tenant } = useAuth();
  const segments = pathname.split("/").filter(Boolean);
  const areaLabel =
    area === "superadmin"
      ? "SuperAdmin"
      : tenant?.displayName?.trim() || "Cliniq";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-[var(--color-gray-200)] bg-[var(--color-card)] px-6">
      <div className="min-w-0">
        <nav className="flex items-center gap-1 truncate text-xs font-semibold text-[var(--color-gray-600)]">
          <span className="truncate">{areaLabel}</span>
          {segments.slice(1).map((segment) => (
            <span key={segment} className="flex items-center gap-1">
              <span className="text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)]">
                /
              </span>
              <span className="truncate">
                {formatBreadcrumbSegment(segment)}
              </span>
            </span>
          ))}
        </nav>
        {user && (
          <p className="mt-0.5 truncate text-sm font-medium text-[var(--color-secondary)]">
            {user.name} · {getRoleLabel(user.role)}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <RecordingIndicator />
        {area === "clinic" && (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("cliniq:command"))}
            aria-label="Abrir busca (⌘K)"
            aria-keyshortcuts="Control+K Meta+K"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-[var(--color-gray-200)] bg-[var(--color-card)] px-2.5 text-xs font-medium text-[var(--color-gray-600)] transition-[transform,color,background-color] duration-[160ms] hover:bg-[var(--color-primary-muted)] hover:text-[var(--color-primary-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] active:scale-[0.97] motion-reduce:active:scale-100"
          >
            <Search size={15} aria-hidden="true" />
            <span className="hidden sm:inline">Buscar</span>
            <kbd className="rounded-md border border-[var(--color-gray-200)] bg-[var(--color-gray-50)] px-1.5 py-0.5 font-mono text-[10px] leading-none">
              ⌘K
            </kbd>
          </button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
