"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryKeys";
import {
  createPatientEvolution,
  createPatientTreatment,
  deletePatientEvolution,
  getPatientEvolutions,
  getPatientTreatments,
  getTreatmentProgress,
  updatePatientEvolution,
  updatePatientTreatment,
} from "@/services/evolution/evolution.service";
import {
  PatientEvolutionPayload,
  PatientEvolutionUpdatePayload,
  PatientTreatmentPayload,
  PatientTreatmentUpdatePayload,
} from "@/types/evolution";

export function usePatientTreatments(patientId: number) {
  return useQuery({
    queryKey: queryKeys.evolution.patientTreatments(patientId),
    queryFn: () => getPatientTreatments(patientId),
  });
}

export function usePatientEvolutions(patientId: number, treatmentId: number | null, page: number, pageSize: number) {
  const params = { page, pageSize };

  return useQuery({
    queryKey: treatmentId
      ? queryKeys.evolution.patientEvolutions(patientId, treatmentId, params)
      : ["evolution", "patients", patientId, "evolutions", "empty"],
    queryFn: () => getPatientEvolutions(patientId, treatmentId as number, params),
    enabled: !!treatmentId,
  });
}

export function useTreatmentProgress(patientId: number, treatmentId: number | null) {
  return useQuery({
    queryKey: treatmentId
      ? queryKeys.evolution.treatmentProgress(patientId, treatmentId)
      : ["evolution", "patients", patientId, "progress", "empty"],
    queryFn: () => getTreatmentProgress(patientId, treatmentId as number),
    enabled: !!treatmentId,
  });
}

export function usePatientEvolutionMutations(patientId: number) {
  const queryClient = useQueryClient();

  const invalidatePatientEvolution = async (treatmentId?: number) => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.evolution.patientTreatments(patientId) });
    if (treatmentId) {
      await queryClient.invalidateQueries({
        queryKey: ["evolution", "patients", patientId, "treatments", treatmentId],
      });
    }
    await queryClient.invalidateQueries({ queryKey: queryKeys.evolution.dashboardSummary });
  };

  const createTreatment = useMutation({
    mutationFn: (payload: PatientTreatmentPayload) => createPatientTreatment(patientId, payload),
    onSuccess: async () => invalidatePatientEvolution(),
  });

  const updateTreatment = useMutation({
    mutationFn: ({ treatmentId, payload }: { treatmentId: number; payload: PatientTreatmentUpdatePayload }) =>
      updatePatientTreatment(patientId, treatmentId, payload),
    onSuccess: async (_, variables) => invalidatePatientEvolution(variables.treatmentId),
  });

  const createEvolution = useMutation({
    mutationFn: ({ treatmentId, payload }: { treatmentId: number; payload: PatientEvolutionPayload }) =>
      createPatientEvolution(patientId, treatmentId, payload),
    onSuccess: async (_, variables) => invalidatePatientEvolution(variables.treatmentId),
  });

  const updateEvolution = useMutation({
    mutationFn: ({
      treatmentId,
      evolutionId,
      payload,
    }: {
      treatmentId: number;
      evolutionId: number;
      payload: PatientEvolutionUpdatePayload;
    }) => updatePatientEvolution(patientId, treatmentId, evolutionId, payload),
    onSuccess: async (_, variables) => invalidatePatientEvolution(variables.treatmentId),
  });

  const deleteEvolution = useMutation({
    mutationFn: ({ treatmentId, evolutionId }: { treatmentId: number; evolutionId: number }) =>
      deletePatientEvolution(patientId, treatmentId, evolutionId),
    onSuccess: async (_, variables) => invalidatePatientEvolution(variables.treatmentId),
  });

  return {
    createTreatment,
    updateTreatment,
    createEvolution,
    updateEvolution,
    deleteEvolution,
  };
}
