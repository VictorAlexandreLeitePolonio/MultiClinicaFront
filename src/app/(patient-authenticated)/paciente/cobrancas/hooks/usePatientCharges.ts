"use client";

import { useQuery } from "@tanstack/react-query";
import { patientChargeKeys } from "@/lib/queryKeys";
import { getMyCharges } from "../services/patient-charges.service";

export function useMyCharges() {
  return useQuery({ queryKey: patientChargeKeys.all, queryFn: getMyCharges });
}
