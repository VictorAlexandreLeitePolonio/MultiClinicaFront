import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { LandingFooter } from "../lp/components/LandingFooter";

export const metadata: Metadata = { robots: { index: true, follow: true, googleBot: { index: true, follow: true } } };

interface LegalLayoutProps { children: ReactNode }

export default function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <div className="theme-light legal-page min-h-screen bg-white text-slate-800">
      <header className="border-b border-slate-200">
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-6" aria-label="Navegação principal">
          <Link href="/" aria-label="Cliniq — página inicial"><BrandLogo size={36} /></Link>
          <Link href="/" className="text-sm font-semibold text-teal-700 hover:underline">Voltar ao site</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">{children}</main>
      <LandingFooter />
    </div>
  );
}
