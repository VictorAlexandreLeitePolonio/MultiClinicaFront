"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Column, DataTable } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { EvolutionTemplateField, EvolutionTemplateFieldPayload } from "@/types/evolution";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  useEvolutionTemplate,
  useEvolutionTemplateFields,
  useEvolutionTemplateMutations,
} from "../hooks/useEvolutionTemplates";
import { EvolutionTemplateFieldForm } from "./EvolutionTemplateFieldForm";
import { EvolutionTemplateForm } from "./EvolutionTemplateForm";

interface EvolutionTemplateDetailsProps {
  id: number;
  onBack: () => void;
  onSave: () => void;
}

const fieldTypeLabels: Record<string, string> = {
  Number: "Número",
  Scale: "Escala",
  Percentage: "Percentual",
  Boolean: "Sim/Não",
  Text: "Texto",
  SelectScore: "Score",
};

const fieldUnitLabels: Record<string, string> = {
  None: "Sem unidade",
  Points: "Pontos",
  Percentage: "%",
  Kg: "kg",
  G: "g",
  Mg: "mg",
  Cm: "cm",
  Mm: "mm",
  M: "m",
  Degrees: "Graus",
  Seconds: "Segundos",
  Minutes: "Minutos",
  Hours: "Horas",
  Days: "Dias",
  Repetitions: "Repetições",
  Liters: "Litros",
  Ml: "ml",
  Score: "Score",
};

export function EvolutionTemplateDetails({ id, onBack, onSave }: EvolutionTemplateDetailsProps) {
  const { user } = useAuth();
  const canEdit = user?.role === "Administrador";
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [editingField, setEditingField] = useState<EvolutionTemplateField | null>(null);
  const [fieldToDelete, setFieldToDelete] = useState<EvolutionTemplateField | null>(null);
  const { data: template, isLoading: loadingTemplate, error: templateError } = useEvolutionTemplate(id);
  const { data: fields = [], isLoading: loadingFields, error: fieldsError, refetch } = useEvolutionTemplateFields(id);
  const { updateTemplate, createField, updateField, deleteField } = useEvolutionTemplateMutations();

  const columns: Column<EvolutionTemplateField>[] = [
    { key: "label", label: "Campo" },
    { key: "type", label: "Tipo", render: (field) => fieldTypeLabels[field.type] },
    { key: "unit", label: "Unidade", render: (field) => fieldUnitLabels[field.unit] ?? field.unit },
    { key: "required", label: "Obrigatório", render: (field) => field.required ? "Sim" : "Não" },
    {
      key: "isActive",
      label: "Status",
      render: (field) => (
        <StatusBadge
          status={field.isActive ? "Active" : "Inactive"}
          mapping={{
            Active: { label: "Ativo", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
            Inactive: { label: "Inativo", className: "border-slate-200 bg-slate-50 text-slate-600" },
          }}
        />
      ),
    },
    ...(canEdit
      ? [{
          key: "actions",
          label: "",
          className: "text-right",
          render: (field: EvolutionTemplateField) => (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingField(field);
                  setShowFieldForm(true);
                }}
                className="rounded-xl border border-[#d7f3ea] px-3 py-2 text-xs font-semibold text-[#0f766e] hover:bg-[#ecfdf5] dark:border-slate-800"
              >
                Editar
              </button>
              {field.isActive && (
                <button
                  type="button"
                  onClick={() => setFieldToDelete(field)}
                  className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ),
        } satisfies Column<EvolutionTemplateField>]
      : []),
  ];

  const handleTemplateSubmit = async (data: { name: string; description?: string; category?: string; isDefault: boolean }) => {
    try {
      await updateTemplate.mutateAsync({
        id,
        payload: {
          name: data.name,
          description: data.description || null,
          category: data.category || null,
          isDefault: data.isDefault,
        },
      });
      toast.success("Modelo atualizado com sucesso.");
      onSave();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao salvar modelo."));
    }
  };

  const handleFieldSubmit = async (data: EvolutionTemplateFieldPayload) => {
    try {
      const payload = {
        ...data,
        unit: data.unit || "None",
        optionsJson: data.optionsJson || null,
      };

      if (editingField) {
        await updateField.mutateAsync({ fieldId: editingField.id, payload });
        toast.success("Campo atualizado com sucesso.");
      } else {
        await createField.mutateAsync({ templateId: id, payload });
        toast.success("Campo criado com sucesso.");
      }

      setShowFieldForm(false);
      setEditingField(null);
      await refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao salvar campo."));
    }
  };

  const handleDeleteField = async () => {
    if (!fieldToDelete) return;
    try {
      await deleteField.mutateAsync(fieldToDelete.id);
      toast.success("Campo desativado com sucesso.");
      setFieldToDelete(null);
      await refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao desativar campo."));
    }
  };

  if (templateError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Modelo de evolução" onBack={onBack} />
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Erro ao carregar modelo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={template?.name ?? "Modelo de evolução"} onBack={onBack} />

      <div className="rounded-2xl border border-[#d7f3ea] bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        {loadingTemplate ? (
          <p className="text-sm text-[#64748b] dark:text-slate-300">Carregando modelo...</p>
        ) : (
          <EvolutionTemplateForm
            template={template}
            readOnly={!canEdit}
            loading={updateTemplate.isPending}
            onSubmit={handleTemplateSubmit}
          />
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Campos dinâmicos</h2>
            <p className="text-sm text-[#64748b] dark:text-slate-300">
              Campos inativos seguem visíveis para leitura histórica.
            </p>
          </div>
          {canEdit && (
            <div className="max-w-56">
              <Button onClick={() => {
                setEditingField(null);
                setShowFieldForm((current) => !current);
              }}>
                <Plus size={16} className="mr-2" />Novo campo
              </Button>
            </div>
          )}
        </div>

        {showFieldForm && canEdit && (
          <EvolutionTemplateFieldForm
            field={editingField}
            loading={createField.isPending || updateField.isPending}
            onSubmit={handleFieldSubmit}
            onCancel={() => {
              setShowFieldForm(false);
              setEditingField(null);
            }}
          />
        )}

        <DataTable
          columns={columns}
          data={fields}
          loading={loadingFields}
          error={fieldsError ? "Erro ao carregar campos." : null}
          onRetry={refetch}
          emptyMessage="Nenhum campo cadastrado para este modelo."
          keyExtractor={(field) => field.id}
        />
      </div>

      <DeleteConfirmDialog
        open={!!fieldToDelete}
        entityLabel="campo de evolução"
        name={fieldToDelete?.label ?? ""}
        loading={deleteField.isPending}
        onClose={() => setFieldToDelete(null)}
        onConfirm={handleDeleteField}
      />
    </div>
  );
}
