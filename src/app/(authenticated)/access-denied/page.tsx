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
    <main className="flex min-h-screen items-center justify-center bg-[#f7f5f1] px-4">
      <section className="w-full max-w-md rounded-sm border-2 border-[#d8d2c8] bg-white p-8 text-center shadow-[4px_4px_0_0_rgba(26,42,74,0.12)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-red-50 text-red-600">
          <ShieldAlert size={24} />
        </div>
        <h1 className="text-2xl font-bold text-[#1a2a4a]">Acesso negado</h1>
        <p className="mt-2 text-sm text-[#4a6354]">
          Seu perfil não tem permissão para acessar esta área.
        </p>
        <Link href={dashboardPath} className="mt-6 block">
          <Button type="button">Ir para meu painel</Button>
        </Link>
      </section>
    </main>
  );
}
