"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FileText, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FormField } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormSection";
import { Skeleton } from "@/components/ui/Skeleton";
import { queryKeys } from "@/lib/queryKeys";
import { MedicalRecord } from "@/types";
import { formatDate } from "@/utils/formatters";
import { getMedicalRecords } from "@/app/(authenticated)/app/prontuarios/services/medical-records.service";
import ProntuarioDetails from "@/app/(authenticated)/app/prontuarios/components/ProntuarioDetails";
import ProntuarioForm from "@/app/(authenticated)/app/prontuarios/components/ProntuarioForm";
import { useProntuarioUpdate } from "@/app/(authenticated)/app/prontuarios/hooks/update";
import {
  ProntuarioFormData,
  ProntuarioSchema,
} from "@/app/(authenticated)/app/prontuarios/schemas/prontuario.schema";

interface Props {
  patientId: number;
  /** Controla o formulário de nova anamnese a partir do cabeçalho do prontuário. */
  creating?: boolean;
  onCreatingChange?: (creating: boolean) => void;
  /** Avaliação aberta ao clicar na linha do tempo. */
  focusRecordId?: number | null;
}

const recordListParams = (patientId: number) => ({ patientId, pageSize: 50 });

function AnamnesisEditForm({
  record,
  onCancel,
  onSaved,
}: {
  record: MedicalRecord;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { updateProntuario, isPending } = useProntuarioUpdate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProntuarioFormData>({
    resolver: zodResolver(ProntuarioSchema),
    defaultValues: {
      patientId: record.patientId,
      titulo: record.titulo ?? "",
      patologia: record.patologia ?? "",
      queixaPrincipal: record.queixaPrincipal ?? "",
      doencaAntiga: record.doencaAntiga ?? "",
      doencaAtual: record.doencaAtual ?? "",
      habitos: record.habitos ?? "",
      examesFisicos: record.examesFisicos ?? "",
      sinaisVitais: record.sinaisVitais ?? "",
      medicamentos: record.medicamentos ?? "",
      cirurgias: record.cirurgias ?? "",
      outrasDoencas: record.outrasDoencas ?? "",
      sessao: record.sessao ?? "",
      orientacaoDomiciliar: record.orientacaoDomiciliar ?? "",
    },
  });

  const onSubmit = async (data: ProntuarioFormData) => {
    const updated = await updateProntuario(record.id, {
      titulo: data.titulo,
      patologia: data.patologia,
      queixaPrincipal: data.queixaPrincipal,
      doencaAntiga: data.doencaAntiga,
      doencaAtual: data.doencaAtual,
      habitos: data.habitos,
      examesFisicos: data.examesFisicos,
      sinaisVitais: data.sinaisVitais,
      medicamentos: data.medicamentos,
      cirurgias: data.cirurgias,
      outrasDoencas: data.outrasDoencas,
      sessao: data.sessao,
      orientacaoDomiciliar: data.orientacaoDomiciliar,
    });
    if (!updated) return;
    toast.success("Anamnese atualizada com sucesso.");
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Editar anamnese</h2>
          <p className="text-sm text-[#475569] dark:text-slate-300">
            Avaliação de {formatDate(record.createdAt)} · {record.userName}
          </p>
        </div>
      </div>

      <FormSection title="Anamnese" columns={1}>
        <FormField label="Título" required error={errors.titulo?.message} {...register("titulo")} />
        <FormField label="Patologia" required error={errors.patologia?.message} {...register("patologia")} />
        <FormField
          label="Queixa principal"
          required
          error={errors.queixaPrincipal?.message}
          {...register("queixaPrincipal")}
        />
        <FormField label="Doença antiga" {...register("doencaAntiga")} />
        <FormField label="Doença atual" {...register("doencaAtual")} />
        <FormField label="Hábitos" {...register("habitos")} />
      </FormSection>

      <FormSection title="Exames e histórico">
        <FormField label="Exames físicos" {...register("examesFisicos")} />
        <FormField label="Sinais vitais" {...register("sinaisVitais")} />
        <FormField label="Medicamentos" {...register("medicamentos")} />
        <FormField label="Cirurgias" {...register("cirurgias")} />
        <FormField label="Outras doenças" {...register("outrasDoencas")} />
        <FormField label="Sessão" {...register("sessao")} />
        <FormField label="Orientação domiciliar" {...register("orientacaoDomiciliar")} />
      </FormSection>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={isPending}>
          Salvar anamnese
        </Button>
      </div>
    </form>
  );
}

export function PatientAnamnesis({
  patientId,
  creating = false,
  onCreatingChange,
  focusRecordId,
}: Props) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(() => focusRecordId ?? null);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const recordsQuery = useQuery({
    queryKey: queryKeys.medicalRecords.list(recordListParams(patientId)),
    queryFn: () => getMedicalRecords(recordListParams(patientId)),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.medicalRecords.all });
  };

  const records = [...(recordsQuery.data?.data ?? [])].sort(
    (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  );
  const latest = records[0] ?? null;
  const selected = records.find((record) => record.id === selectedId) ?? latest;

  if (recordsQuery.isPending) {
    return (
      <div className="space-y-2" aria-label="Carregando anamnese">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (recordsQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar a anamnese."
        onRetry={() => void recordsQuery.refetch()}
      />
    );
  }

  if (creating) {
    return (
      <div className="space-y-4">
        <ProntuarioForm
          preselectedPatientId={patientId}
          onBack={() => {
            onCreatingChange?.(false);
            setEditing(false);
            setDetailsOpen(true);
          }}
          onSave={() => {
            onCreatingChange?.(false);
            setSelectedId(null);
            setEditing(false);
            setDetailsOpen(true);
            invalidate();
          }}
        />
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="space-y-4">
        <EmptyState
          title="Nenhuma anamnese registrada."
          description="Registre a primeira avaliação clínica do paciente."
          icon={FileText}
        />
        <div className="flex justify-center">
          <Button fullWidth={false} onClick={() => onCreatingChange?.(true)}>
            <Plus size={16} />
            Nova anamnese
          </Button>
        </div>
      </div>
    );
  }

  if (editing && selected) {
    return (
      <AnamnesisEditForm
        record={selected}
        onCancel={() => setEditing(false)}
        onSaved={() => {
          setEditing(false);
          setDetailsOpen(true);
          invalidate();
        }}
      />
    );
  }

  if (!detailsOpen) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Avaliações</h2>
        <ul className="divide-y divide-[#e6fbf4] overflow-hidden rounded-2xl border border-[#d7f3ea] bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {records.map((record) => (
            <li key={record.id}>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(record.id);
                  setDetailsOpen(true);
                }}
                className="flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-[#ecfdf5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#99f6e4] sm:flex-row sm:items-center sm:justify-between dark:hover:bg-slate-800/70"
              >
                <span className="text-sm font-semibold text-[#0f172a] dark:text-white">{record.titulo}</span>
                <span className="text-xs text-[#475569] dark:text-slate-300">
                  {formatDate(record.createdAt)} · {record.userName}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const previous = records.filter((record) => record.id !== selected?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Anamnese</h2>
          <p className="text-sm text-[#475569] dark:text-slate-300">
            Avaliação de {formatDate(selected?.createdAt)} · {selected?.userName}
          </p>
        </div>
        <Button fullWidth={false} variant="outline" onClick={() => setEditing(true)}>
          <Pencil size={14} />
          Editar
        </Button>
      </div>

      {selected && <ProntuarioDetails id={selected.id} onBack={() => setDetailsOpen(false)} />}

      {previous.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-bold text-[#0f172a] dark:text-white">Avaliações anteriores</h3>
          <ul className="divide-y divide-[#e6fbf4] overflow-hidden rounded-2xl border border-[#d7f3ea] bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
            {previous.map((record) => (
              <li key={record.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(record.id);
                    setDetailsOpen(true);
                  }}
                  className="flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-[#ecfdf5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#99f6e4] sm:flex-row sm:items-center sm:justify-between dark:hover:bg-slate-800/70"
                >
                  <span className="text-sm font-semibold text-[#0f172a] dark:text-white">{record.titulo}</span>
                  <span className="text-xs text-[#475569] dark:text-slate-300">
                    {formatDate(record.createdAt)} · {record.userName}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
