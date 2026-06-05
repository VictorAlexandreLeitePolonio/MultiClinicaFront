import Link from "next/link";
import { Building2 } from "lucide-react";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#d7f3ea] bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#14b8a6] to-[#06b6d4] text-white shadow-[0_18px_38px_-26px_rgba(20,184,166,0.9)]">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-[#0f172a]">MultiClinica</p>
            <p className="text-xs font-medium text-[#0f766e]">SaaS para clínicas</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-[#64748b] md:flex">
          <a href="#beneficios" className="transition-colors hover:text-[#0f766e]">
            Benefícios
          </a>
          <a href="#modulos" className="transition-colors hover:text-[#0f766e]">
            Módulos
          </a>
          <a href="#contato" className="transition-colors hover:text-[#0f766e]">
            Contato
          </a>
        </nav>

        <Link
          href="/login"
          className="rounded-xl border border-[#99f6e4] bg-white px-4 py-2 text-sm font-semibold text-[#0f766e] shadow-sm transition-colors hover:bg-[#ecfdf5]"
        >
          Entrar
        </Link>
      </div>
    </header>
  );
}
