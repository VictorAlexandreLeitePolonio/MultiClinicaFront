"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDateTime } from "@/utils/formatters";
import type { AuditoriaRegistro } from "@/types";
import { useAuditoria } from "../hooks/useAuditoria";

const modulos = ["Fornecedores", "Produtos", "Estoque", "Compras"];

function formatJson(raw: string | null): string {
  if (!raw) return "—";
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw; // ponytail: se não for JSON válido, mostra cru
  }
}

export function AuditoriaList() {
  const { can } = useAuth();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [modulo, setModulo] = useState<string | undefined>();
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [detalhe, setDetalhe] = useState<AuditoriaRegistro | null>(null);

  const query = useAuditoria({
    modulo,
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
    page,
    pageSize,
  });

  if (!can("financeiro.auditoria.visualizar")) {
    return (
      <div className="p-8">
        <EmptyState title="Sem permissão" description="Você não tem acesso à trilha de auditoria financeira." />
      </div>
    );
  }

  const columns: Column<AuditoriaRegistro>[] = [
    { key: "dataAcao", label: "Data", render: (row) => formatDateTime(row.dataAcao) },
    { key: "usuarioNome", label: "Usuário", render: (row) => row.usuarioNome || `#${row.usuarioId}` },
    { key: "modulo", label: "Módulo" },
    { key: "acao", label: "Ação" },
    { key: "entidade", label: "Entidade", render: (row) => `${row.entidade} #${row.entidadeId}` },
    { key: "motivo", label: "Motivo", render: (row) => row.motivo ?? "—" },
  ];

  return (
    <div className="space-y-4 p-8">
      <PageHeader title="Auditoria Financeira" />
      <div className="grid gap-3 sm:grid-cols-3 lg:max-w-3xl">
        <Select aria-label="Módulo" value={modulo ?? ""} onChange={(event) => { setModulo(event.target.value || undefined); setPage(1); }}>
          <option value="">Todos os módulos</option>
          {modulos.map((item) => <option key={item} value={item}>{item}</option>)}
        </Select>
        <input type="date" aria-label="Data inicial" value={dataInicio} onChange={(event) => { setDataInicio(event.target.value); setPage(1); }} className="rounded-xl border border-[#d7f3ea] bg-white px-4 py-2.5 text-[#0f172a] focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
        <input type="date" aria-label="Data final" value={dataFim} onChange={(event) => { setDataFim(event.target.value); setPage(1); }} className="rounded-xl border border-[#d7f3ea] bg-white px-4 py-2.5 text-[#0f172a] focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white" />
      </div>
      <DataTable
        columns={columns}
        data={query.data?.data ?? []}
        loading={query.isLoading}
        error={query.isError ? getApiErrorMessage(query.error, "Erro ao carregar auditoria.") : null}
        onRetry={() => void query.refetch()}
        emptyMessage="Nenhum registro de auditoria encontrado."
        keyExtractor={(row) => row.id}
        onRowClick={(row) => setDetalhe(row)}
      />
      <Pagination page={page} totalPages={query.data?.totalPages ?? 0} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

      <Dialog.Root open={!!detalhe} onOpenChange={(open) => !open && setDetalhe(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900">
            <Dialog.Title className="text-lg font-bold text-[#0f172a] dark:text-white">
              {detalhe?.modulo} · {detalhe?.acao} · {detalhe?.entidade} #{detalhe?.entidadeId}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-[#64748b] dark:text-slate-300">
              {detalhe && `${formatDateTime(detalhe.dataAcao)} · ${detalhe.usuarioNome || `#${detalhe.usuarioId}`}`}
            </Dialog.Description>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-[#64748b] dark:text-slate-400">Antes</p>
                <pre className="overflow-auto rounded-xl bg-[#f8fffc] p-3 text-xs text-[#0f172a] dark:bg-slate-950 dark:text-slate-200">{formatJson(detalhe?.dadosAntes ?? null)}</pre>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase text-[#64748b] dark:text-slate-400">Depois</p>
                <pre className="overflow-auto rounded-xl bg-[#f8fffc] p-3 text-xs text-[#0f172a] dark:bg-slate-950 dark:text-slate-200">{formatJson(detalhe?.dadosDepois ?? null)}</pre>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
