import Link from "next/link";
import { Mail } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="mx-auto flex max-w-[88rem] flex-col gap-6 px-6 text-center sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:text-left">
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo variant="mark" size={32} className="rounded-lg" />
          <span className="text-sm font-bold text-slate-950">Cliniq</span>
        </Link>
        <div className="flex flex-col items-center gap-2 text-xs text-slate-500 sm:items-end">
          <div className="flex items-center gap-4">
            <Link href="/paciente/login" className="font-semibold transition-colors hover:text-teal-700">
              Portal do paciente
            </Link>
            <Link href="/login" className="font-semibold transition-colors hover:text-teal-700">
              Acesso da clínica
            </Link>
            <a href="mailto:victorpolonio123@gmail.com" className="inline-flex items-center gap-2 transition-colors hover:text-teal-700">
              <Mail size={13} />
              Fale com a gente
            </a>
          </div>
          <p>© {year} Cliniq. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
