"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ContaReceberDetails } from "./components/ContaReceberDetails";
import { ContaReceberList } from "./components/ContaReceberList";
import { ContaReceberRegister } from "./components/ContaReceberRegister";

type ViewMode = "list" | "create" | "view";

export default function ContasAReceberPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as ViewMode) ?? "list";
  const id = searchParams.get("id") ? Number(searchParams.get("id")) : null;

  const goTo = (nextMode: ViewMode, nextId?: number) => {
    const params = new URLSearchParams({ mode: nextMode });
    if (nextId) params.set("id", String(nextId));
    router.push(`/app/financeiro/contas-a-receber?${params.toString()}`);
  };

  if (mode === "create") {
    return <ContaReceberRegister onBack={() => goTo("list")} onSave={() => goTo("list")} />;
  }

  if (mode === "view" && id) {
    return <ContaReceberDetails id={id} onBack={() => goTo("list")} />;
  }

  return <ContaReceberList onCreate={() => goTo("create")} onViewDetails={(contaId) => goTo("view", contaId)} />;
}
