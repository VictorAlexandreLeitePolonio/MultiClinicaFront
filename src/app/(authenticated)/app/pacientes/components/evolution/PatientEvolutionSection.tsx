"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FileText, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Column, DataTable } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useEvolutionTemplateFields, useEvolutionTemplates } from "@/app/(authenticated)/app/modelos-evolucao/hooks/useEvolutionTemplates";
import { usePatientEvolutionMutations, usePatientEvolutions, usePatientTreatments, useTreatmentProgress } from "../../hooks/evolution/usePatientEvolution";
import { PatientEvolution, PatientTreatment } from "@/types/evolution";
import { formatDate } from "@/utils/formatters";
import { getApiErrorMessage } from "@/utils/apiError";
import { PatientEvolutionForm } from "./PatientEvolutionForm";
import { PatientTreatmentForm } from "./PatientTreatmentForm";
import { TreatmentProgressPanel } from "./TreatmentProgressPanel";
import { PatientEvolutionPayload } from "@/types/evolution";

interface PatientEvolutionSectionProps {
  patientId: number;
}

const treatmentStatusMapping = {
  Active: { label: "Ativo", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  Paused: { label: "Pausado", className: "border-amber-200 bg-amber-50 text-amber-700" },
  Completed: { label: "Concluído", className: "border-blue-200 bg-blue-50 text-blue-700" },
  Canceled: { label: "Cancelado", className: "border-red-200 bg-red-50 text-red-700" },
};

const evolutionStatusMapping = {
  Draft: { label: "Rascunho", className: "border-amber-200 bg-amber-50 text-amber-700" },
  Completed: { label: "Concluída", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  Canceled: { label: "Cancelada", className: "border-red-200 bg-red-50 text-red-700" },
};

export function PatientEvolutionSection({ patientId }: PatientEvolutionSectionProps) {
  const { user } = useAuth();
  const canWrite = user?.role === "Administrador" || user?.role === "Profissional";
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<number | null>(null);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [showEvolutionForm, setShowEvolutionForm] = useState(false);
  const [editingEvolution, setEditingEvolution] = useState<PatientEvolution | null>(null);
  const [evolutionToDelete, setEvolutionToDelete] = useState<PatientEvolution | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: treatments = [], isLoading: loadingTreatments, error: treatmentsError } = usePatientTreatments(patientId);
  const { data: templatesResult, isLoading: loadingTemplates } = useEvolutionTemplates(1, 100);
  const templates = useMemo(
    () => (templatesResult?.data ?? []).filter((template) => template.isActive),
    [templatesResult],
  );
  const effectiveSelectedTreatmentId = selectedTreatmentId ?? treatments[0]?.id ?? null;
  const selectedTreatment = treatments.find((treatment) => treatment.id === effectiveSelectedTreatmentId) ?? null;
  const { data: fields = [], isLoading: loadingFields } = useEvolutionTemplateFields(selectedTreatment?.templateId ?? null);
  const { data: evolutionsResult, isLoading: loadingEvolutions, error: evolutionsError, refetch: refetchEvolutions } =
    usePatientEvolutions(patientId, effectiveSelectedTreatmentId, page, pageSize);
  const { data: progress, isLoading: loadingProgress, error: progressError } = useTreatmentProgress(patientId, effectiveSelectedTreatmentId);
  const mutations = usePatientEvolutionMutations(patientId);

  const selectTreatment = (treatmentId: number) => {
    setSelectedTreatmentId(treatmentId);
    setPage(1);
    setShowEvolutionForm(false);
    setEditingEvolution(null);
  };

  const treatmentColumns: Column<PatientTreatment>[] = [
    { key: "title", label: "Acompanhamento" },
    { key: "startedAt", label: "Início", render: (treatment) => formatDate(treatment.startedAt) },
    {
      key: "status",
      label: "Status",
      render: (treatment) => <StatusBadge status={treatment.status} mapping={treatmentStatusMapping} />,
    },
  ];

  const evolutionColumns: Column<PatientEvolution>[] = [
    { key: "date", label: "Data", render: (evolution) => formatDate(evolution.date) },
    {
      key: "status",
      label: "Status",
      render: (evolution) => <StatusBadge status={evolution.status} mapping={evolutionStatusMapping} />,
    },
    { key: "description", label: "Descrição", render: (evolution) => evolution.description || "-" },
    { key: "conduct", label: "Conduta", render: (evolution) => evolution.conduct || "-" },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (evolution) => canWrite ? (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingEvolution(evolution);
              setShowEvolutionForm(true);
            }}
            className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-primary-dark hover:bg-sidebar-active dark:border-slate-800"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => setEvolutionToDelete(evolution)}
            className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : null,
    },
  ];

  const handleCreateTreatment = async (data: { templateId: number; title: string; description?: string; startedAt?: string }) => {
    try {
      const treatment = await mutations.createTreatment.mutateAsync({
        templateId: data.templateId,
        title: data.title,
        description: data.description || null,
        startedAt: data.startedAt ? new Date(data.startedAt).toISOString() : null,
      });
      toast.success("Acompanhamento criado com sucesso.");
      setShowTreatmentForm(false);
      selectTreatment(treatment.id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao criar acompanhamento."));
    }
  };

  const handleEvolutionSubmit = async (payload: PatientEvolutionPayload) => {
    if (!effectiveSelectedTreatmentId) return;
    try {
      if (editingEvolution) {
        await mutations.updateEvolution.mutateAsync({
          treatmentId: effectiveSelectedTreatmentId,
          evolutionId: editingEvolution.id,
          payload: { ...payload, values: payload.values },
        });
        toast.success("Evolução atualizada com sucesso.");
      } else {
        await mutations.createEvolution.mutateAsync({ treatmentId: effectiveSelectedTreatmentId, payload });
        toast.success("Evolução registrada com sucesso.");
      }
      setShowEvolutionForm(false);
      setEditingEvolution(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao salvar evolução."));
    }
  };

  const handleDeleteEvolution = async () => {
    if (!effectiveSelectedTreatmentId || !evolutionToDelete) return;
    try {
      await mutations.deleteEvolution.mutateAsync({
        treatmentId: effectiveSelectedTreatmentId,
        evolutionId: evolutionToDelete.id,
      });
      toast.success("Evolução removida com sucesso.");
      setEvolutionToDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao remover evolução."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-secondary dark:text-white">Acompanhamentos</h2>
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Histórico de evolução clínica do paciente.
          </p>
        </div>
        {canWrite && (
          <div className="max-w-64">
            <Button
              onClick={() => setShowTreatmentForm((current) => !current)}
              disabled={loadingTemplates || templates.length === 0}
            >
              <Plus size={16} className="mr-2" />Novo acompanhamento
            </Button>
          </div>
        )}
      </div>

      {showTreatmentForm && canWrite && (
        <PatientTreatmentForm
          templates={templates}
          loading={mutations.createTreatment.isPending}
          onSubmit={handleCreateTreatment}
          onCancel={() => setShowTreatmentForm(false)}
        />
      )}

      <DataTable
        columns={treatmentColumns}
        data={treatments}
        loading={loadingTreatments}
        error={treatmentsError ? "Erro ao carregar acompanhamentos." : null}
        emptyMessage="Nenhum acompanhamento encontrado."
        keyExtractor={(treatment) => treatment.id}
        onRowClick={(treatment) => selectTreatment(treatment.id)}
      />

      {selectedTreatment && (
        <div className="space-y-5 rounded-2xl border border-gray-200 bg-background p-5 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary-dark" />
                <h3 className="text-lg font-bold text-secondary dark:text-white">{selectedTreatment.title}</h3>
                <StatusBadge status={selectedTreatment.status} mapping={treatmentStatusMapping} />
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
                Iniciado em {formatDate(selectedTreatment.startedAt)}
                {selectedTreatment.endedAt ? ` · Encerrado em ${formatDate(selectedTreatment.endedAt)}` : ""}
              </p>
              {selectedTreatment.description && (
                <p className="mt-2 text-sm text-secondary dark:text-white">{selectedTreatment.description}</p>
              )}
            </div>

            {canWrite && (
              <div className="max-w-56">
                <Button onClick={() => {
                  setEditingEvolution(null);
                  setShowEvolutionForm((current) => !current);
                }}>
                  <Plus size={16} className="mr-2" />Nova evolução
                </Button>
              </div>
            )}
          </div>

          <TreatmentProgressPanel data={progress} loading={loadingProgress} error={!!progressError} />

          {showEvolutionForm && canWrite && (
            <PatientEvolutionForm
              key={`${editingEvolution?.id ?? "new"}-${fields.map((field) => field.id).join("-")}`}
              fields={fields}
              evolution={editingEvolution}
              loading={mutations.createEvolution.isPending || mutations.updateEvolution.isPending || loadingFields}
              onSubmit={handleEvolutionSubmit}
              onCancel={() => {
                setShowEvolutionForm(false);
                setEditingEvolution(null);
              }}
            />
          )}

          <DataTable
            columns={evolutionColumns}
            data={evolutionsResult?.data ?? []}
            loading={loadingEvolutions}
            error={evolutionsError ? "Erro ao carregar evoluções." : null}
            onRetry={refetchEvolutions}
            emptyMessage="Nenhuma evolução registrada neste acompanhamento."
            keyExtractor={(evolution) => evolution.id}
          />

          <Pagination
            page={page}
            totalPages={evolutionsResult?.totalPages ?? 1}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      <DeleteConfirmDialog
        open={!!evolutionToDelete}
        entityLabel="evolução"
        name={evolutionToDelete ? formatDate(evolutionToDelete.date) : ""}
        loading={mutations.deleteEvolution.isPending}
        onClose={() => setEvolutionToDelete(null)}
        onConfirm={handleDeleteEvolution}
      />
    </div>
  );
}
