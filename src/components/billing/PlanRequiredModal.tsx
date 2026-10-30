"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  BillingLimitError,
  FEATURE_LABELS,
  PLAN_LABELS,
  PLAN_REQUIRED_EVENT,
} from "@/lib/plans";

const PLAN_PAGE = "/app/configuracoes/plano";

export function PlanRequiredModal() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<BillingLimitError | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const handlePlanRequired = (event: Event) => {
      const detail = (event as CustomEvent<BillingLimitError>).detail;
      if (!detail || (detail.code !== "PLAN_REQUIRED" && detail.code !== "PROFESSIONAL_LIMIT")) return;
      setError(detail);
      setOpen(true);
    };

    window.addEventListener(PLAN_REQUIRED_EVENT, handlePlanRequired);
    return () => window.removeEventListener(PLAN_REQUIRED_EVENT, handlePlanRequired);
  }, []);

  if (!error) return null;

  const title =
    error.code === "PLAN_REQUIRED"
      ? `Recurso do plano ${PLAN_LABELS[error.requiredPlan]}`
      : `Limite de ${error.limit} profissional(is) atingido`;

  const description =
    error.code === "PLAN_REQUIRED"
      ? `${FEATURE_LABELS[error.feature]} está disponível a partir do plano ${PLAN_LABELS[error.requiredPlan]}.`
      : "Compre uma vaga extra ou faça upgrade para liberar mais profissionais.";

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            titleRef.current?.focus();
          }}
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900"
        >
          <Dialog.Title
            ref={titleRef}
            tabIndex={-1}
            className="text-lg font-bold text-[#0f172a] outline-none dark:text-white"
          >
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-[#64748b] dark:text-slate-300">
            {description}
          </Dialog.Description>

          <div className="mt-6 flex flex-wrap gap-3">
            {error.code === "PROFESSIONAL_LIMIT" && (
              <Dialog.Close asChild>
                <Link
                  href={PLAN_PAGE}
                  className="inline-flex items-center justify-center rounded-xl bg-[#0f766e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#115e59]"
                >
                  Comprar vaga
                </Link>
              </Dialog.Close>
            )}
            <Dialog.Close asChild>
              <Link
                href={PLAN_PAGE}
                className="inline-flex items-center justify-center rounded-xl border border-[#99f6e4] bg-white px-5 py-2.5 text-sm font-semibold text-[#0f766e] hover:bg-[#ecfdf5] dark:border-slate-700 dark:bg-slate-900 dark:text-[#67e8f9] dark:hover:bg-slate-800"
              >
                Ver planos
              </Link>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
