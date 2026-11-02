"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormSheet } from "@/components/ui/FormSheet";
import UsuarioList from "./components/UsuarioList";
import UsuarioRegister from "./components/UsuarioRegister";
import UsuarioDetails from "./components/UsuarioDetails";

type ViewMode = "list" | "create" | "view";

function UsuariosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as ViewMode) ?? "list";
  const idParam = searchParams.get("id");
  const id = idParam ? Number(idParam) : null;
  const [dirty, setDirty] = useState(false);
  const [listVersion, setListVersion] = useState(0);

  const closePanel = () => {
    setDirty(false);
    router.push("/app/usuarios");
  };

  const openCreate = () => {
    setDirty(false);
    router.push("/app/usuarios?mode=create");
  };

  const openView = (userId: number) => {
    setDirty(false);
    router.push(`/app/usuarios?mode=view&id=${userId}`);
  };

  const handleSaved = () => {
    setListVersion((version) => version + 1);
    closePanel();
  };

  return (
    <div className="p-8">
      <UsuarioList
        key={listVersion}
        onCreate={openCreate}
        onViewDetails={openView}
      />

      <FormSheet
        open={mode === "create"}
        onClose={closePanel}
        title="Convidar pessoa"
        dirty={dirty}
      >
        {mode === "create" && (
          <UsuarioRegister
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
        title="Detalhes do usuário"
        dirty={dirty}
      >
        {mode === "view" && id !== null && (
          <UsuarioDetails
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
      <UsuariosPage />
    </Suspense>
  );
}
