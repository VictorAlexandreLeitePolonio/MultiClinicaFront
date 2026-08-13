"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  getFinancialBalance,
  type GetFinancialBalanceParams,
} from "../services/financial.service";

export function useFinancialBalance(params: GetFinancialBalanceParams = {}) {
  return useQuery({
    queryKey: queryKeys.financial.balance(params),
    queryFn: () => getFinancialBalance(params),
  });
}
