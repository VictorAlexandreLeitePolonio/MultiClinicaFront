"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency } from "@/utils/formatters";
import { METRIC_LABELS, PLAN_LABELS } from "@/utils/plans";
import type { BillingCycle, ClinicPlan, PurchaseItem } from "@/types/plans";
import {
  useBillingStatus,
  useCancelSubscription,
  useChangeSubscription,
  useCheckout,
  usePublicPlans,
  usePurchase,
  useUsage,
} from "../hooks/useBilling";
import { PlanComparison } from "./PlanComparison";
import { UsageBars } from "./UsageBars";

type PaidPlan = Exclude<ClinicPlan, "Free">;

const CYCLE_LABELS: Record<BillingCycle, string> = { Monthly: "Mensal", Annual: "Anual" };

function isPaidPlan(value: string | null): value is PaidPlan {
  return value === "Pro" || value === "Premium";
}

function isBillingCycle(value: string | null): value is BillingCycle {
  return value === "Monthly" || value === "Annual";
}

export function PlanPage() {
  const searchParams = useSearchParams();
  const plansQuery = usePublicPlans();
  const statusQuery = useBillingStatus();
  const usageQuery = useUsage();
  const checkout = useCheckout();
  const change = useChangeSubscription();
  const cancel = useCancelSubscription();
  const buy = usePurchase();

  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const autoCheckoutStarted = useRef(false);
  const successHandled = useRef(false);
  const statusRef = useRef(statusQuery.data);
  const refetchStatus = statusQuery.refetch;

  useEffect(() => {
    statusRef.current = statusQuery.data;
  }, [statusQuery.data]);

  const requestedPlan = searchParams.get("assinar");
  const requestedCycle = searchParams.get("ciclo");
  const checkoutSuccess = searchParams.get("checkout") === "success";
  const startCheckout = checkout.mutateAsync;

  useEffect(() => {
    if (!statusQuery.isSuccess || !statusQuery.data) return;
    if (autoCheckoutStarted.current || !isPaidPlan(requestedPlan) || !isBillingCycle(requestedCycle)) return;
    if (statusQuery.data.isFounder || statusQuery.data.hasSubscription) return;

    autoCheckoutStarted.current = true;
    void startCheckout({ plan: requestedPlan, cycle: requestedCycle }).catch((error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível iniciar a assinatura."));
    });
  }, [statusQuery.isSuccess, statusQuery.data, requestedPlan, requestedCycle, startCheckout]);

  useEffect(() => {
    if (!checkoutSuccess || !statusQuery.isSuccess || successHandled.current) return;

    successHandled.current = true;
    const initialPlan = statusRef.current?.plan;
    toast.success("Pagamento recebido. Seu plano será atualizado em instantes.");

    let attempts = 0;
    const interval = window.setInterval(() => {
      attempts += 1;
      if (statusRef.current?.plan !== initialPlan || attempts >= 10) {
        window.clearInterval(interval);
        return;
      }
      void refetchStatus();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [checkoutSuccess, statusQuery.isSuccess, refetchStatus]);

  if (statusQuery.isLoading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
        <Skeleton className="h-12" />
        <Skeleton className="h-48" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (statusQuery.isError || !statusQuery.data) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
        <PageHeader title="Plano e assinatura" />
        <ErrorState
          message={getApiErrorMessage(statusQuery.error, "Não foi possível carregar o plano da clínica.")}
          onRetry={() => void statusQuery.refetch()}
        />
      </div>
    );
  }

  const status = statusQuery.data;
  const plans = plansQuery.data?.plans ?? [];
  const currentPlan = plans.find((plan) => plan.plan === status.plan);

  const handleCancel = async () => {
    try {
      await cancel.mutateAsync();
      setConfirmingCancel(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível cancelar a assinatura."));
    }
  };

  const handlePurchase = async (item: PurchaseItem) => {
    try {
      await buy.mutateAsync(item);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível iniciar a compra."));
    }
  };

  const hasEmptyUsage = usageQuery.data?.metrics.every((metric) => metric.total === 0) ?? false;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
      <Link
        href="/app/configuracoes"
        className="w-fit text-sm font-medium text-[#0f766e] hover:underline dark:text-[#67e8f9]"
      >
        ← Voltar para configurações
      </Link>

      <PageHeader title="Plano e assinatura" />

      <section className="rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b] dark:text-slate-400">
              Plano atual
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-[#0f172a] dark:text-white">{PLAN_LABELS[status.plan]}</h2>
              {status.isFounder && (
                <span className="rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-semibold text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]">
                  Fundadora
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-[#64748b] dark:text-slate-300">
              {status.isFounder
                ? "Premium de cortesia para sempre."
                : status.billingCycle
                  ? `Ciclo ${CYCLE_LABELS[status.billingCycle]}.`
                  : "Sem assinatura ativa."}
            </p>
            <p className="mt-2 text-sm text-[#0f172a] dark:text-slate-200">
              Profissionais ativos: {status.activeProfessionals} de{" "}
              {status.professionalLimit ?? "∞"}
            </p>
          </div>

          {status.hasSubscription && !status.isFounder && (
            <div className="max-w-sm">
              {confirmingCancel ? (
                <div className="space-y-3">
                  <p className="text-sm text-[#64748b] dark:text-slate-300">
                    Sua clínica volta para o Free agora e profissionais acima do limite serão desativados.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={cancel.isPending}
                      onClick={() => void handleCancel()}
                      className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                    >
                      Confirmar cancelamento
                    </button>
                    <button
                      type="button"
                      disabled={cancel.isPending}
                      onClick={() => setConfirmingCancel(false)}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingCancel(true)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancelar assinatura
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="planos-disponiveis" className="space-y-4">
        <div>
          <h2 id="planos-disponiveis" className="text-lg font-bold text-[#0f172a] dark:text-white">
            Planos disponíveis
          </h2>
          <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
            Compare o que cada plano libera e escolha o ciclo de cobrança.
          </p>
        </div>

        {plansQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        ) : plansQuery.isError ? (
          <ErrorState
            message={getApiErrorMessage(plansQuery.error, "Não foi possível carregar os planos.")}
            onRetry={() => void plansQuery.refetch()}
          />
        ) : plans.length === 0 ? (
          <EmptyState title="Nenhum plano disponível" />
        ) : (
          <PlanComparison
            plans={plans}
            status={status}
            pending={checkout.isPending || change.isPending}
            onCheckout={(plan, cycle) => checkout.mutate({ plan, cycle })}
            onChange={(plan, cycle) => change.mutate({ plan, cycle })}
          />
        )}
      </section>

      {currentPlan && !status.isFounder && (
        <section aria-labelledby="compras-avulsas" className="space-y-4">
          <h2 id="compras-avulsas" className="text-lg font-bold text-[#0f172a] dark:text-white">
            Compras avulsas
          </h2>

          {status.extraProfessionals < currentPlan.maxExtraProfessionals && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h3 className="font-semibold text-[#0f172a] dark:text-white">Vaga de profissional extra</h3>
                <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
                  Pagamento único e permanente.
                </p>
              </div>
              <button
                type="button"
                disabled={buy.isPending}
                onClick={() => void handlePurchase("extra-professional")}
                className="rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#115e59] disabled:opacity-60"
              >
                Comprar vaga de profissional ({formatCurrency(plansQuery.data?.extraProfessionalPrice ?? 0)}, pagamento único)
              </button>
            </div>
          )}

          {plansQuery.data?.packs
            .filter((pack) => pack.plan === status.plan)
            .map((pack) => (
              <div
                key={pack.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <h3 className="font-semibold text-[#0f172a] dark:text-white">
                    +{pack.amount} {METRIC_LABELS[pack.metric].toLowerCase()}
                  </h3>
                  <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
                    {formatCurrency(pack.price)} · Válido até o fim deste mês
                  </p>
                </div>
                <button
                  type="button"
                  disabled={buy.isPending}
                  onClick={() => void handlePurchase(`pack:${pack.id}`)}
                  className="rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#115e59] disabled:opacity-60"
                >
                  Comprar pacote
                </button>
              </div>
            ))}
        </section>
      )}

      <section aria-labelledby="uso-do-plano" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="uso-do-plano" className="text-lg font-bold text-[#0f172a] dark:text-white">
            Uso do plano
          </h2>
          {usageQuery.data && (
            <span className="text-sm text-[#64748b] dark:text-slate-400">{usageQuery.data.period}</span>
          )}
        </div>

        <div className="rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {usageQuery.isLoading ? (
            <Skeleton className="h-24" />
          ) : usageQuery.isError ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-[#64748b] dark:text-slate-300">Não foi possível carregar o uso do plano.</p>
              <button
                type="button"
                onClick={() => void usageQuery.refetch()}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Tentar novamente
              </button>
            </div>
          ) : usageQuery.data && !hasEmptyUsage ? (
            <UsageBars usage={usageQuery.data} />
          ) : (
            <p className="text-sm text-[#64748b] dark:text-slate-300">
              Seu plano não inclui cotas de uso.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
