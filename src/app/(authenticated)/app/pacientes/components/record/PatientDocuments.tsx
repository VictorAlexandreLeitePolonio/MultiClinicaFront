"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, FileText, Paperclip } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { queryKeys } from "@/lib/queryKeys";
import { ClinicalAttachment } from "@/types";
import { formatDate } from "@/utils/formatters";
import { getMedicalRecords } from "@/app/(authenticated)/app/prontuarios/services/medical-records.service";
import { getAttachmentDownloadUrl } from "@/app/(authenticated)/app/prontuarios/services/attachments.service";

interface Props {
  patientId: number;
}

const recordListParams = (patientId: number) => ({ patientId, pageSize: 50 });

const TYPE_LABELS: Record<ClinicalAttachment["type"], string> = {
  Contract: "Contrato",
  Exam: "Exame",
  Other: "Outro",
};

function documentLabel(attachment: ClinicalAttachment): string {
  return attachment.originalFileName?.trim() || TYPE_LABELS[attachment.type];
}

export function PatientDocuments({ patientId }: Props) {
  const [openingId, setOpeningId] = useState<number | null>(null);
  const recordsQuery = useQuery({
    queryKey: queryKeys.medicalRecords.list(recordListParams(patientId)),
    queryFn: () => getMedicalRecords(recordListParams(patientId)),
  });

  const openAttachment = async (attachment: ClinicalAttachment) => {
    setOpeningId(attachment.id);
    try {
      const url = await getAttachmentDownloadUrl(attachment.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Erro ao gerar link temporário do documento.");
    } finally {
      setOpeningId(null);
    }
  };

  if (recordsQuery.isPending) {
    return (
      <div className="space-y-2" aria-label="Carregando documentos">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-14" />
        ))}
      </div>
    );
  }

  if (recordsQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar os documentos."
        onRetry={() => void recordsQuery.refetch()}
      />
    );
  }

  const documents = (recordsQuery.data?.data ?? []).flatMap((record) => record.attachments ?? []);

  if (documents.length === 0) {
    return (
      <EmptyState
        title="Nenhum documento registrado."
        description="Contratos e exames anexados às anamneses aparecem aqui."
        icon={Paperclip}
      />
    );
  }

  return (
    <ul className="divide-y divide-[#e6fbf4] overflow-hidden rounded-2xl border border-[#d7f3ea] bg-white shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
      {documents.map((attachment) => (
        <li key={attachment.id}>
          <button
            type="button"
            onClick={() => void openAttachment(attachment)}
            disabled={openingId === attachment.id}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#ecfdf5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#99f6e4] disabled:cursor-wait disabled:opacity-60 dark:hover:bg-slate-800/70"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]">
              <FileText size={16} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-[#0f172a] dark:text-white">
                {documentLabel(attachment)}
              </span>
              <span className="mt-0.5 block text-xs text-[#475569] dark:text-slate-300">
                {TYPE_LABELS[attachment.type]} · {formatDate(attachment.uploadedAt)}
              </span>
            </span>
            <ExternalLink size={16} className="shrink-0 text-[#475569] dark:text-slate-300" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
