"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { useAuth } from "@/contexts/AuthContext";
import {
  createSessionType as createSessionTypeRequest,
  getSessionTypes,
  type SessionType,
} from "../services/session-types.service";

const sessionTypesQueryKey = ["session-types"] as const;

export function useSessionTypes(search: string) {
  const { tenant } = useAuth();
  return useQuery({
    queryKey: [...sessionTypesQueryKey, tenant?.id, search],
    queryFn: () => getSessionTypes(search),
    enabled: tenant !== null,
  });
}

export function useCreateSessionType() {
  const queryClient = useQueryClient();
  const mutation = useApiMutation<string, SessionType>({
    mutationFn: createSessionTypeRequest,
    errorMessage: "Erro ao cadastrar tipo de sessão.",
  });

  return {
    createSessionType: async (name: string) => {
      const created = await mutation.mutate(name);
      await queryClient.invalidateQueries({ queryKey: sessionTypesQueryKey });
      return created;
    },
    isPending: mutation.isPending,
  };
}
