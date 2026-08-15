"use client";

import { useState } from "react";
import { CompraDetails } from "./components/CompraDetails";
import { CompraList } from "./components/CompraList";
import { CompraRegister } from "./components/CompraRegister";
import { useCompraMutations } from "./hooks/useCompras";
import type { Compra } from "./services/compras.service";
import type { CompraFormData } from "./schemas/compra.schema";
import { useTutorial } from "@/hooks/tutorial/useTutorial";

export default function ComprasPage() { const [view, setView] = useState<"list" | "register" | "details">("list"); const [selected, setSelected] = useState<Compra | null>(null); const mutations = useCompraMutations(); const { completeTaskTutorial } = useTutorial(); const defaultValues: CompraFormData = { fornecedorId: selected?.fornecedorId ?? 0, dataCompra: selected?.dataCompra?.slice(0, 10) ?? new Date().toISOString().slice(0, 10), observacao: selected?.observacao ?? "", itens: selected?.itens.map((item) => ({ produtoId: item.produtoId, quantidade: item.quantidade, valorUnitario: item.valorUnitario })) ?? [{ produtoId: 0, quantidade: 1, valorUnitario: 0 }] }; const submit = async (data: CompraFormData) => { if (selected) { await mutations.updateCompra(selected.id, data); } else { await mutations.createCompra(data); completeTaskTutorial("purchases", "create-purchase"); } setView("list"); setSelected(null); }; if (view === "details" && selected) return <CompraDetails id={selected.id} onBack={() => { setView("list"); setSelected(null); }} onEdit={(compra) => { setSelected(compra); setView("register"); }} />; return <><CompraList onCreate={() => { setSelected(null); setView("register"); }} onView={(id) => { setSelected({ id } as Compra); setView("details"); }} />{view === "register" && <CompraRegister defaultValues={defaultValues} loading={mutations.isCreating || mutations.isUpdating} onClose={() => { setView("list"); setSelected(null); }} onSubmit={submit} />}</>; }
