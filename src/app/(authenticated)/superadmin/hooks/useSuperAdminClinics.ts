"use client";

import { useQuery } from "@tanstack/react-query";
import { getSuperAdminClinics, GetSuperAdminClinicsParams } from "@/services/superadmin/clinics.service";
import { queryKeys } from "@/services/queryKeys";

export function useSuperAdminClinics(params: GetSuperAdminClinicsParams) {
  return useQuery({
    queryKey: queryKeys.superAdmin.clinics(params),
    queryFn: () => getSuperAdminClinics(params),
  });
}
