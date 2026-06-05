"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Sun, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isChanging, setIsChanging] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleToggle = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setIsChanging(true);
    setTheme(isDark ? "light" : "dark");
    timeoutRef.current = window.setTimeout(() => {
      setIsChanging(false);
      timeoutRef.current = null;
    }, 650);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isChanging}
        aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
        title={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-sm border-2 border-[#d8d2c8] bg-white text-[#1a2a4a] shadow-[2px_2px_0_0_#d8d2c8] transition-colors hover:bg-[#e8f4f3] disabled:cursor-wait disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:shadow-[2px_2px_0_0_#334155] dark:hover:bg-slate-800"
      >
        {isChanging ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isDark ? (
          <Sun size={16} />
        ) : (
          <Moon size={16} />
        )}
      </button>

      {isChanging && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/85 px-4 backdrop-blur-sm dark:bg-slate-950/85"
        >
          <div className="flex w-full max-w-xs flex-col items-center rounded-sm border-2 border-[#5a9c94] bg-white p-6 text-center text-[#1a2a4a] shadow-[6px_6px_0_0_rgba(26,42,74,0.25)] dark:border-[#7bbfb8] dark:bg-slate-900 dark:text-white dark:shadow-[6px_6px_0_0_rgba(123,191,184,0.2)]">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#5a9c94] dark:text-[#7bbfb8]" aria-hidden="true" />
            <p className="text-sm font-bold uppercase tracking-wide">
              Alterando tema
            </p>
            <p className="mt-2 text-sm text-[#4a6354] dark:text-white">
              Aplicando contraste e cores da interface.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
