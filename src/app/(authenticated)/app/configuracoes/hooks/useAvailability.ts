"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { availabilityKeys, queryKeys } from "@/lib/queryKeys";
import { getUsers } from "../../usuarios/services/users.service";
import {
  getAvailabilitySettings,
  getProfessionalAvailability,
  replaceProfessionalAvailability,
  updateAvailabilitySettings,
} from "../services/availability.service";
import { AvailabilitySettings, ProfessionalAvailabilityRange } from "../types/availability.types";

export function useAvailabilitySettings() {
  return useQuery({ queryKey: availabilityKeys.settings, queryFn: getAvailabilitySettings });
}

export function useUpdateAvailabilitySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AvailabilitySettings) => updateAvailabilitySettings(payload),
    onSuccess: (settings) => queryClient.setQueryData(availabilityKeys.settings, settings),
  });
}

export function useAvailabilityProfessionals() {
  return useQuery({
    queryKey: queryKeys.users.list({ availability: true }),
    queryFn: () => getUsers({ page: 1, pageSize: 100 }),
    select: (result) => result.data.filter((user) =>
      user.role === "Profissional" || user.role === "Administrador"),
  });
}

export function useProfessionalAvailability(professionalId: number | null) {
  return useQuery({
    queryKey: availabilityKeys.professional(professionalId ?? 0),
    queryFn: () => getProfessionalAvailability(professionalId!),
    enabled: professionalId !== null,
  });
}

export function useReplaceProfessionalAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ professionalId, ranges }: {
      professionalId: number;
      ranges: ProfessionalAvailabilityRange[];
    }) => replaceProfessionalAvailability(professionalId, ranges),
    onSuccess: (ranges, variables) => {
      queryClient.setQueryData(availabilityKeys.professional(variables.professionalId), ranges);
    },
  });
}
