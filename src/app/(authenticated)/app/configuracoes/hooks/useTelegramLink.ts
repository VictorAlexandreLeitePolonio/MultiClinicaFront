"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { telegramLinkKeys } from "@/lib/queryKeys";
import { createTelegramLink, deleteTelegramLink, getTelegramLinkStatus } from "../services/telegram-link.service";

export function useTelegramLinkStatus() {
  return useQuery({ queryKey: telegramLinkKeys.status, queryFn: getTelegramLinkStatus });
}

export function useCreateTelegramLink() {
  return useMutation({ mutationFn: createTelegramLink });
}

export function useDeleteTelegramLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTelegramLink,
    onSuccess: () => queryClient.setQueryData(telegramLinkKeys.status, { connected: false }),
  });
}
