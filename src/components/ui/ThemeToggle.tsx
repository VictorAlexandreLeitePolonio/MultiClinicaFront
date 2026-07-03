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
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-secondary shadow-sm transition-colors hover:bg-primary-muted disabled:cursor-wait disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
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
          <div className="flex w-full max-w-xs flex-col items-center rounded-xl border border-primary-dark bg-white p-6 text-center text-secondary shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:border-primary-light dark:bg-slate-900 dark:text-white">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary-dark dark:text-primary-light" aria-hidden="true" />
            <p className="text-sm font-bold uppercase tracking-wide">
              Alterando tema
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-white">
              Aplicando contraste e cores da interface.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
