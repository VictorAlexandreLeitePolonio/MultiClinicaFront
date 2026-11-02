"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { publicPaymentKeys } from "@/lib/queryKeys";
import {
  getPublicPayment,
  payPublicPayment,
  PublicPaymentFormData,
} from "../services/public-payment.service";

const ONGOING_MP_STATUSES = new Set(["pending", "in_process"]);

export function usePublicPayment(token: string) {
  return useQuery({
    queryKey: publicPaymentKeys.detail(token),
    queryFn: () => getPublicPayment(token),
    enabled: token.length > 0,
    // Enquanto o Pix/3DS não confirma, a página acompanha o status sozinha.
    refetchInterval: (query) => {
      const status = query.state.data?.mpStatus?.toLowerCase();
      return status && ONGOING_MP_STATUSES.has(status) ? 5000 : false;
    },
  });
}

export function usePayPublicPayment(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: PublicPaymentFormData) => payPublicPayment(token, formData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: publicPaymentKeys.detail(token) });
    },
  });
}
