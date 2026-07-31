"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { CategoriaFinanceiraTab } from "./components/CategoriaFinanceiraTab";
import { ContaFinanceiraTab } from "./components/ContaFinanceiraTab";
import { FormaPagamentoTab } from "./components/FormaPagamentoTab";

const tabs = [
  { value: "formas-pagamento", label: "Formas de Pagamento" },
  { value: "categorias", label: "Categorias Financeiras" },
  { value: "contas", label: "Contas Financeiras" },
];

export default function ConfiguracoesPage() {
  const [tab, setTab] = useState("formas-pagamento");

  return (
    <div className="space-y-6 p-8">
      <PageHeader title="Configurações Financeiras" />

      <Tabs tabs={tabs} value={tab} onChange={setTab}>
        {tab === "formas-pagamento" && <FormaPagamentoTab />}
        {tab === "categorias" && <CategoriaFinanceiraTab />}
        {tab === "contas" && <ContaFinanceiraTab />}
      </Tabs>
    </div>
  );
}
