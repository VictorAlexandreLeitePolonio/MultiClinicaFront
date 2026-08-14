import Link from "next/link";
import { Building2, ChevronDown } from "lucide-react";
import { LandingSmoothLink } from "./LandingSmoothLink";

export function LandingHeader() {
  return (
    <header className="landing-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="landing-header__mark">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-slate-950">MultiClinica</p>
            <p className="text-xs font-medium text-teal-700">SaaS para clínicas</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-500 lg:flex">
          <LandingSmoothLink href="#modulos" className="transition-colors hover:text-teal-700">
            Módulos
          </LandingSmoothLink>
          <LandingSmoothLink href="#como-funciona" className="transition-colors hover:text-teal-700">
            Como funciona
          </LandingSmoothLink>
          <LandingSmoothLink href="#faq" className="transition-colors hover:text-teal-700">
            FAQ
          </LandingSmoothLink>
        </nav>

        <div className="flex items-center gap-2">
          <details className="relative lg:hidden">
            <summary className="landing-header__menu" aria-label="Abrir menu">
              Menu
              <ChevronDown size={14} />
            </summary>
            <div className="landing-header__dropdown">
              <LandingSmoothLink href="#modulos">Módulos</LandingSmoothLink>
              <LandingSmoothLink href="#como-funciona">Como funciona</LandingSmoothLink>
              <LandingSmoothLink href="#faq">FAQ</LandingSmoothLink>
            </div>
          </details>
          <Link href="/login" className="landing-header__login">
            Entrar
          </Link>
        </div>
      </div>
    </header>
  );
}
