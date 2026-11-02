"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { FocusForm } from "@/components/ui/FocusForm";
import PacienteList from "./components/PacienteList";
import PacienteRegister, { PACIENTE_FOCUS_SECTIONS } from "./components/PacienteRegister";
import PacienteDetails from "./components/PacienteDetails";
import PacienteProfile from "./components/PacienteProfile";

type ViewMode = "list" | "create" | "view" | "profile";

function PacientesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as ViewMode) ?? "list";
  const id = searchParams.get("id") ? Number(searchParams.get("id")) : null;
  const [createDirty, setCreateDirty] = useState(false);

  const goTo = (mode: ViewMode, id?: number) => {
    if (mode === "list") {
      router.push("/app/pacientes");
      return;
    }
    const params = new URLSearchParams({ mode });
    if (id) params.set("id", String(id));
    router.push(`/app/pacientes?${params.toString()}`);
  };

  const closeCreate = () => {
    setCreateDirty(false);
    goTo("list");
  };

  const handleCreateSaved = () => {
    setCreateDirty(false);
    goTo("list");
  };

  return (
    <div className="p-8">
      {(mode === "list" || mode === "create") && (
        <PacienteList
          onCreate={() => goTo("create")}
          onViewDetails={(id) => goTo("view", id)}
          onVerProntuarios={(patientId) => router.push(`/app/pacientes?mode=profile&id=${patientId}&aba=anamnese`)}
          onVerPerfil={(patientId) => goTo("profile", patientId)}
        />
      )}

      <AnimatePresence mode="wait" initial={false}>
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

      <FocusForm
        open={mode === "create"}
        onClose={closeCreate}
        title="Novo paciente"
        sections={PACIENTE_FOCUS_SECTIONS}
        dirty={createDirty}
        actions={
          <Button type="submit" form="paciente-form" fullWidth={false}>
            Salvar
          </Button>
        }
      >
        <PacienteRegister
          variant="focus"
          onBack={closeCreate}
          onSave={handleCreateSaved}
          onDirtyChange={setCreateDirty}
        />
      </FocusForm>
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
