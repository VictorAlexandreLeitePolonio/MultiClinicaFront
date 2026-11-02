"use client";

import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ErrorState } from "@/components/ui/ErrorState";
import type { MercadoPagoSettings, MercadoPagoStatus } from "@/types/mercadoPago";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDate } from "@/utils/formatters";
import {
  useConnectMercadoPago,
  useDisconnectMercadoPago,
  useMercadoPagoStatus,
  useUpdateMercadoPagoSettings,
} from "../hooks/useMercadoPago";
import { Toggle } from "./Toggle";

const RESULT_TOASTS = {
  conectado: { type: "success", message: "Mercado Pago conectado." },
  erro: { type: "error", message: "Não foi possível conectar o Mercado Pago. Tente de novo." },
  "conta-em-uso": { type: "error", message: "Esta conta Mercado Pago já está ligada a outra clínica." },
} as const;

const settingsFromStatus = (status: MercadoPagoStatus): MercadoPagoSettings => ({
  acceptPix: status.acceptPix,
  acceptCredit: status.acceptCredit,
  maxInstallments: status.maxInstallments,
  acceptDebit: status.acceptDebit,
});

function ClinicAccountNotice() {
  return (
    <p className="max-w-md text-sm text-[var(--color-gray-600)]">
      Entre com a conta Mercado Pago{" "}
      <strong className="font-semibold text-[var(--color-secondary)]">da clínica</strong>. O Mercado Pago usa a
      conta que estiver logada neste navegador.
    </p>
  );
}

function ConnectedAccount({ status }: { status: MercadoPagoStatus }) {
  return (
    <div className="space-y-2 border-t border-[var(--color-gray-200)] pt-3">
      <h3 className="text-sm font-semibold text-[var(--color-secondary)]">Conta conectada</h3>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-[var(--color-gray-600)]">Apelido</dt>
        <dd className="font-medium text-[var(--color-secondary)]">{status.nickname ?? "Conta Mercado Pago"}</dd>
        {status.email && (
          <>
            <dt className="text-[var(--color-gray-600)]">E-mail</dt>
            <dd className="break-all text-[var(--color-secondary)]">{status.email}</dd>
          </>
        )}
        {status.accountId !== null && (
          <>
            <dt className="text-[var(--color-gray-600)]">ID</dt>
            <dd className="font-mono text-[var(--color-secondary)]">{status.accountId}</dd>
          </>
        )}
        {status.connectedAt && (
          <>
            <dt className="text-[var(--color-gray-600)]">Conectada em</dt>
            <dd className="text-[var(--color-secondary)]">{formatDate(status.connectedAt)}</dd>
          </>
        )}
      </dl>
    </div>
  );
}

interface SettingsFormProps {
  initialSettings: MercadoPagoSettings;
  submitting: boolean;
  onSave: (settings: MercadoPagoSettings) => Promise<unknown>;
}

function SettingsForm({ initialSettings, submitting, onSave }: SettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [formError, setFormError] = useState<string | null>(null);
  const id = useId();
  const pixId = `${id}-pix`;
  const creditId = `${id}-credit`;
  const debitId = `${id}-debit`;
  const installmentsId = `${id}-installments`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      ...settings,
      maxInstallments: Math.min(12, Math.max(1, Number(settings.maxInstallments) || 1)),
    };

    if (!payload.acceptPix && !payload.acceptCredit && !payload.acceptDebit) {
      setFormError("Escolha ao menos uma forma de pagamento.");
      return;
    }

    setFormError(null);
    try {
      await onSave(payload);
      setSettings(payload);
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Não foi possível salvar as formas de pagamento."));
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4 border-t border-[#e6fbf4] pt-4 dark:border-slate-800">
      <div>
        <h3 className="text-sm font-semibold text-[#0f172a] dark:text-white">Formas aceitas</h3>
        <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
          Escolha ao menos uma forma de pagamento para as cobranças online.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Toggle
          id={pixId}
          checked={settings.acceptPix}
          onChange={(checked) => setSettings((current) => ({ ...current, acceptPix: checked }))}
          label="Pix"
        />
        <Toggle
          id={creditId}
          checked={settings.acceptCredit}
          onChange={(checked) => setSettings((current) => ({ ...current, acceptCredit: checked }))}
          label="Cartão de crédito"
        />
        <Toggle
          id={debitId}
          checked={settings.acceptDebit}
          onChange={(checked) => setSettings((current) => ({ ...current, acceptDebit: checked }))}
          label="Cartão de débito"
        />
      </div>

      <div className="flex max-w-xs flex-col gap-2">
        <label htmlFor={installmentsId} className="text-sm font-semibold text-[#0f172a] dark:text-white">
          Máximo de parcelas
        </label>
        <input
          id={installmentsId}
          type="number"
          min={1}
          max={12}
          value={settings.maxInstallments}
          disabled={!settings.acceptCredit}
          onChange={(event) =>
            setSettings((current) => ({
              ...current,
              maxInstallments: Number(event.target.value) || 1,
            }))
          }
          className="w-full rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-[#0f172a] transition-all focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 disabled:cursor-not-allowed disabled:bg-[#f0fdf9] disabled:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-[#67e8f9] dark:focus:ring-[#134e4a]"
        />
        <span className="text-xs text-[#64748b] dark:text-slate-400">De 1 a 12 parcelas no crédito.</span>
      </div>

      {formError && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-300">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#115e59] disabled:opacity-50"
      >
        {submitting ? "Salvando…" : "Salvar formas de pagamento"}
      </button>
    </form>
  );
}

export function MercadoPagoSection() {
  const titleId = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = useMercadoPagoStatus();
  const connect = useConnectMercadoPago();
  const updateSettings = useUpdateMercadoPagoSettings();
  const disconnect = useDisconnectMercadoPago();
  const handledResult = useRef<string | null>(null);

  // O callback do OAuth volta com ?mp=<resultado>: avisa uma vez e limpa a URL.
  useEffect(() => {
    const result = searchParams.get("mp");
    if (!result || handledResult.current === result) return;
    handledResult.current = result;

    const feedback = RESULT_TOASTS[result as keyof typeof RESULT_TOASTS];
    if (feedback?.type === "success") toast.success(feedback.message);
    else if (feedback) toast.error(feedback.message);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("mp");
    const query = params.toString();
    router.replace(query ? `/app/configuracoes?${query}` : "/app/configuracoes");
  }, [router, searchParams]);

  const planRequired = axios.isAxiosError(status.error) && status.error.response?.status === 402;

  const handleConnect = async () => {
    try {
      const { url } = await connect.mutateAsync();
      window.location.href = url;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível conectar o Mercado Pago."));
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect.mutateAsync();
      toast.success("Mercado Pago desconectado.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível desconectar o Mercado Pago."));
    }
  };

  const handleSaveSettings = async (settings: MercadoPagoSettings) => {
    await updateSettings.mutateAsync(settings);
    toast.success("Formas de pagamento atualizadas.");
  };

  const data = status.data;
  const connected = Boolean(data?.connected && !data.revoked);
  const revoked = Boolean(data?.revoked);

  if (planRequired) return null;

  return (
    <section
      aria-labelledby={titleId}
      className="space-y-4 rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div>
        <h2 id={titleId} className="text-lg font-bold text-[#0f172a] dark:text-white">
          Mercado Pago
        </h2>
        <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
          Receba as cobranças dos pacientes por Pix, cartão de crédito ou débito.
        </p>
      </div>

      {status.isLoading ? (
        <p role="status" className="text-sm text-[#64748b] dark:text-slate-400">
          Carregando…
        </p>
      ) : status.isError ? (
        <ErrorState
          title="Não foi possível verificar a conexão com o Mercado Pago"
          message={getApiErrorMessage(status.error, "Tente novamente em instantes.")}
          onRetry={() => void status.refetch()}
        />
      ) : (
        <>
          {revoked ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                Mercado Pago revogado
              </span>
              <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                Reconecte o Mercado Pago
              </span>
              <button
                type="button"
                onClick={() => void handleConnect()}
                disabled={connect.isPending}
                className="rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#115e59] disabled:opacity-50"
              >
                Reconectar
              </button>
              <button
                type="button"
                onClick={() => void handleDisconnect()}
                disabled={disconnect.isPending}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Desconectar
              </button>
              <ClinicAccountNotice />
            </div>
          ) : connected ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Mercado Pago conectado
              </span>
              {!data?.liveMode && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  Modo de teste
                </span>
              )}
              <button
                type="button"
                onClick={() => void handleDisconnect()}
                disabled={disconnect.isPending}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Desconectar
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void handleConnect()}
                disabled={connect.isPending}
                className="rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#115e59] disabled:opacity-50"
              >
                Conectar Mercado Pago
              </button>
              <ClinicAccountNotice />
            </div>
          )}

          {(connected || revoked) && data && <ConnectedAccount status={data} />}

          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            Cadastre uma chave Pix na sua conta Mercado Pago para receber por Pix
          </p>

          {data && (
            <SettingsForm
              initialSettings={settingsFromStatus(data)}
              submitting={updateSettings.isPending}
              onSave={handleSaveSettings}
            />
          )}
        </>
      )}
    </section>
  );
}
