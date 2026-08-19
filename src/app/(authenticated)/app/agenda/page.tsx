"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import AgendaList from "./components/AgendaList";
import AgendaRegister from "./components/AgendaRegister";
import AgendaDetails from "./components/AgendaDetails";
import AgendaCalendar from "./components/AgendaCalendar";
import AppointmentRequestsList from "./components/AppointmentRequestsList";
import { useClinicRequests } from "./hooks/requests";

type ViewMode = "list" | "create" | "view";
type AgendaTab = "consultas" | "requests";

function AgendaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as ViewMode) ?? "list";
  const id = searchParams.get("id") ? Number(searchParams.get("id")) : null;
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [tab, setTab] = useState<AgendaTab>("consultas");

  const { data: requests } = useClinicRequests();
  const pendingCount = requests?.filter((r) => r.status === "Pending").length ?? 0;

  const goTo = (mode: ViewMode, id?: number) => {
    const params = new URLSearchParams({ mode });
    if (id) params.set("id", String(id));
    router.push(`/app/agenda?${params.toString()}`);
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
            {/* Abas Consultas / Solicitações */}
            <div className="mb-6 flex gap-1 border-b border-gray-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setTab("consultas")}
                className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                  tab === "consultas"
                    ? "border-primary-dark text-primary-dark"
                    : "border-transparent text-gray-500 hover:text-secondary dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Consultas
              </button>
              <button
                type="button"
                onClick={() => setTab("requests")}
                className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                  tab === "requests"
                    ? "border-primary-dark text-primary-dark"
                    : "border-transparent text-gray-500 hover:text-secondary dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Solicitações
                {pendingCount > 0 && (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary-dark px-1.5 py-0.5 text-xs font-bold text-white">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>

            {tab === "consultas" ? (
              <>
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
              </>
            ) : (
              <AppointmentRequestsList />
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
