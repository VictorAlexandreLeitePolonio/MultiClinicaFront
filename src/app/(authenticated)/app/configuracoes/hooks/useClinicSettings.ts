"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clinicSettingsKeys } from "@/lib/queryKeys";
import {
  getClinicSettings,
  updateClinicSettings,
} from "../services/clinic-settings.service";
import { UpdateClinicSettingsRequest } from "@/types";

export function useClinicSettings(enabled = true) {
  return useQuery({
    queryKey: clinicSettingsKeys.detail(),
    queryFn: getClinicSettings,
    enabled,
  });
}

export function useUpdateClinicSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateClinicSettingsRequest) => updateClinicSettings(payload),
    onSuccess: (settings) => {
      queryClient.setQueryData(clinicSettingsKeys.detail(), settings);
      void queryClient.invalidateQueries({ queryKey: clinicSettingsKeys.all });
    },
  });
}
