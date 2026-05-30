"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import PacienteList from "./components/PacienteList";
import PacienteRegister from "./components/PacienteRegister";
import PacienteDetails from "./components/PacienteDetails";
import PacienteProfile from "./components/PacienteProfile";

type ViewMode = "list" | "create" | "view" | "profile";

function PacientesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as ViewMode) ?? "list";
  const id = searchParams.get("id") ? Number(searchParams.get("id")) : null;

  const goTo = (mode: ViewMode, id?: number) => {
    const params = new URLSearchParams({ mode });
    if (id) params.set("id", String(id));
    router.push(`/pacientes?${params.toString()}`);
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
            <PacienteList
              onCreate={() => goTo("create")}
              onViewDetails={(id) => goTo("view", id)}
              onVerProntuarios={(patientId) => router.push(`/prontuarios?mode=cards&patientId=${patientId}`)}
              onVerPerfil={(patientId) => goTo("profile", patientId)}
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
            <PacienteRegister onBack={() => goTo("list")} onSave={() => goTo("list")} />
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
            <PacienteDetails id={id} onBack={() => goTo("list")} onSave={() => goTo("list")} />
          </motion.div>
        )}

        {mode === "profile" && id && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <PacienteProfile id={id} onBack={() => goTo("list")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <PacientesPage />
    </Suspense>
  );
}
