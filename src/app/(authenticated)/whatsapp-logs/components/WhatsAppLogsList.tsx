"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { FilterPopover, FilterOption, FilterValues } from "@/components/ui/FilterPopover";
import { Pagination } from "@/components/ui/Pagination";
import { usePaginedWhatsAppLogs, WhatsAppLogFilters } from "../hooks/pagined";
import { Check, X, MessageSquare, AlertCircle, X as XIcon } from "lucide-react";
import { WhatsAppLogItem } from "@/types";
import { formatDateTime } from "@/utils/formatters";

const typeOptions = [
  { value: "AppointmentReminder", label: "Lembrete de Consulta" },
  { value: "PaymentReminder", label: "Lembrete de Pagamento" },
];

const statusOptions = [
  { value: "true", label: "Sucesso" },
  { value: "false", label: "Falha" },
];

export default function WhatsAppLogsList() {
  const {
    data,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalCount,
    loading,
    error,
    filters,
    applyFilters,
    clearFilters,
    refetch,
  } = usePaginedWhatsAppLogs();

  const [selectedLog, setSelectedLog] = useState<WhatsAppLogItem | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({
    type: filters.type || "",
    success: filters.success !== undefined ? String(filters.success) : "",
  });

  const handleFilterChange = (values: FilterValues) => {
    setFilterValues(values);
  };

  const handleApplyFilters = () => {
    const newFilters: WhatsAppLogFilters = {};
    if (filterValues.type) {
      newFilters.type = filterValues.type;
    }
    if (filterValues.success) {
      newFilters.success = filterValues.success === "true";
    }
    applyFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilterValues({
      type: "",
      success: "",
    });
    clearFilters();
  };

  const filterOptions: FilterOption[] = [
    {
      key: "type",
      label: "Tipo",
      options: typeOptions,
    },
    {
      key: "success",
      label: "Status",
      options: statusOptions,
    },
  ];

  const columns: Column<WhatsAppLogItem>[] = [
    {
      key: "patientName",
      label: "Paciente",
      render: (log) => log.patientName || "-",
    },
    {
      key: "phone",
      label: "Telefone",
    },
    {
      key: "type",
      label: "Tipo",
      render: (log) => {
        const label = typeOptions.find((o) => o.value === log.type)?.label || log.type;
        return (
          <span className="flex items-center gap-1">
            <MessageSquare size={14} className="text-[#1a4a3a]" />
            {label}
          </span>
        );
      },
    },
    {
      key: "success",
      label: "Status",
      render: (log) =>
        log.success ? (
          <span className="flex items-center gap-1 text-green-600">
            <Check size={18} />
            <span className="text-sm">Sucesso</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-red-600">
            <X size={18} />
            <span className="text-sm">Falha</span>
          </span>
        ),
    },
    {
      key: "sentAt",
      label: "Data e hora",
      render: (log) => formatDateTime(log.sentAt),
    },
  ];

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      <PageHeader
        title="WhatsApp Logs"
        actions={
          <FilterPopover
            filters={filterOptions}
            values={filterValues}
            onChange={handleFilterChange}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        }
      />

      <p className="text-sm text-[#4a6354]">
        Total de registros: <strong>{totalCount}</strong>
      </p>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="Nenhum log encontrado."
        keyExtractor={(log) => log.id}
        onRowClick={(log) => setSelectedLog(log)}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* Modal de detalhes */}
      {selectedLog && (
        <dialog
          open
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedLog(null);
          }}
        >
          <div className="bg-white rounded-sm max-w-lg w-full p-6 shadow-lg border-2 border-[#e2ebe6]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1a2a4a]" style={{ fontFamily: "var(--font-serif)" }}>
                Detalhes da Mensagem
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-[#4a6354] uppercase tracking-wider mb-1">
                  Paciente
                </p>
                <p className="text-[#1a2a4a]">{selectedLog.patientName || "-"}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#4a6354] uppercase tracking-wider mb-1">
                  Telefone
                </p>
                <p className="text-[#1a2a4a]">{selectedLog.phone}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#4a6354] uppercase tracking-wider mb-1">
                  Tipo
                </p>
                <p className="text-[#1a2a4a]">
                  {typeOptions.find((o) => o.value === selectedLog.type)?.label || selectedLog.type}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#4a6354] uppercase tracking-wider mb-1">
                  Status
                </p>
                <p className={selectedLog.success ? "text-green-600" : "text-red-600"}>
                  {selectedLog.success ? "✓ Enviado com sucesso" : "✗ Falha no envio"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#4a6354] uppercase tracking-wider mb-1">
                  Mensagem
                </p>
                <div className="bg-[#f0f4f2] border border-[#e2ebe6] rounded-sm p-3 max-h-40 overflow-y-auto">
                  <p className="text-sm text-[#1a2a4a] whitespace-pre-wrap">{selectedLog.message}</p>
                </div>
              </div>

              {selectedLog.errorMessage && (
                <div>
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    Erro
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-sm p-3">
                    <p className="text-sm text-red-700">{selectedLog.errorMessage}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-[#4a6354] uppercase tracking-wider mb-1">
                  Enviado em
                </p>
                <p className="text-[#1a2a4a]">{formatDateTime(selectedLog.sentAt)}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-[#1a4a3a] text-white rounded-sm hover:bg-[#143d2f] transition-colors"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Fechar
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}


