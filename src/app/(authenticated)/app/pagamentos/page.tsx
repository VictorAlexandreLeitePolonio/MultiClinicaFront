"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormSheet } from "@/components/ui/FormSheet";
import PagamentoList from "./components/PagamentoList";
import PagamentoRegister from "./components/PagamentoRegister";
import PagamentoDetails from "./components/PagamentoDetails";

type ViewMode = "list" | "create" | "view";

function PagamentosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") as ViewMode) ?? "list";
  const rawId = searchParams.get("id");
  const parsedId = rawId ? Number(rawId) : null;
  const id =
    parsedId !== null && Number.isFinite(parsedId) ? parsedId : null;

  const [createDirty, setCreateDirty] = useState(false);
  const [detailsDirty, setDetailsDirty] = useState(false);

  const closeSheet = () => {
    setCreateDirty(false);
    setDetailsDirty(false);
    router.push("/app/pagamentos");
  };

  const openCreate = () => router.push("/app/pagamentos?mode=create");
  const openView = (paymentId: number) =>
    router.push(`/app/pagamentos?mode=view&id=${paymentId}`);

  return (
    <div className="p-8">
      <PagamentoList onCreate={openCreate} onViewDetails={openView} />

      <FormSheet
        open={mode === "create"}
        onClose={closeSheet}
        title="Novo pagamento"
        dirty={createDirty}
        size="lg"
      >
        {mode === "create" && (
          <PagamentoRegister
            variant="sheet"
            onBack={closeSheet}
            onSave={closeSheet}
            onDirtyChange={setCreateDirty}
          />
        )}
      </FormSheet>

      <FormSheet
        open={mode === "view" && id !== null}
        onClose={closeSheet}
        title="Detalhes do pagamento"
        dirty={detailsDirty}
      >
        {mode === "view" && id !== null && (
          <PagamentoDetails
            id={id}
            variant="sheet"
            onBack={closeSheet}
            onSave={closeSheet}
            onDirtyChange={setDetailsDirty}
          />
        )}
      </FormSheet>
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
