"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import AgendaList from "./components/AgendaList";
import AgendaRegister from "./components/AgendaRegister";
import AgendaDetails from "./components/AgendaDetails";
import AgendaCalendar from "./components/AgendaCalendar";

type ViewMode = "list" | "create" | "view";

function AgendaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as ViewMode) ?? "list";
  const id = searchParams.get("id") ? Number(searchParams.get("id")) : null;
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const goTo = (mode: ViewMode, id?: number) => {
    const params = new URLSearchParams({ mode });
    if (id) params.set("id", String(id));
    router.push(`/agenda?${params.toString()}`);
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
            <AgendaList
              onCreate={() => goTo("create")}
              onViewDetails={(id) => goTo("view", id)}
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
            />
            {viewMode === "calendar" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="mt-4"
              >
                <AgendaCalendar onCreate={() => goTo("create")} />
              </motion.div>
            )}
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
            <AgendaRegister onBack={() => goTo("list")} onSave={() => goTo("list")} />
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
            <AgendaDetails id={id} onBack={() => goTo("list")} onSave={() => goTo("list")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <AgendaPage />
    </Suspense>
  );
}
