"use client";

import { useId } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import { useCreateWhatsAppLink, useDeleteWhatsAppLink, useWhatsAppLinkStatus } from "../hooks/useWhatsAppLink";

export function WhatsAppLinkSection() {
  const titleId = useId();
  const status = useWhatsAppLinkStatus();
  const create = useCreateWhatsAppLink();
  const remove = useDeleteWhatsAppLink();
  const connected = status.data?.connected ?? false;

  const handleConnect = async () => {
    // Abre a aba antes do await para não ser bloqueada como pop-up.
    const tab = window.open("", "_blank");
    try {
      const { url } = await create.mutateAsync();
      if (tab && !tab.closed) {
        tab.opener = null;
        tab.location.href = url;
        toast.info("Envie a mensagem que já vem escrita no WhatsApp para concluir a conexão.");
      } else {
        // Sem aba, não navega a página atual: o botão do toast abre o link com um clique do usuário.
        toast.info("Seu navegador bloqueou a nova aba.", {
          action: { label: "Abrir WhatsApp", onClick: () => window.open(url, "_blank", "noopener,noreferrer") },
        });
      }
    } catch (error) {
      tab?.close();
      toast.error(getApiErrorMessage(error, "Não foi possível gerar o link do WhatsApp."));
    }
  };

  const handleDisconnect = async () => {
    try {
      await remove.mutateAsync();
      toast.success("WhatsApp desconectado.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível desconectar o WhatsApp."));
    }
  };

  return (
    <section
      aria-labelledby={titleId}
      className="space-y-4 rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div>
        <h2 id={titleId} className="text-lg font-bold text-[#0f172a] dark:text-white">
          Assistente no WhatsApp
        </h2>
        <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
          Peça por mensagem: &quot;agenda a Cida terça às 9h&quot;, &quot;o que tenho amanhã?&quot;. O assistente opera a agenda por você.
        </p>
      </div>

      {status.isLoading ? (
        <p role="status" className="text-sm text-[#64748b] dark:text-slate-400">
          Carregando…
        </p>
      ) : status.isError ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-[#64748b] dark:text-slate-400">Não foi possível verificar a conexão com o WhatsApp.</p>
          <button
            type="button"
            onClick={() => void status.refetch()}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Tentar novamente
          </button>
        </div>
      ) : connected ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            WhatsApp conectado
          </span>
          <button
            type="button"
            onClick={() => void handleDisconnect()}
            disabled={remove.isPending}
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
            disabled={create.isPending}
            className="rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#115e59] disabled:opacity-50"
          >
            Conectar WhatsApp
          </button>
          <button
            type="button"
            onClick={() => void status.refetch()}
            className="text-sm font-medium text-[#0f766e] hover:underline"
          >
            Já conectei, atualizar
          </button>
        </div>
      )}
    </section>
  );
}
