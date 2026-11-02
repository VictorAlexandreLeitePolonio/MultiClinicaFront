"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mercadoPagoKeys } from "@/lib/queryKeys";
import type { MercadoPagoStatus } from "@/types/mercadoPago";
import {
  connectMercadoPago,
  disconnectMercadoPago,
  getMercadoPagoStatus,
  updateMercadoPagoSettings,
} from "../services/mercadopago.service";

export function useMercadoPagoStatus() {
  return useQuery({ queryKey: mercadoPagoKeys.status, queryFn: getMercadoPagoStatus, retry: false });
}

export function useConnectMercadoPago() {
  return useMutation({ mutationFn: connectMercadoPago });
}

export function useUpdateMercadoPagoSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMercadoPagoSettings,
    onSuccess: (_data, settings) =>
      queryClient.setQueryData<MercadoPagoStatus>(mercadoPagoKeys.status, (current) =>
        current ? { ...current, ...settings } : current,
      ),
  });
}

export function useDisconnectMercadoPago() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectMercadoPago,
    onSuccess: () =>
      queryClient.setQueryData<MercadoPagoStatus>(mercadoPagoKeys.status, (current) =>
        current ? { ...current, connected: false, revoked: false, liveMode: false } : current,
      ),
  });
}
