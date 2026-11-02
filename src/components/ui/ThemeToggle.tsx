"use client";

import { useRef } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { easeCss } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function toggleThemeWithTransition(
  next: string,
  setTheme: (theme: string) => void,
  origin?: { x: number; y: number },
) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    setTheme(next);
    return;
  }

  const reduce =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!document.startViewTransition || reduce) {
    setTheme(next);
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const transition = document.startViewTransition(() => {
    flushSync(() => setTheme(next));
  });

  transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${radius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 420,
        easing: easeCss.out,
        pseudoElement: "::view-transition-new(root)",
      },
    );
  });
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Ativar tema claro" : "Ativar tema escuro";

  const handleToggle = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    const origin = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : undefined;

    toggleThemeWithTransition(isDark ? "light" : "dark", setTheme, origin);
  };

  const iconStyle = {
    transitionProperty: "transform, opacity, filter",
    transitionDuration: "200ms",
    transitionTimingFunction: easeCss.out,
  } as const;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleToggle}
      aria-label={label}
      title={label}
      style={{ transitionTimingFunction: easeCss.out }}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-gray-200)] bg-[var(--color-card)] text-[var(--color-secondary)] transition-[transform,background-color,box-shadow] duration-[160ms] hover:bg-[var(--color-primary-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
    >
      <span className="relative h-4 w-4" aria-hidden="true">
        <Sun
          size={16}
          data-theme-toggle-icon="sun"
          className={cn(
            "absolute inset-0",
            isDark
              ? "rotate-0 scale-100 opacity-100 blur-0"
              : "rotate-90 scale-90 opacity-0 blur-[2px]",
          )}
          style={iconStyle}
        />
        <Moon
          size={16}
          data-theme-toggle-icon="moon"
          className={cn(
            "absolute inset-0",
            isDark
              ? "rotate-90 scale-90 opacity-0 blur-[2px]"
              : "rotate-0 scale-100 opacity-100 blur-0",
          )}
          style={iconStyle}
        />
      </span>
    </button>
  );
}
