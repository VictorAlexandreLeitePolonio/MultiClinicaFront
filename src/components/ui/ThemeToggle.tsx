"use client";

import { useState } from "react";
import { Moon, Sun, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isChanging, setIsChanging] = useState(false);

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    setIsChanging(true);
    setTheme(isDark ? "light" : "dark");
    window.setTimeout(() => setIsChanging(false), 250);
  };

  return (
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
  );
}
