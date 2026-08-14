"use client";

import { useState } from "react";
import { Ban } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { MotivoDialog } from "@/components/ui/MotivoDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDate } from "@/utils/formatters";
import { useProdutos } from "../../produtos/hooks/useProdutos";
import { useMovimentacaoMutations, useMovimentacoes } from "../hooks/useMovimentacoes";
import type { AjustarEstoqueFormData, RegistrarMovimentacaoFormData } from "../schemas/movimentacao.schema";
import type { MovimentacaoEstoque } from "../services/movimentacoes.service";
import { MovimentacaoDialog, type MovimentacaoAction } from "./MovimentacaoDialog";
import { AlertasCard } from "./AlertasCard";

const movementTypes: MovimentacaoEstoque["tipo"][] = ["Entrada", "Saida", "Ajuste", "Perda", "UsoInterno", "Venda", "Compra"];

export function MovimentacaoList() {
  const { can } = useAuth();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [produtoId, setProdutoId] = useState<number | undefined>();
  const [tipo, setTipo] = useState<MovimentacaoEstoque["tipo"] | undefined>();
  const [action, setAction] = useState<MovimentacaoAction | null>(null);
  const [cancelar, setCancelar] = useState<MovimentacaoEstoque | null>(null);
  const query = useMovimentacoes({ produtoId, tipo, page, pageSize });
  const produtos = useProdutos({ page: 1, pageSize: 100 });
  const mutations = useMovimentacaoMutations();
  const names = new Map((produtos.data?.data ?? []).map((item) => [item.id, item.nome]));

  const submit = async (data: RegistrarMovimentacaoFormData | AjustarEstoqueFormData) => {
    try {
      if (action === "ajuste") {
        await mutations.ajustarEstoque(data as AjustarEstoqueFormData);
      } else {
        const payload = data as RegistrarMovimentacaoFormData;
        if (action === "entrada") await mutations.registrarEntrada(payload);
        if (action === "saida") await mutations.registrarSaida(payload);
        if (action === "sale") await mutations.createProductSale({ productId: payload.produtoId, quantity: payload.quantidade, note: payload.observacao || null });
        if (action === "uso-interno") await mutations.registrarUsoInterno(payload);
        if (action === "perda") await mutations.registrarPerda(payload);
      }
      toast.success("Movimentação registrada!");
      setAction(null);
    } catch {
      // useApiMutation exibe o erro.
    }
  };

  const cancel = async (motivo: string) => {
    if (!cancelar) return;
    try {
      await mutations.cancelarMovimentacao(cancelar.id, motivo);
      toast.success("Movimentação cancelada!");
      setCancelar(null);
    } catch {
      // useApiMutation exibe o erro.
    }
  };

  const columns: Column<MovimentacaoEstoque>[] = [
    { key: "produtoId", label: "Produto", render: (row) => names.get(row.produtoId) ?? `#${row.produtoId}` },
    { key: "tipo", label: "Tipo" },
    { key: "quantidade", label: "Quantidade" },
    { key: "quantidadeAtual", label: "Saldo" },
    { key: "createdAt", label: "Data", render: (row) => formatDate(row.createdAt) },
    { key: "status", label: "Status", render: (row) => row.isCancelada ? "Cancelada" : "Ativa" },
    { key: "actions", label: "", className: "text-right", render: (row) => !row.isCancelada && can("estoque.movimentacoes.cancelar") ? <ActionsDropdown actions={[{ label: "Cancelar", variant: "danger", icon: <Ban size={14} />, onClick: () => setCancelar(row) }]} /> : null },
  ];
  const actions: Array<{ key: MovimentacaoAction; label: string; permission: string }> = [
    { key: "entrada", label: "Entrada", permission: "estoque.movimentacoes.entrada" },
    { key: "saida", label: "Saída", permission: "estoque.movimentacoes.saida" },
    { key: "sale", label: "Venda", permission: "estoque.movimentacoes.saida" },
    { key: "uso-interno", label: "Uso interno", permission: "estoque.movimentacoes.saida" },
    { key: "perda", label: "Perda", permission: "estoque.movimentacoes.perda" },
    { key: "ajuste", label: "Ajuste", permission: "estoque.movimentacoes.ajuste" },
  ];
  const availableActions = actions.filter((item) => can(item.permission));

  return (
    <div className="space-y-4 p-8">
      <PageHeader title="Movimentações de Estoque" actions={availableActions.length ? <ActionsDropdown label="Nova movimentação" actions={availableActions.map((item) => ({ label: item.label, onClick: () => setAction(item.key) }))} /> : undefined} />
      <AlertasCard />
      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
        <Select aria-label="Produto" value={produtoId ?? ""} onChange={(event) => { setProdutoId(event.target.value ? Number(event.target.value) : undefined); setPage(1); }}><option value="">Todos os produtos</option>{produtos.data?.data.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</Select>
        <Select aria-label="Tipo" value={tipo ?? ""} onChange={(event) => { setTipo((event.target.value || undefined) as MovimentacaoEstoque["tipo"] | undefined); setPage(1); }}><option value="">Todos os tipos</option>{movementTypes.map((item) => <option key={item} value={item}>{item}</option>)}</Select>
      </div>
      <DataTable columns={columns} data={query.data?.data ?? []} loading={query.isLoading} error={query.isError ? getApiErrorMessage(query.error, "Erro ao carregar movimentações.") : null} onRetry={() => void query.refetch()} emptyMessage="Nenhuma movimentação encontrada." keyExtractor={(row) => row.id} />
      <Pagination page={page} totalPages={query.data?.totalPages ?? 0} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
      <MovimentacaoDialog open={!!action} action={action ?? "entrada"} loading={mutations.isMutating} onClose={() => setAction(null)} onSubmit={submit} />
      <MotivoDialog open={!!cancelar} title="Cancelar movimentação" description="Informe o motivo do cancelamento." confirmLabel="Cancelar" loading={mutations.isCanceling} onCancel={() => setCancelar(null)} onConfirm={cancel} />
    </div>
  );
}
