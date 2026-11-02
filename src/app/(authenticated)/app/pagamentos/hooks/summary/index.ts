"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  getPaymentsSummary,
  type GetPaymentsParams,
} from "../../services/payments.service";

export type PaymentsSummaryParams = Omit<
  GetPaymentsParams,
  "status" | "page" | "pageSize"
>;

/** Contagem e soma por status de todo o filtro (sem paginação) para o quadro. */
export function usePaymentsSummary(
  params: PaymentsSummaryParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.payments.summary(params),
    queryFn: () => getPaymentsSummary(params),
    enabled,
  });
}
