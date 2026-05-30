"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import ProntuarioList from "./components/ProntuarioList";
import ProntuarioCards from "./components/ProntuarioCards";
import ProntuarioDetails from "./components/ProntuarioDetails";
import ProntuarioForm from "./components/ProntuarioForm";

type ViewMode = "list" | "create" | "cards" | "view";

function ProntuariosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as ViewMode) ?? "list";
  const id = searchParams.get("id") ? Number(searchParams.get("id")) : null;
  const patientId = searchParams.get("patientId")
    ? Number(searchParams.get("patientId"))
    : null;

  const goTo = (newMode: ViewMode, newId?: number) => {
    const params = new URLSearchParams();
    params.set("mode", newMode);
    if (newId) params.set("id", String(newId));
    if (patientId && newMode !== "list") {
      params.set("patientId", patientId.toString());
    }
    router.push(`/prontuarios?${params.toString()}`);
  };

  const goToList = () => {
    router.push("/prontuarios");
  };

  const goToCards = (pId: number) => {
    router.push(`?mode=cards&patientId=${pId}`);
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
            <ProntuarioList
              onCreate={() => goTo("create")}
              onViewCards={goToCards}
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
            <ProntuarioForm
              preselectedPatientId={patientId}
              onBack={patientId ? () => goToCards(patientId) : goToList}
              onSave={patientId ? () => goToCards(patientId) : goToList}
            />
          </motion.div>
        )}

        {mode === "cards" && patientId && (
          <motion.div
            key="cards"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ProntuarioCards
              patientId={patientId}
              onBack={goToList}
              onViewDetails={(id) => goTo("view", id)}
              onCreate={() => goTo("create")}
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
            <ProntuarioDetails
              id={id}
              onBack={patientId ? () => goToCards(patientId) : goToList}
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
      <ProntuariosPage />
    </Suspense>
  );
}
