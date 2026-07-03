import Link from "next/link";
import { Building2 } from "lucide-react";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-card py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#06b6d4] text-white">
            <Building2 size={16} />
          </div>
          <span className="text-sm font-bold text-secondary">MultiClinica</span>
        </Link>
        <p className="text-xs text-gray-600">
          © {year} MultiClinica. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
