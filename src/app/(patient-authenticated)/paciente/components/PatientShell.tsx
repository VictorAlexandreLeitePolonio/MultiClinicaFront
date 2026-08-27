"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Calendar, ClipboardList, Building2, Store, User, LogOut, LucideIcon } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { usePatientAuth } from "@/contexts/PatientAuthContext";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: "/paciente", label: "Início", icon: Home },
  { href: "/paciente/consultas", label: "Consultas", icon: Calendar },
  { href: "/paciente/solicitacoes", label: "Solicitações", icon: ClipboardList },
  { href: "/paciente/clinicas", label: "Minhas clínicas", icon: Building2 },
  { href: "/paciente/marketplace", label: "Marketplace", icon: Store },
  { href: "/paciente/perfil", label: "Meu perfil", icon: User },
];

function isActive(pathname: string, href: string) {
  return href === "/paciente" ? pathname === "/paciente" : pathname.startsWith(href);
}

export function PatientShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = usePatientAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/paciente/login");
  };

  return (
    <div className="min-h-screen bg-[#f0fdf9] dark:bg-slate-950">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-[#d7f3ea] bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:flex">
        <div className="mb-8">
          <Logo light />
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#14b8a6] text-white"
                    : "text-[#475569] hover:bg-[#ecfdf5] dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#475569] transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950/40"
        >
          <LogOut size={18} />
          Sair
        </button>
      </aside>

      {/* Top bar — mobile */}
      <header className="flex items-center justify-between border-b border-[#d7f3ea] bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
        <Logo light />
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sair"
          className="flex items-center gap-1 text-sm font-medium text-[#475569] dark:text-slate-300"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Conteúdo */}
      <main className="px-4 pb-24 pt-6 md:pb-10 md:pl-72 md:pr-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>

      {/* Bottom nav — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex overflow-x-auto border-t border-[#d7f3ea] bg-white dark:border-slate-800 dark:bg-slate-900 md:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-16 flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium ${
                active ? "text-[#0f766e] dark:text-[#67e8f9]" : "text-[#94a3b8] dark:text-slate-400"
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
