import Link from "next/link";
import { Building2, Mail } from "lucide-react";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="mx-auto flex max-w-[88rem] flex-col gap-6 px-6 text-center sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:text-left">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
            <Building2 size={16} />
          </div>
          <span className="text-sm font-bold text-slate-950">MultiClinica</span>
        </Link>
        <div className="flex flex-col items-center gap-2 text-xs text-slate-500 sm:items-end">
          <a href="mailto:victorpolonio123@gmail.com" className="inline-flex items-center gap-2 transition-colors hover:text-teal-700">
            <Mail size={13} />
            Fale com a gente
          </a>
          <p>© {year} MultiClinica. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
