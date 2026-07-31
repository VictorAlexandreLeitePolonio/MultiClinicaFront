"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import type { GerarContaPagarPayload } from "../services/compras.service";

interface Props { open: boolean; loading?: boolean; onClose: () => void; onSubmit: (payload: GerarContaPagarPayload) => Promise<void> | void; }
export function GerarContaPagarDialog({ open, loading, onClose, onSubmit }: Props) { const [dataVencimento, setDataVencimento] = useState(new Date().toISOString().slice(0, 10)); const [categoriaFinanceiraId, setCategoriaFinanceiraId] = useState(""); if (!open) return null; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"><form onSubmit={(event) => { event.preventDefault(); void onSubmit({ dataVencimento, categoriaFinanceiraId: categoriaFinanceiraId ? Number(categoriaFinanceiraId) : null }); }} className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-slate-900"><h2 className="text-lg font-bold">Gerar conta a pagar</h2><div className="mt-5 space-y-4"><FormField id="compra-conta-vencimento" label="Data de vencimento" type="date" value={dataVencimento} onChange={(event) => setDataVencimento(event.target.value)} /><FormField id="compra-conta-categoria" label="Categoria financeira (opcional)" value={categoriaFinanceiraId} onChange={(event) => setCategoriaFinanceiraId(event.target.value)} /></div><div className="mt-6 flex gap-3"><Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button><Button type="submit" loading={loading}>Gerar</Button></div></form></div>; }
