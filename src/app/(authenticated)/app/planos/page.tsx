"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormSheet } from "@/components/ui/FormSheet";
import PlanoList from "./components/PlanoList";
import PlanoRegister from "./components/PlanoRegister";
import PlanoDetails from "./components/PlanoDetails";

type ViewMode = "list" | "create" | "view";

function PlanosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as ViewMode) ?? "list";
  const idParam = searchParams.get("id");
  const id = idParam ? Number(idParam) : null;
  const [dirty, setDirty] = useState(false);
  const [listVersion, setListVersion] = useState(0);

  const closePanel = () => {
    setDirty(false);
    router.push("/app/planos");
  };

  const openCreate = () => {
    setDirty(false);
    router.push("/app/planos?mode=create");
  };

  const openView = (planId: number) => {
    setDirty(false);
    router.push(`/app/planos?mode=view&id=${planId}`);
  };

  const handleSaved = () => {
    setListVersion((version) => version + 1);
    closePanel();
  };

  return (
    <div className="p-8">
      <PlanoList
        key={listVersion}
        onCreate={openCreate}
        onViewDetails={openView}
      />

      <FormSheet
        open={mode === "create"}
        onClose={closePanel}
        title="Novo plano"
        description="Defina valor, tipo de cobrança e sessão."
        dirty={dirty}
      >
        {mode === "create" && (
          <PlanoRegister
            variant="sheet"
            onBack={closePanel}
            onSave={handleSaved}
            onDirtyChange={setDirty}
          />
        )}
      </FormSheet>

      <FormSheet
        open={mode === "view" && id !== null}
        onClose={closePanel}
        title="Detalhes do plano"
        dirty={dirty}
      >
        {mode === "view" && id !== null && (
          <PlanoDetails
            id={id}
            variant="sheet"
            onBack={closePanel}
            onSave={handleSaved}
            onDirtyChange={setDirty}
          />
        )}
      </FormSheet>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <PlanosPage />
    </Suspense>
  );
}
