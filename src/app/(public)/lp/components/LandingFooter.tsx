import Link from "next/link";
import { Mail } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { siteConfig } from "@/lib/site";

const linkClassName =
  "rounded-sm text-[var(--lp-muted)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]";

export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--lp-line)] bg-[var(--lp-bg)]">
      <div className="mx-auto max-w-[88rem] px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <Link
            href="/"
            className="flex w-fit items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lp-bg)]"
          >
            <BrandLogo variant="mark" size={32} className="rounded-lg" />
            <span className="text-sm font-semibold text-[var(--lp-ink)]">Cliniq Care</span>
          </Link>

          <div className="flex flex-col gap-4 text-sm sm:items-end">
            <nav
              aria-label="Links do rodapé"
              className="flex flex-wrap gap-x-6 gap-y-2 sm:justify-end"
            >
              <Link href="/paciente/login" className={linkClassName}>
                Portal do paciente
              </Link>
              <Link href="/login" className={linkClassName}>
                Acesso da clínica
              </Link>
              <a href={`mailto:${siteConfig.contactEmail}`} className={linkClassName}>
                <span className="inline-flex items-center gap-1.5">
                  <Mail size={13} aria-hidden="true" />
                  Fale com a gente
                </span>
              </a>
            </nav>

            <nav
              aria-label="Legal"
              className="flex flex-wrap gap-x-5 gap-y-2 text-xs sm:justify-end"
            >
              <Link href="/privacidade" className={linkClassName}>
                Política de privacidade
              </Link>
              <Link href="/termos" className={linkClassName}>
                Termos de uso
              </Link>
            </nav>
          </div>
        </div>

        <p className="mt-8 border-t border-[var(--lp-line)] pt-6 font-mono text-xs text-[var(--lp-muted)]">
          © Cliniq Care
        </p>
      </div>
    </footer>
  );
}
