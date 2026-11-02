"use client";

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  getPaymentLink,
  refundDuplicate,
  refundPayment,
  sendPaymentCharge,
} from "../services/online-payment.service";

function invalidatePayment(queryClient: QueryClient, paymentId: number) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.payments.detail(paymentId) }),
  ]);
}

export function useSendPaymentCharge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendPaymentCharge,
    onSuccess: (_data, paymentId) => invalidatePayment(queryClient, paymentId),
  });
}

export function usePaymentLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: getPaymentLink,
    onSuccess: (_data, paymentId) => invalidatePayment(queryClient, paymentId),
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: refundPayment,
    onSuccess: (_data, paymentId) => invalidatePayment(queryClient, paymentId),
  });
}

export function useRefundDuplicatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: refundDuplicate,
    onSuccess: (_data, paymentId) => invalidatePayment(queryClient, paymentId),
  });
}
