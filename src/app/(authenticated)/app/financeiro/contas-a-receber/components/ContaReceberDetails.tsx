"use client";

import { useEffect, useState } from "react";
import { Ban, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { Button } from "@/components/ui/Button";
import { Column, DataTable } from "@/components/ui/DataTable";
import { MotivoDialog } from "@/components/ui/MotivoDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { cancelarContaReceber, getContaReceberById } from "@/services/contasReceber/contasReceber.service";
import { getPatientById } from "@/services/patients/patients.service";
import { estornarRecebimento, registrarRecebimento } from "@/services/recebimentos/recebimentos.service";
import { ContaReceber, Patient, Recebimento } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useRecebimentosPorConta } from "../hooks/useRecebimento";
import { RegistrarRecebimentoFormData } from "../schemas/contaReceber.schema";
import { RegistrarRecebimentoDialog } from "./RegistrarRecebimentoDialog";

interface ContaReceberDetailsProps {
  id: number;
  onBack: () => void;
}

export function ContaReceberDetails({ id, onBack }: ContaReceberDetailsProps) {
  const [conta, setConta] = useState<ContaReceber | null>(null);
  const [paciente, setPaciente] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrarOpen, setRegistrarOpen] = useState(false);
  const [registrando, setRegistrando] = useState(false);
  const [estornando, setEstornando] = useState<Recebimento | null>(null);
  const [estornandoLoading, setEstornandoLoading] = useState(false);
  const [cancelarOpen, setCancelarOpen] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const { data: recebimentos, loading: loadingRecebimentos, refetch: refetchRecebimentos } = useRecebimentosPorConta(id);

  const loadConta = async () => {
    setLoading(true);
    try {
      const data = await getContaReceberById(id);
      setConta(data);
      setPaciente(await getPatientById(data.pacienteId));
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Erro ao carregar conta a receber."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadConta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRegistrar = async (formData: RegistrarRecebimentoFormData) => {
    setRegistrando(true);
    try {
      await registrarRecebimento(id, formData);
      toast.success("Recebimento registrado com sucesso!");
      setRegistrarOpen(false);
      await loadConta();
      await refetchRecebimentos();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Erro ao registrar recebimento"));
    } finally {
      setRegistrando(false);
    }
  };

  const handleEstornar = async (motivo: string) => {
    if (!estornando) return;
    setEstornandoLoading(true);
    try {
      await estornarRecebimento(estornando.id, motivo);
      toast.success("Recebimento estornado!");
      setEstornando(null);
      await loadConta();
      await refetchRecebimentos();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Erro ao estornar recebimento"));
    } finally {
      setEstornandoLoading(false);
    }
  };

  const handleCancelar = async (motivo: string) => {
    setCancelando(true);
    try {
      await cancelarContaReceber(id, motivo);
      toast.success("Conta cancelada!");
      setCancelarOpen(false);
      await loadConta();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Erro ao cancelar conta"));
    } finally {
      setCancelando(false);
    }
  };

  const columns: Column<Recebimento>[] = [
    { key: "valor", label: "Valor", render: (recebimento) => formatCurrency(recebimento.valor) },
    { key: "dataRecebimento", label: "Data", render: (recebimento) => formatDate(recebimento.dataRecebimento) },
    {
      key: "isEstornado",
      label: "Status",
      render: (recebimento) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            recebimento.isEstornado
              ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
              : "bg-[#ecfdf5] text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]"
          }`}
        >
          {recebimento.isEstornado ? "Estornado" : "Ativo"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (recebimento) =>
        !recebimento.isEstornado ? (
          <ActionsDropdown
            actions={[
              {
                label: "Estornar",
                onClick: () => setEstornando(recebimento),
                variant: "danger",
                icon: <RotateCcw size={14} />,
              },
            ]}
          />
        ) : null,
    },
  ];

  if (loading || !conta) {
    return (
      <div className="space-y-4">
        <PageHeader title="Conta a Receber" onBack={onBack} />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const saldoRestante = conta.valorTotal - conta.valorRecebido;
  const podeCancelar = conta.status !== "Cancelada" && conta.status !== "Paga";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Conta a Receber #${conta.id}`}
        onBack={onBack}
        actions={
          <div className="flex gap-2">
            {saldoRestante > 0 && conta.status !== "Cancelada" && (
              <Button onClick={() => setRegistrarOpen(true)}>Registrar Recebimento</Button>
            )}
            {podeCancelar && (
              <Button variant="danger" onClick={() => setCancelarOpen(true)}>
                <Ban size={16} className="mr-2" />
                Cancelar Conta
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#d7f3ea] bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs font-medium text-[#64748b] dark:text-slate-300">Paciente</p>
          <p className="mt-1 font-semibold text-[#0f172a] dark:text-white">{paciente?.name ?? `#${conta.pacienteId}`}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#64748b] dark:text-slate-300">Valor Total</p>
          <p className="mt-1 font-semibold text-[#0f172a] dark:text-white">{formatCurrency(conta.valorTotal)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#64748b] dark:text-slate-300">Recebido</p>
          <p className="mt-1 font-semibold text-[#0f172a] dark:text-white">{formatCurrency(conta.valorRecebido)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#64748b] dark:text-slate-300">Status</p>
          <p className="mt-1 font-semibold text-[#0f172a] dark:text-white">{conta.status}</p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#64748b] dark:text-slate-300">
          Recebimentos
        </h3>
        <DataTable
          columns={columns}
          data={recebimentos}
          loading={loadingRecebimentos}
          emptyMessage="Nenhum recebimento registrado ainda."
          keyExtractor={(recebimento) => recebimento.id}
        />
      </div>

      <RegistrarRecebimentoDialog
        open={registrarOpen}
        saldoRestante={saldoRestante}
        loading={registrando}
        onClose={() => setRegistrarOpen(false)}
        onSubmit={handleRegistrar}
      />

      <MotivoDialog
        open={!!estornando}
        title="Estornar recebimento"
        description={`Tem certeza que deseja estornar o recebimento de ${estornando ? formatCurrency(estornando.valor) : ""}?`}
        confirmLabel="Estornar"
        loading={estornandoLoading}
        onCancel={() => setEstornando(null)}
        onConfirm={handleEstornar}
      />

      <MotivoDialog
        open={cancelarOpen}
        title="Cancelar conta a receber"
        description="Tem certeza que deseja cancelar esta conta? Essa ação não pode ser desfeita."
        confirmLabel="Cancelar Conta"
        loading={cancelando}
        onCancel={() => setCancelarOpen(false)}
        onConfirm={handleCancelar}
      />
    </div>
  );
}
