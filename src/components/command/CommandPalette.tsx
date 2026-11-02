"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { CalendarPlus, MoonStar, Search, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  adminModules,
  baseModules,
  settingsModule,
} from "@/components/layout/Sidebar";
import { toggleThemeWithTransition } from "@/components/ui/ThemeToggle";

const kbdClass =
  "rounded-md border border-[var(--color-gray-200)] bg-[var(--color-gray-50)] px-1.5 py-0.5 font-mono text-[10px] leading-none text-[var(--color-gray-600)]";

const itemClass =
  "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-[var(--color-secondary)] outline-none data-[selected=true]:bg-[var(--color-primary-muted)] data-[selected=true]:text-[var(--color-primary-dark)] dark:data-[selected=true]:text-[var(--color-primary-light)]";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, can } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.repeat) return;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    const openPalette = () => setOpen(true);

    window.addEventListener("cliniq:command", openPalette);
    return () => window.removeEventListener("cliniq:command", openPalette);
  }, []);

  const navigationModules = user
    ? [...baseModules, ...adminModules].filter((module) =>
        module.roles.includes(user.role),
      )
    : [];

  const navigationItems = navigationModules.map(({ href, label, icon }) => ({
    href,
    label,
    icon,
  }));

  if (user && can(settingsModule.permission)) {
    navigationItems.push({
      href: settingsModule.href,
      label: settingsModule.label,
      icon: settingsModule.icon,
    });
  }

  const goTo = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const toggleTheme = () => {
    setOpen(false);
    toggleThemeWithTransition(
      resolvedTheme === "dark" ? "light" : "dark",
      setTheme,
    );
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Busca rápida"
      overlayClassName="fixed inset-0 z-50 bg-[var(--color-secondary)] opacity-40"
      contentClassName="fixed left-1/2 top-[16vh] z-50 w-[min(92vw,36rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-card)] text-[var(--color-secondary)] shadow-[var(--shadow-lg)]"
      className="text-[var(--color-secondary)]"
    >
      <div className="flex items-center gap-2.5 border-b border-[var(--color-gray-200)] px-4">
        <Search
          size={16}
          className="shrink-0 text-[var(--color-gray-600)]"
          aria-hidden="true"
        />
        <Command.Input
          autoFocus
          placeholder="Buscar no Cliniq..."
          className="h-12 w-full bg-transparent text-sm text-[var(--color-secondary)] outline-none placeholder:text-[var(--color-gray-600)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]"
        />
        <kbd className={kbdClass}>esc</kbd>
      </div>

      <Command.List className="max-h-[min(60vh,24rem)] overflow-y-auto p-2">
        <Command.Empty className="px-3 py-8 text-center text-sm text-[var(--color-gray-600)]">
          Nada encontrado.
        </Command.Empty>

        {navigationItems.length > 0 && (
          <Command.Group
            heading="Ir para"
            className="px-1 py-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[var(--color-gray-600)]"
          >
            {navigationItems.map((item) => (
              <Command.Item
                key={item.href}
                value={`${item.label} ${item.href}`}
                onSelect={() => goTo(item.href)}
                className={itemClass}
              >
                <span className="shrink-0 text-[var(--color-gray-600)]">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
                <kbd className={`ml-auto ${kbdClass}`}>↵</kbd>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        <Command.Group
          heading="Ações"
          className="px-1 py-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[var(--color-gray-600)]"
        >
          <Command.Item
            value="Novo paciente criar cadastro"
            onSelect={() => goTo("/app/pacientes?mode=create")}
            className={itemClass}
          >
            <UserPlus size={18} className="shrink-0 text-[var(--color-gray-600)]" />
            <span>Novo paciente</span>
            <kbd className={`ml-auto ${kbdClass}`}>↵</kbd>
          </Command.Item>

          <Command.Item
            value="Agendar consulta agenda"
            onSelect={() => goTo("/app/agenda")}
            className={itemClass}
          >
            <CalendarPlus size={18} className="shrink-0 text-[var(--color-gray-600)]" />
            <span>Agendar consulta</span>
            <kbd className={`ml-auto ${kbdClass}`}>↵</kbd>
          </Command.Item>

          <Command.Item
            value="Alternar tema claro escuro"
            onSelect={toggleTheme}
            className={itemClass}
          >
            <MoonStar size={18} className="shrink-0 text-[var(--color-gray-600)]" />
            <span>Alternar tema</span>
            <kbd className={`ml-auto ${kbdClass}`}>↵</kbd>
          </Command.Item>
        </Command.Group>
      </Command.List>

      <div className="flex items-center gap-4 border-t border-[var(--color-gray-200)] px-4 py-2.5 text-[11px] text-[var(--color-gray-600)]">
        <span className="flex items-center gap-1">
          <kbd className={kbdClass}>↑</kbd>
          <kbd className={kbdClass}>↓</kbd>
          navegar
        </span>
        <span className="flex items-center gap-1">
          <kbd className={kbdClass}>↵</kbd>
          abrir
        </span>
        <span className="ml-auto flex items-center gap-1">
          <kbd className={kbdClass}>esc</kbd>
          fechar
        </span>
      </div>
    </Command.Dialog>
  );
}
