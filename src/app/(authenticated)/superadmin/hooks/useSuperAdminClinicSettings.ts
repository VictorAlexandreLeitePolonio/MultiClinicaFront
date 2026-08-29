"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { superAdminClinicSettingsKeys } from "@/lib/queryKeys";
import {
  getSuperAdminClinicSettings,
  updateSuperAdminClinicSettings,
} from "../services/superadmin-clinic-settings.service";
import { UpdateClinicSettingsRequest } from "@/types";

export function useSuperAdminClinicSettings(clinicId: number, enabled = true) {
  return useQuery({
    queryKey: superAdminClinicSettingsKeys.detail(clinicId),
    queryFn: () => getSuperAdminClinicSettings(clinicId),
    enabled: enabled && Number.isFinite(clinicId) && clinicId > 0,
  });
}

export function useUpdateSuperAdminClinicSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clinicId, payload }: { clinicId: number; payload: UpdateClinicSettingsRequest }) =>
      updateSuperAdminClinicSettings(clinicId, payload),
    onSuccess: (settings) => {
      queryClient.setQueryData(
        superAdminClinicSettingsKeys.detail(settings.clinicId),
        settings,
      );
    },
  });
}
