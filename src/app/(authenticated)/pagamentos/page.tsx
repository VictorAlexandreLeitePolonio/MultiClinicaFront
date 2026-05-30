"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import PagamentoList from "./components/PagamentoList";
import PagamentoRegister from "./components/PagamentoRegister";
import PagamentoDetails from "./components/PagamentoDetails";

type ViewMode = "list" | "create" | "view";

function PagamentosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as ViewMode) ?? "list";
  const id = searchParams.get("id") ? Number(searchParams.get("id")) : null;

  const goTo = (mode: ViewMode, id?: number) => {
    const params = new URLSearchParams({ mode });
    if (id) params.set("id", String(id));
    router.push(`/pagamentos?${params.toString()}`);
  };

  return (
    <div className="p-8">
      <AnimatePresence mode="wait" initial={false}>
        {mode === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <PagamentoList
              onCreate={() => goTo("create")}
              onViewDetails={(id) => goTo("view", id)}
            />
          </motion.div>
        )}

        {mode === "create" && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <PagamentoRegister
              onBack={() => goTo("list")}
              onSave={() => goTo("list")}
            />
          </motion.div>
        )}

        {mode === "view" && id && (
          <motion.div
            key="view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <PagamentoDetails
              id={id}
              onBack={() => goTo("list")}
              onSave={() => goTo("list")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <PagamentosPage />
    </Suspense>
  );
}
