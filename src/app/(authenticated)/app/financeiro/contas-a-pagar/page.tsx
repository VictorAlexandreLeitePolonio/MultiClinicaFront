"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ContaPagarDetails } from "./components/ContaPagarDetails";
import { ContaPagarList } from "./components/ContaPagarList";
import { ContaPagarRegister } from "./components/ContaPagarRegister";

type ViewMode = "list" | "create" | "view" | "edit";

function ContasAPagarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as ViewMode) ?? "list";
  const id = searchParams.get("id") ? Number(searchParams.get("id")) : null;
  const goTo = (nextMode: ViewMode, nextId?: number) => {
    const params = new URLSearchParams({ mode: nextMode });
    if (nextId) params.set("id", String(nextId));
    router.push(`/app/financeiro/contas-a-pagar?${params.toString()}`);
  };

  if (mode === "create") return <ContaPagarRegister onBack={() => goTo("list")} onSave={() => goTo("list")} />;
  if (mode === "edit" && id) return <ContaPagarRegister id={id} onBack={() => goTo("view", id)} onSave={() => goTo("view", id)} />;
  if (mode === "view" && id) return <ContaPagarDetails id={id} onBack={() => goTo("list")} onEdit={(conta) => goTo("edit", conta.id)} />;
  return <ContaPagarList onCreate={() => goTo("create")} onViewDetails={(contaId) => goTo("view", contaId)} />;
}

export default function ContasAPagarPage() {
  return (
    <Suspense>
      <div className="p-8">
        <ContasAPagarContent />
      </div>
    </Suspense>
  );
}
