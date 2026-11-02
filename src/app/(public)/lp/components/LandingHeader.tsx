"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils";
import { LandingSmoothLink } from "./LandingSmoothLink";

const NAV_LINKS = [
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "/hub", label: "Hub" },
  { href: "#planos", label: "Planos" },
  { href: "#faq", label: "Dúvidas" },
] as const;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lp-bg)]";

function NavigationLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  if (href.startsWith("#")) {
    return (
      <LandingSmoothLink href={href as `#${string}`} className={className}>
        {children}
      </LandingSmoothLink>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color] duration-200 motion-reduce:transition-none",
        scrolled
          ? "border-[var(--lp-line)] bg-[var(--lp-bg)]/80 backdrop-blur-sm"
          : "border-transparent bg-transparent",
      )}
      data-scrolled={scrolled}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
        <Link
          href="/"
          className={cn(
            "flex shrink-0 items-center gap-2.5 rounded-lg text-[var(--lp-ink)]",
            FOCUS_RING,
          )}
        >
          <span aria-hidden="true">
            <BrandLogo variant="mark" size={34} className="rounded-[10px]" priority />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.02em]">Cliniq Care</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-[var(--lp-muted)] lg:flex">
          {NAV_LINKS.map((link) => (
            <NavigationLink
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md transition-colors hover:text-[var(--lp-ink)]",
                FOCUS_RING,
              )}
            >
              {link.label}
            </NavigationLink>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className={cn(
              "hidden min-h-10 items-center rounded-lg px-2 text-sm font-semibold text-[var(--lp-muted)] transition-colors hover:text-[var(--lp-ink)] lg:inline-flex",
              FOCUS_RING,
            )}
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className={cn(
              "hidden min-h-10 items-center rounded-full bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--lp-bg)] transition-[background-color,transform] duration-200 hover:bg-[var(--color-primary-light)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 lg:inline-flex",
              FOCUS_RING,
            )}
          >
            Começar grátis
          </Link>

          <details className="relative lg:hidden">
            <summary
              aria-label="Abrir menu"
              className={cn(
                "inline-flex size-10 cursor-pointer list-none items-center justify-center rounded-lg border border-[var(--lp-line)] bg-[var(--lp-surface)] text-[var(--lp-ink)] transition-colors [&::-webkit-details-marker]:hidden",
                FOCUS_RING,
              )}
            >
              <Menu size={18} aria-hidden="true" />
            </summary>

            <div className="absolute top-full right-0 mt-2 grid w-60 gap-1 rounded-xl border border-[var(--lp-line)] bg-[var(--lp-surface)] p-2 shadow-lg">
              {NAV_LINKS.map((link) => (
                <NavigationLink
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--lp-muted)] transition-colors hover:bg-[var(--lp-bg)] hover:text-[var(--lp-ink)]",
                    FOCUS_RING,
                  )}
                >
                  {link.label}
                </NavigationLink>
              ))}
              <div className="mt-1 grid gap-1 border-t border-[var(--lp-line)] pt-2">
                <Link
                  href="/login"
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-semibold text-[var(--lp-ink)] transition-colors hover:bg-[var(--lp-bg)]",
                    FOCUS_RING,
                  )}
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className={cn(
                    "rounded-lg bg-[var(--color-primary)] px-3 py-2.5 text-center text-sm font-semibold text-[var(--lp-bg)] transition-transform active:scale-[0.97] motion-reduce:active:scale-100",
                    FOCUS_RING,
                  )}
                >
                  Começar grátis
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
