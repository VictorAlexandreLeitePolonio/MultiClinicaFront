"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { whatsAppLinkKeys } from "@/lib/queryKeys";
import { createWhatsAppLink, deleteWhatsAppLink, getWhatsAppLinkStatus } from "../services/whatsapp-link.service";

export function useWhatsAppLinkStatus() {
  return useQuery({ queryKey: whatsAppLinkKeys.status, queryFn: getWhatsAppLinkStatus });
}

export function useCreateWhatsAppLink() {
  return useMutation({ mutationFn: createWhatsAppLink });
}

export function useDeleteWhatsAppLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWhatsAppLink,
    onSuccess: () => queryClient.setQueryData(whatsAppLinkKeys.status, { connected: false }),
  });
}
