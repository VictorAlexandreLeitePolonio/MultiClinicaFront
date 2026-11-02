"use client";

import { Suspense, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FormSheet } from "@/components/ui/FormSheet";
import { useMediaQuery, useViewPreference } from "@/components/ui/ViewSwitcher";
import AgendaList, { type AgendaView } from "./components/AgendaList";
import AgendaRegister from "./components/AgendaRegister";
import AgendaDetails from "./components/AgendaDetails";
import AgendaCalendar from "./components/AgendaCalendar";
import AgendaDayView from "./components/AgendaDayView";
import AppointmentRequestsList from "./components/AppointmentRequestsList";
import { useClinicRequests } from "./hooks/requests";

type ViewMode = "list" | "create" | "view";
type AgendaTab = "consultas" | "requests";

function AgendaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const mode: ViewMode =
    modeParam === "create" || modeParam === "view" ? modeParam : "list";
  const idParam = Number(searchParams.get("id"));
  const id = Number.isInteger(idParam) && idParam > 0 ? idParam : null;
  const initialDate = searchParams.get("date");
  const toPositiveInt = (value: string | null) => {
    const parsed = Number(value);
    return value && Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
  };
  const registerInitialValues = {
    patientId: toPositiveInt(searchParams.get("patientId")),
    professionalId: toPositiveInt(searchParams.get("professionalId")),
    appointmentDay: initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate) ? initialDate : undefined,
  };

  const [view, setView] = useViewPreference<AgendaView>("agenda", "list", [
    "list",
    "week",
    "day",
  ]);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const reduceMotion = useReducedMotion();
  const effectiveView: AgendaView = !isDesktop && view === "day" ? "list" : view;

  const [tab, setTab] = useState<AgendaTab>("consultas");
  const [createDirty, setCreateDirty] = useState(false);
  const [viewDirty, setViewDirty] = useState(false);

  const { data: requests } = useClinicRequests();
  const pendingCount = requests?.filter((r) => r.status === "Pending").length ?? 0;

  const closeSheet = useCallback(() => {
    setCreateDirty(false);
    setViewDirty(false);
    router.push("/app/agenda");
  }, [router]);

  const openCreate = useCallback(() => {
    setCreateDirty(false);
    router.push("/app/agenda?mode=create");
  }, [router]);

  const openDetails = useCallback(
    (appointmentId: number) => {
      setViewDirty(false);
      router.push(`/app/agenda?mode=view&id=${appointmentId}`);
    },
    [router],
  );

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Abas Consultas / Solicitações */}
      <div className="flex gap-1 border-b border-[var(--color-gray-200)]">
        <button
          type="button"
          onClick={() => setTab("consultas")}
          className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-150 ${
            tab === "consultas"
              ? "border-[var(--color-primary-dark)] text-[var(--color-primary-dark)]"
              : "border-transparent text-[var(--color-gray-600)] hover:text-[var(--color-secondary)]"
          }`}
        >
          Consultas
        </button>
        <button
          type="button"
          onClick={() => setTab("requests")}
          className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-150 ${
            tab === "requests"
              ? "border-[var(--color-primary-dark)] text-[var(--color-primary-dark)]"
              : "border-transparent text-[var(--color-gray-600)] hover:text-[var(--color-secondary)]"
          }`}
        >
          Solicitações
          {pendingCount > 0 && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--color-primary-dark)] px-1.5 py-0.5 text-xs font-bold text-[var(--color-white)]">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {tab === "consultas" ? (
        <>
          <AgendaList
            onCreate={openCreate}
            onViewDetails={openDetails}
            view={effectiveView}
            onChangeView={setView}
          />
          <AnimatePresence mode="wait" initial={false}>
            {effectiveView === "week" && (
              <motion.div
                key="week"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.15 }}
              >
                <AgendaCalendar onCreate={openCreate} />
              </motion.div>
            )}
            {effectiveView === "day" && (
              <motion.div
                key="day"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.15 }}
              >
                <AgendaDayView onCreate={openCreate} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <AppointmentRequestsList />
      )}

      <FormSheet
        open={mode === "create"}
        onClose={closeSheet}
        title="Novo agendamento"
        description="Paciente, profissional e horário."
        dirty={createDirty}
      >
        <AgendaRegister
          variant="sheet"
          onBack={closeSheet}
          onSave={closeSheet}
          onDirtyChange={setCreateDirty}
          initialValues={registerInitialValues}
        />
      </FormSheet>

      <FormSheet
        open={mode === "view" && id !== null}
        onClose={closeSheet}
        title="Detalhes do agendamento"
        dirty={viewDirty}
      >
        {id !== null && (
          <AgendaDetails
            id={id}
            variant="sheet"
            onBack={closeSheet}
            onSave={closeSheet}
            onDirtyChange={setViewDirty}
          />
        )}
      </FormSheet>
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
