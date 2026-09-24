"use client";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FileSpreadsheet, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/utils/apiError";
import { usePatientImport } from "../hooks/import";
import type { PatientImportResponse } from "../services/patients.service";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

interface PatientImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImported: (hasImportedPatients: boolean) => void;
}

export function PatientImportDialog({ open, onClose, onImported }: PatientImportDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const idempotencyKeyRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [report, setReport] = useState<PatientImportResponse | null>(null);
  const { mutate: importFile, isPending } = usePatientImport();

  const selectFile = (selectedFile?: File) => {
    setRequestError(null);
    setReport(null);
    idempotencyKeyRef.current = null;

    if (!selectedFile) return;
    const extension = selectedFile.name.split(".").pop()?.toLocaleLowerCase();
    if (extension !== "csv" && extension !== "xlsx") {
      setFile(null);
      setFileError("Selecione um arquivo .csv ou .xlsx.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (selectedFile.size > MAX_FILE_BYTES) {
      setFile(null);
      setFileError("O arquivo deve ter até 10 MB.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setFileError(null);
    setFile(selectedFile);
  };

  const submitImport = async () => {
    if (!file || isPending) return;
    const idempotencyKey = idempotencyKeyRef.current ?? crypto.randomUUID();
    idempotencyKeyRef.current = idempotencyKey;
    setRequestError(null);
    try {
      const response = await importFile({ file, idempotencyKey });
      setReport(response);
      onImported(response.importedCount > 0);
    } catch (error) {
      setRequestError(getApiErrorMessage(error, "Não foi possível importar os pacientes."));
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && !isPending && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-bold text-secondary dark:text-slate-50">
                Importar pacientes
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Envie uma planilha XLSX ou um arquivo CSV para cadastrar vários pacientes.
              </Dialog.Description>
            </div>
            <button
              type="button"
              aria-label="Fechar importação"
              disabled={isPending}
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-5 space-y-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <p><strong>Apenas a coluna Name é obrigatória.</strong> As demais colunas são opcionais e podem estar em qualquer ordem.</p>
            <p>Colunas aceitas: Name, Email, CPF, Rg, Phone, Rua, Numero, Bairro, Cidade, Estado e Cep.</p>
            <p>Sem e-mail, o paciente será cadastrado sem notificação de acesso ao portal.</p>
          </div>

          <div
            className="mt-5"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              selectFile(event.dataTransfer.files.item(0) ?? undefined);
            }}
          >
            <label
              htmlFor="patient-import-file"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-teal-300 px-5 py-8 text-center hover:bg-teal-50 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              <Upload size={22} aria-hidden="true" className="text-teal-700 dark:text-teal-300" />
              <span className="font-medium">Selecione ou arraste um arquivo .xlsx ou .csv</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Máximo de 10 MB</span>
              <input
                ref={inputRef}
                id="patient-import-file"
                aria-label="Arquivo XLSX ou CSV"
                type="file"
                accept=".xlsx,.csv"
                className="sr-only"
                disabled={isPending}
                onChange={(event) => selectFile(event.currentTarget.files?.[0])}
              />
            </label>
          </div>

          {file && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
              <span className="flex min-w-0 items-center gap-2 text-sm">
                <FileSpreadsheet size={18} aria-hidden="true" className="shrink-0 text-teal-700" />
                <span className="truncate">{file.name}</span>
              </span>
              <button
                type="button"
                aria-label="Remover arquivo"
                disabled={isPending}
                onClick={() => {
                  setFile(null);
                  setReport(null);
                  idempotencyKeyRef.current = null;
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )}

          {(fileError || requestError) && (
            <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">
              {fileError ?? requestError}
            </p>
          )}

          {report && <ImportReport report={report} />}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" fullWidth={false} disabled={isPending} onClick={onClose}>
              Fechar
            </Button>
            <Button fullWidth={false} disabled={!file || isPending} loading={isPending} onClick={submitImport}>
              Importar arquivo
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ImportReport({ report }: { report: PatientImportResponse }) {
  return (
    <section aria-label="Resultado da importação" className="mt-5 space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <h3 className="font-semibold">Resultado da importação</h3>
      <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        <p>Total de linhas: {report.totalRows}</p>
        <p>Importados: {report.importedCount}</p>
        <p>Rejeitados: {report.rejectedCount}</p>
        <p>E-mails na fila: {report.emailsQueuedCount}</p>
        <p>Sem e-mail: {report.emailsSkippedNoEmailCount}</p>
      </div>
      {report.results.some((row) => row.errors.length > 0) && (
        <ul className="space-y-2 text-sm" aria-label="Linhas rejeitadas">
          {report.results.filter((row) => row.errors.length > 0).map((row) => (
            <li key={row.row} className="rounded-lg bg-red-50 p-3 text-red-800 dark:bg-red-950/40 dark:text-red-200">
              <strong>Linha {row.row}</strong>
              <ul className="mt-1 list-inside list-disc">
                {row.errors.map((error, index) => (
                  <li key={`${error.code}-${error.field}-${index}`}>{error.field}: {error.message}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
