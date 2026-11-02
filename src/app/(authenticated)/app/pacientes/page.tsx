"use client";

import { Suspense, useState } from "react";
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
  // Mantém o paciente montado durante a animação de saída do modo foco.
  const [lastPatientId, setLastPatientId] = useState<number | null>(id);

  const goTo = (mode: ViewMode, id?: number) => {
    if (mode === "view" && id) setLastPatientId(id);
    if (mode === "list") {
      router.push("/app/pacientes");
      return;
    }
    const params = new URLSearchParams({ mode });
    if (id) params.set("id", String(id));
    router.push(`/app/pacientes?${params.toString()}`);
  };

  const closeFocus = () => goTo("list");

  return (
    <div className="p-8">
      {mode !== "profile" && (
        <PacienteList
          onCreate={() => goTo("create")}
          onViewDetails={(id) => goTo("view", id)}
          onVerProntuarios={(patientId) => router.push(`/app/pacientes?mode=profile&id=${patientId}&aba=anamnese`)}
          onVerPerfil={(patientId) => goTo("profile", patientId)}
        />
      )}

      <PacienteRegister
        open={mode === "create"}
        onClose={closeFocus}
        onSaved={closeFocus}
      />

      <PacienteDetails
        open={mode === "view" && id !== null}
        patientId={id ?? lastPatientId}
        onClose={closeFocus}
        onSaved={closeFocus}
      />

      <AnimatePresence mode="wait" initial={false}>
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
