"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Column, DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useFornecedores } from "../../../financeiro/fornecedores/hooks/useFornecedores";
import { useCompras } from "../hooks/useCompras";
import type { Compra, StatusCompra } from "../services/compras.service";

interface Props { onCreate: () => void; onView: (id: number) => void; }
const statuses: StatusCompra[] = ["Aberta", "Aprovada", "Recebida", "Cancelada"];
export function CompraList({ onCreate, onView }: Props) { const { can } = useAuth(); const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(10); const [status, setStatus] = useState<StatusCompra | undefined>(); const [fornecedorId, setFornecedorId] = useState<number | undefined>(); const query = useCompras({ page, pageSize, status, fornecedorId }); const fornecedores = useFornecedores({ page: 1, pageSize: 100 }); const columns: Column<Compra>[] = [{ key: "id", label: "Código", render: (row) => `#${row.id}` }, { key: "fornecedorId", label: "Fornecedor", render: (row) => fornecedores.data?.data.find((item) => item.id === row.fornecedorId)?.nome ?? `#${row.fornecedorId}` }, { key: "dataCompra", label: "Data", render: (row) => formatDate(row.dataCompra) }, { key: "status", label: "Status" }, ...(can("compras.visualizar_valores") ? [{ key: "valorTotal", label: "Total", render: (row: Compra) => formatCurrency(row.valorTotal ?? 0) }] : []), { key: "actions", label: "", className: "text-right", render: (row) => <div data-tutorial="purchases-actions" className="flex justify-end"><Button variant="outline" fullWidth={false} onClick={() => onView(row.id)}><Eye size={15} />Ver</Button></div> }]; return <div className="space-y-4 p-8"><PageHeader title="Compras" actions={can("compras.criar") ? <div data-tutorial="purchases-new"><Button onClick={onCreate}>Nova Compra</Button></div> : undefined} /><div data-tutorial="purchases-filters" className="grid gap-3 sm:grid-cols-2 lg:max-w-2xl"><Select aria-label="Fornecedor" value={fornecedorId ?? ""} onChange={(event) => { setFornecedorId(event.target.value ? Number(event.target.value) : undefined); setPage(1); }}><option value="">Todos os fornecedores</option>{fornecedores.data?.data.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</Select><div data-tutorial="purchases-status"><Select aria-label="Status" value={status ?? ""} onChange={(event) => { setStatus((event.target.value || undefined) as StatusCompra | undefined); setPage(1); }}><option value="">Todos os status</option>{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</Select></div></div><div data-tutorial="purchases-list"><DataTable columns={columns} data={query.data?.data ?? []} loading={query.isLoading} error={query.isError ? getApiErrorMessage(query.error, "Erro ao carregar compras.") : null} onRetry={() => void query.refetch()} emptyMessage="Nenhuma compra encontrada." keyExtractor={(row) => row.id} /></div><Pagination page={page} totalPages={query.data?.totalPages ?? 0} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} /></div>; }
