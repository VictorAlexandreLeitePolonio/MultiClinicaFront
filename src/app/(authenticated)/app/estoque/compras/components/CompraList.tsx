"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Column, DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useFornecedores } from "../../../financeiro/fornecedores/hooks/useFornecedores";
import { useCompras } from "../hooks/useCompras";
import type { Compra, StatusCompra } from "../services/compras.service";

interface Props { onCreate: () => void; onView: (id: number) => void; }
const statuses: StatusCompra[] = ["Aberta", "Aprovada", "Recebida", "Cancelada"];
export function CompraList({ onCreate, onView }: Props) { const { can } = useAuth(); const [page, setPage] = useState(1); const [pageSize, setPageSize] = useState(10); const [status, setStatus] = useState<StatusCompra | undefined>(); const [fornecedorId, setFornecedorId] = useState<number | undefined>(); const query = useCompras({ page, pageSize, status, fornecedorId }); const fornecedores = useFornecedores({ page: 1, pageSize: 100 }); const columns: Column<Compra>[] = [{ key: "id", label: "Código", render: (row) => `#${row.id}` }, { key: "fornecedorId", label: "Fornecedor", render: (row) => fornecedores.data?.data.find((item) => item.id === row.fornecedorId)?.nome ?? `#${row.fornecedorId}` }, { key: "dataCompra", label: "Data", render: (row) => formatDate(row.dataCompra) }, { key: "status", label: "Status" }, ...(can("compras.visualizar_valores") ? [{ key: "valorTotal", label: "Total", render: (row: Compra) => formatCurrency(row.valorTotal ?? 0) }] : []), { key: "actions", label: "", className: "text-right", render: (row) => <Button variant="outline" onClick={() => onView(row.id)}><Eye size={15} className="mr-1" />Ver</Button> }]; return <div className="space-y-4"><PageHeader title="Compras" actions={can("compras.criar") ? <Button onClick={onCreate}>Nova Compra</Button> : undefined} /><div className="flex flex-wrap gap-3"><select aria-label="Fornecedor" value={fornecedorId ?? ""} onChange={(event) => { setFornecedorId(event.target.value ? Number(event.target.value) : undefined); setPage(1); }} className="rounded-xl border border-[#d7f3ea] bg-white px-4 py-2"><option value="">Todos os fornecedores</option>{fornecedores.data?.data.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select><select aria-label="Status" value={status ?? ""} onChange={(event) => { setStatus((event.target.value || undefined) as StatusCompra | undefined); setPage(1); }} className="rounded-xl border border-[#d7f3ea] bg-white px-4 py-2"><option value="">Todos os status</option>{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</select></div><DataTable columns={columns} data={query.data?.data ?? []} loading={query.isLoading} error={query.isError ? getApiErrorMessage(query.error, "Erro ao carregar compras.") : null} onRetry={() => void query.refetch()} emptyMessage="Nenhuma compra encontrada." keyExtractor={(row) => row.id} /><Pagination page={page} totalPages={query.data?.totalPages ?? 0} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} /></div>; }
