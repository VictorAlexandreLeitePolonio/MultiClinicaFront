"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublicClinics } from "./public-clinics.service";

export function usePublicClinics(limit = 9) {
  return useQuery({
    queryKey: ["public-clinics", limit],
    queryFn: () => getPublicClinics(limit),
  });
}
