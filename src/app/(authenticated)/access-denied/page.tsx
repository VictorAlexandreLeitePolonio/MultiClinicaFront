"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPathByRole } from "@/lib/auth/routes";
import { Button } from "@/components/ui/Button";

export default function AccessDeniedPage() {
  const { user } = useAuth();
  const dashboardPath = user ? getDashboardPathByRole(user.role) : "/login";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 px-4">
      <section className="w-full max-w-md rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <ShieldAlert size={24} />
        </div>
        <h1 className="text-2xl font-bold text-secondary dark:text-white">Acesso negado</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
          Seu perfil não tem permissão para acessar esta área.
        </p>
        <Link href={dashboardPath} className="mt-6 block">
          <Button type="button">Ir para meu painel</Button>
        </Link>
      </section>
    </main>
  );
}
