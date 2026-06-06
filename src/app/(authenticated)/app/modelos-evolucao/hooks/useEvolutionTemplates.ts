"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryKeys";
import {
  createEvolutionTemplate,
  createEvolutionTemplateField,
  deleteEvolutionTemplate,
  deleteEvolutionTemplateField,
  getEvolutionTemplateById,
  getEvolutionTemplateFields,
  getEvolutionTemplates,
  updateEvolutionTemplate,
  updateEvolutionTemplateField,
} from "@/services/evolution/evolution.service";
import {
  EvolutionTemplateFieldPayload,
  EvolutionTemplateFieldUpdatePayload,
  EvolutionTemplatePayload,
  EvolutionTemplateUpdatePayload,
} from "@/types/evolution";

export function useEvolutionTemplates(page: number, pageSize: number) {
  const params = { page, pageSize };

  return useQuery({
    queryKey: queryKeys.evolution.templates.list(params),
    queryFn: () => getEvolutionTemplates(params),
  });
}

export function useEvolutionTemplate(templateId: number | null) {
  return useQuery({
    queryKey: templateId ? queryKeys.evolution.templates.detail(templateId) : ["evolution", "templates", "empty"],
    queryFn: () => getEvolutionTemplateById(templateId as number),
    enabled: !!templateId,
  });
}

export function useEvolutionTemplateFields(templateId: number | null) {
  return useQuery({
    queryKey: templateId ? queryKeys.evolution.templates.fields(templateId) : ["evolution", "templates", "fields", "empty"],
    queryFn: () => getEvolutionTemplateFields(templateId as number),
    enabled: !!templateId,
  });
}

export function useEvolutionTemplateMutations() {
  const queryClient = useQueryClient();

  const invalidateTemplates = async (templateId?: number) => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.evolution.templates.all });
    if (templateId) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.evolution.templates.detail(templateId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.evolution.templates.fields(templateId) });
    }
  };

  const createTemplate = useMutation({
    mutationFn: (payload: EvolutionTemplatePayload) => createEvolutionTemplate(payload),
    onSuccess: async () => invalidateTemplates(),
  });

  const updateTemplate = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EvolutionTemplateUpdatePayload }) =>
      updateEvolutionTemplate(id, payload),
    onSuccess: async (_, variables) => invalidateTemplates(variables.id),
  });

  const deleteTemplate = useMutation({
    mutationFn: (id: number) => deleteEvolutionTemplate(id),
    onSuccess: async () => invalidateTemplates(),
  });

  const createField = useMutation({
    mutationFn: ({ templateId, payload }: { templateId: number; payload: EvolutionTemplateFieldPayload }) =>
      createEvolutionTemplateField(templateId, payload),
    onSuccess: async (_, variables) => invalidateTemplates(variables.templateId),
  });

  const updateField = useMutation({
    mutationFn: ({ fieldId, payload }: { fieldId: number; payload: EvolutionTemplateFieldUpdatePayload }) =>
      updateEvolutionTemplateField(fieldId, payload),
    onSuccess: async () => invalidateTemplates(),
  });

  const deleteField = useMutation({
    mutationFn: (fieldId: number) => deleteEvolutionTemplateField(fieldId),
    onSuccess: async () => invalidateTemplates(),
  });

  return {
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createField,
    updateField,
    deleteField,
  };
}
