"use client";

import { useEffect, useState } from "react";
import { Calendar, Inbox, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Column, DataTable } from "@/components/ui/DataTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { abrirCaixa, fecharCaixa, getCaixaAtual, getMovimentacoesCaixa } from "@/services/caixa/caixa.service";
import { Caixa, MovimentacaoResumo } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { AbrirCaixaFormData, FecharCaixaFormData } from "../schemas/caixa.schema";
import { AbrirCaixaDialog } from "./AbrirCaixaDialog";
import { FecharCaixaDialog } from "./FecharCaixaDialog";

interface CaixaAtualCardProps {
  onChanged?: () => void;
}

export function CaixaAtualCard({ onChanged }: CaixaAtualCardProps) {
  const [caixa, setCaixa] = useState<Caixa | null>(null);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [abrirOpen, setAbrirOpen] = useState(false);
  const [fecharOpen, setFecharOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const atual = await getCaixaAtual();
      setCaixa(atual);
      setMovimentacoes(atual ? await getMovimentacoesCaixa(atual.id) : []);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Erro ao carregar caixa atual."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleAbrir = async (data: AbrirCaixaFormData) => {
    setSaving(true);
    try {
      await abrirCaixa(data);
      toast.success("Caixa aberto!");
      setAbrirOpen(false);
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Erro ao abrir caixa"));
    } finally {
      setSaving(false);
    }
  };

  const handleFechar = async (data: FecharCaixaFormData) => {
    if (!caixa) return;
    setSaving(true);
    try {
      await fecharCaixa(caixa.id, data);
      toast.success("Caixa fechado!");
      setFecharOpen(false);
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Erro ao fechar caixa"));
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<MovimentacaoResumo>[] = [
    { key: "descricao", label: "Descrição" },
    { key: "tipo", label: "Tipo" },
    { key: "valor", label: "Valor", render: (movimentacao) => formatCurrency(movimentacao.valor) },
    { key: "dataMovimentacao", label: "Data", render: (movimentacao) => formatDate(movimentacao.dataMovimentacao) },
  ];

  if (loading) {
    return <Skeleton className="h-40" />;
  }

  if (!caixa) {
    return (
      <div className="rounded-2xl border border-dashed border-[#a7f3d0] bg-white/75 px-6 py-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/75">
        <Inbox className="mx-auto mb-3 text-[#64748b]" size={32} />
        <p className="mb-4 text-sm font-medium text-[#64748b] dark:text-slate-300">Nenhum caixa aberto no momento.</p>
        <div className="mx-auto max-w-48">
          <Button onClick={() => setAbrirOpen(true)}>Abrir Caixa</Button>
        </div>
        <AbrirCaixaDialog open={abrirOpen} loading={saving} onClose={() => setAbrirOpen(false)} onSubmit={handleAbrir} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Caixa Aberto</h2>
        <div className="max-w-44">
          <Button variant="danger" onClick={() => setFecharOpen(true)}>
            Fechar Caixa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard label="Saldo Inicial" value={formatCurrency(caixa.saldoInicial)} icon={Wallet} />
        <MetricCard label="Aberto em" value={formatDate(caixa.dataAbertura)} icon={Calendar} />
      </div>

      <DataTable
        columns={columns}
        data={movimentacoes}
        emptyMessage="Nenhuma movimentação registrada neste caixa ainda."
        keyExtractor={(movimentacao) => movimentacao.id}
      />

      <FecharCaixaDialog open={fecharOpen} loading={saving} onClose={() => setFecharOpen(false)} onSubmit={handleFechar} />
    </div>
  );
}
