"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import {
  MANUAL_PAYMENT_METHODS,
  ONLINE_PAYMENT_METHOD,
} from "@/app/(authenticated)/app/pagamentos/paymentMethods";
import { getPatientById } from "@/app/(authenticated)/app/pacientes/services/patients.service";
import {
  finishConsultation,
  getChargeSuggestion,
} from "@/app/(authenticated)/app/agenda/services/consultation.service";
import { consultationKeys, queryKeys } from "@/lib/queryKeys";
import { getApiErrorMessage } from "@/utils/apiError";

export interface FinishConsultationTarget {
  appointmentId: number;
  patientId: number;
  patientName: string;
  appointmentDate: string;
  timeZoneId?: string;
}

interface FinishConsultationPanelProps {
  target: FinishConsultationTarget;
  onFinished: () => void;
}

type BillingMode = "manual" | "online";

const fieldClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-secondary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

export function FinishConsultationPanel({
  target,
  onFinished,
}: FinishConsultationPanelProps) {
  const queryClient = useQueryClient();

  const [chargeEnabled, setChargeEnabled] = useState(false);
  const [planId, setPlanId] = useState(0);
  const [billingMode, setBillingMode] = useState<BillingMode>("manual");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [sendOnline, setSendOnline] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const initializedSuggestion = useRef(false);

  const suggestionQuery = useQuery({
    queryKey: consultationKeys.chargeSuggestion(target.appointmentId),
    queryFn: () => getChargeSuggestion(target.appointmentId),
    retry: false,
  });

  const patientQuery = useQuery({
    queryKey: queryKeys.patients.detail(target.patientId),
    queryFn: () => getPatientById(target.patientId),
    retry: false,
  });

  const suggestion = suggestionQuery.data;
  const alreadyCharged = Boolean(suggestion?.alreadyChargedThisMonth);
  const patientHasEmail = Boolean(patientQuery.data?.email?.trim());

  const planos = suggestion?.plans ?? [];
  const loadingPlanos = suggestionQuery.isPending;
  const onlineAvailable = Boolean(suggestion?.onlineAvailable);
  const isOnline = billingMode === "online" && onlineAvailable;

  useEffect(() => {
    if (!suggestion || initializedSuggestion.current) return;
    initializedSuggestion.current = true;
    setPlanId(suggestion.planId ?? 0);
    setChargeEnabled(Boolean(suggestion.planId) && !suggestion.alreadyChargedThisMonth);
  }, [suggestion]);

  useEffect(() => {
    if (!onlineAvailable && billingMode === "online") {
      setBillingMode("manual");
    }
  }, [onlineAvailable, billingMode]);

  useEffect(() => {
    if (isOnline) setSendOnline(patientHasEmail);
  }, [isOnline, patientHasEmail]);

  const monthLabel = useMemo(() => {
    const date = new Date(target.appointmentDate);
    if (Number.isNaN(date.getTime())) return "";
    const parts = new Intl.DateTimeFormat("pt-BR", {
      month: "2-digit",
      year: "numeric",
      timeZone: target.timeZoneId || "America/Sao_Paulo",
    }).formatToParts(date);
    const month = parts.find((part) => part.type === "month")?.value ?? "";
    const year = parts.find((part) => part.type === "year")?.value ?? "";
    return month && year ? `${month}/${year}` : "";
  }, [target.appointmentDate, target.timeZoneId]);

  const chargeReady = chargeEnabled && planId > 0 && (isOnline || Boolean(paymentMethod));
  const canSubmit = !submitting && (!chargeEnabled || chargeReady);

  async function handleFinish(withCharge: boolean) {
    if (submitting) return;

    const charge =
      withCharge && chargeEnabled && planId > 0
        ? {
            planId,
            paymentMethod: isOnline ? ONLINE_PAYMENT_METHOD : paymentMethod,
            sendOnline: isOnline && patientHasEmail && sendOnline,
          }
        : null;

    setSubmitting(true);
    try {
      const result = await finishConsultation(target.appointmentId, { charge });
      toast.success("Consulta encerrada. O relatório fica pronto em alguns minutos.");
      if (result.chargeError) toast.warning(result.chargeError);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all }),
        queryClient.invalidateQueries({
          queryKey: consultationKeys.detail(target.appointmentId),
        }),
      ]);

      onFinished();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Não foi possível encerrar a consulta."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root open>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/40" />
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <Dialog.Content
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:border-slate-700 dark:bg-slate-900"
            onPointerDownOutside={(event) => event.preventDefault()}
            onEscapeKeyDown={(event) => event.preventDefault()}
          >
            <Dialog.Title className="text-lg font-bold text-secondary dark:text-slate-50">
              Encerrar consulta
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-600 dark:text-slate-300">
              A gravação de {target.patientName} foi encerrada. Revise a cobrança
              antes de concluir.
            </Dialog.Description>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={chargeEnabled}
                    disabled={suggestionQuery.isLoading || submitting}
                    onChange={(event) => setChargeEnabled(event.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#14b8a6]"
                  />
                  <span className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-secondary dark:text-white">
                      Gerar cobrança desta sessão
                    </span>
                    {suggestion?.planName && !alreadyCharged && (
                      <span className="text-xs text-gray-600 dark:text-slate-400">
                        Plano sugerido: {suggestion.planName}
                      </span>
                    )}
                  </span>
                </label>

                {alreadyCharged && (
                  <p className="mt-3 text-xs font-medium text-amber-700 dark:text-amber-300">
                    Já existe cobrança de {monthLabel} para este paciente
                  </p>
                )}
              </div>

              {chargeEnabled && (
                <>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="finish-plan"
                      className="text-xs font-semibold uppercase tracking-wider text-secondary dark:text-white"
                    >
                      Plano *
                    </label>
                    <select
                      id="finish-plan"
                      value={planId || 0}
                      disabled={loadingPlanos || submitting}
                      onChange={(event) => setPlanId(Number(event.target.value))}
                      className={fieldClassName}
                    >
                      <option value={0}>
                        {loadingPlanos ? "Carregando..." : "Selecione um plano"}
                      </option>
                      {planos.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <fieldset className="flex flex-col gap-2">
                    <legend className="text-xs font-semibold uppercase tracking-wider text-secondary dark:text-white">
                      Como será pago? *
                    </legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {onlineAvailable && (
                        <label
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                            isOnline
                              ? "border-primary bg-primary/5"
                              : "border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                          }`}
                        >
                          <input
                            type="radio"
                            name="finish-billing-mode"
                            value="online"
                            checked={isOnline}
                            disabled={submitting}
                            onChange={() => setBillingMode("online")}
                            className="mt-1 h-4 w-4 accent-[#14b8a6]"
                          />
                          <span className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-secondary dark:text-white">
                              Online (Mercado Pago)
                            </span>
                            <span className="text-xs text-gray-600 dark:text-slate-400">
                              O paciente recebe o link para pagar por Pix ou cartão.
                            </span>
                          </span>
                        </label>
                      )}
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                          !isOnline
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                        }`}
                      >
                        <input
                          type="radio"
                          name="finish-billing-mode"
                          value="manual"
                          checked={!isOnline}
                          disabled={submitting}
                          onChange={() => setBillingMode("manual")}
                          className="mt-1 h-4 w-4 accent-[#14b8a6]"
                        />
                        <span className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-secondary dark:text-white">
                            Manual
                          </span>
                          <span className="text-xs text-gray-600 dark:text-slate-400">
                            Registre um pagamento já recebido.
                          </span>
                        </span>
                      </label>
                    </div>
                  </fieldset>

                  {isOnline ? (
                    <label
                      className={`flex items-start gap-3 rounded-xl border p-4 ${
                        patientHasEmail
                          ? "border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                          : "border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={sendOnline && patientHasEmail}
                        disabled={!patientHasEmail || submitting}
                        onChange={(event) => setSendOnline(event.target.checked)}
                        className="mt-1 h-4 w-4 accent-[#14b8a6] disabled:cursor-not-allowed"
                      />
                      <span className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-secondary dark:text-white">
                          Enviar cobrança por e-mail
                        </span>
                        {!patientHasEmail && (
                          <span className="text-xs text-gray-600 dark:text-slate-400">
                            Cadastre o e-mail do paciente para enviar por e-mail.
                            O link pode ser copiado depois na lista.
                          </span>
                        )}
                      </span>
                    </label>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="finish-payment-method"
                        className="text-xs font-semibold uppercase tracking-wider text-secondary dark:text-white"
                      >
                        Forma de pagamento *
                      </label>
                      <select
                        id="finish-payment-method"
                        value={paymentMethod}
                        disabled={submitting}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                        className={fieldClassName}
                      >
                        <option value="">Selecione uma forma</option>
                        {MANUAL_PAYMENT_METHODS.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => void handleFinish(false)}
              >
                Encerrar sem cobrança
              </Button>
              <Button
                type="button"
                loading={submitting}
                disabled={!canSubmit}
                onClick={() => void handleFinish(true)}
              >
                Confirmar
              </Button>
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
