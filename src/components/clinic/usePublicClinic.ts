"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { publicClinicKeys } from "@/lib/queryKeys";
import { getPublicClinic } from "./public-clinic.service";

export function usePublicClinic(slug: string) {
  const query = useQuery({
    queryKey: publicClinicKeys.detail(slug),
    queryFn: () => getPublicClinic(slug),
    enabled: slug.length > 0,
    retry: (failureCount, error) => {
      // Não repete em 404 (clínica inexistente, privada ou inativa).
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 1;
    },
  });

  const notFound = axios.isAxiosError(query.error) && query.error.response?.status === 404;
  return { ...query, notFound };
}
