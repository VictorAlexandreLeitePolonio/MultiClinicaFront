"use client";

import { useCallback, useId, useMemo, useSyncExternalStore } from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface ViewOption<T extends string> {
  value: T;
  label: string;
  icon: LucideIcon;
  /** false = escondida abaixo de 768px (ex.: quadro, dia por profissional). */
  mobile?: boolean;
}

interface ViewSwitcherProps<T extends string> {
  options: ViewOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Controle segmentado de visualização. Troca instantânea; só o indicador desliza. */
export function ViewSwitcher<T extends string>({ options, value, onChange }: ViewSwitcherProps<T>) {
  const layoutId = useId();
  return (
    <div role="radiogroup" aria-label="Visualização" className="inline-flex rounded-xl border border-[var(--color-gray-200)] bg-[var(--color-card)] p-1">
      {options.map((option) => {
        const selected = option.value === value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
              option.mobile === false && "hidden md:inline-flex",
              selected ? "text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)]" : "text-[var(--color-gray-600)] hover:text-[var(--color-secondary)]",
            )}
          >
            {selected && (
              <motion.span layoutId={layoutId} transition={spring.ui} className="absolute inset-0 rounded-lg bg-[var(--color-primary-muted)]" />
            )}
            <Icon size={14} aria-hidden="true" className="relative" />
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const PREF_EVENT = "cliniq:view-pref";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(PREF_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(PREF_EVENT, callback);
  };
}

/** Visualização escolhida por tela, lembrada em localStorage (falha silenciosa sem storage). */
export function useViewPreference<T extends string>(key: string, fallback: T, allowed: readonly T[]) {
  const storageKey = `cliniq:view:${key}`;
  const read = () => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      return stored && (allowed as readonly string[]).includes(stored) ? (stored as T) : fallback;
    } catch {
      return fallback;
    }
  };
  const value = useSyncExternalStore(subscribe, read, () => fallback);
  const setValue = useCallback(
    (next: T) => {
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        // sem storage: vale só nesta sessão de render
      }
      window.dispatchEvent(new Event(PREF_EVENT));
    },
    [storageKey],
  );
  return [value, setValue] as const;
}

function subscribeMedia(query: string) {
  return (callback: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", callback);
    return () => media.removeEventListener("change", callback);
  };
}

/** true quando a media query casa (false no servidor). */
export function useMediaQuery(query: string) {
  const subscribe = useMemo(() => subscribeMedia(query), [query]);
  return useSyncExternalStore(
    subscribe,
    () => (typeof window.matchMedia === "function" ? window.matchMedia(query).matches : false),
    () => false,
  );
}
