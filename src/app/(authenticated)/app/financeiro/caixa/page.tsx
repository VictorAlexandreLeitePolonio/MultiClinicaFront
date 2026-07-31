"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CaixaAtualCard } from "./components/CaixaAtualCard";
import { HistoricoCaixasTable } from "./components/HistoricoCaixasTable";

export default function CaixaPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8 p-8">
      <PageHeader title="Caixa" />
      <CaixaAtualCard onChanged={() => setRefreshKey((current) => current + 1)} />
      <HistoricoCaixasTable refreshKey={refreshKey} />
    </div>
  );
}
