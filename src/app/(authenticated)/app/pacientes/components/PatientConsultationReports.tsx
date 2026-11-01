"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FileAudio } from "lucide-react";
import { Column, DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { consultationKeys } from "@/lib/queryKeys";
import { ConsultationReportSummary } from "@/types/consultation";
import { formatDate } from "@/utils/formatters";
import { getPatientConsultationReports } from "../../agenda/services/consultation.service";

interface Props {
  patientId: number;
}

const consultationStatusMapping: Record<string, { label: string; className: string }> = {
  Recording: { label: "Consulta em gravação", className: "border-red-200 bg-red-50 text-red-700" },
  Processing: { label: "Consulta em processamento", className: "border-amber-200 bg-amber-50 text-amber-700" },
  Ready: { label: "Relatório pronto", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  Interrupted: { label: "Consulta interrompida", className: "border-slate-200 bg-slate-50 text-slate-700" },
  Failed: { label: "Falha na consulta", className: "border-red-200 bg-red-50 text-red-700" },
};

export function PatientConsultationReports({ patientId }: Props) {
  const reports = useQuery({
    queryKey: consultationKeys.byPatient(patientId),
    queryFn: () => getPatientConsultationReports(patientId),
  });

  const columns: Column<ConsultationReportSummary>[] = [
    {
      key: "appointmentDate",
      label: "Data",
      render: (report) => (
        <Link
          href={`/app/agenda?mode=view&id=${report.appointmentId}`}
          className="font-semibold text-primary-dark underline underline-offset-2 dark:text-emerald-300"
        >
          {formatDate(report.appointmentDate)}
        </Link>
      ),
    },
    { key: "professionalName", label: "Profissional" },
    {
      key: "status",
      label: "Status",
      render: (report) => (
        <StatusBadge status={report.status} mapping={consultationStatusMapping} />
      ),
    },
    {
      key: "reviewed",
      label: "Revisado",
      render: (report) => (report.reviewed ? "Sim" : "Não"),
    },
  ];

  if (reports.isPending) {
    return (
      <DataTable
        columns={columns}
        data={[]}
        loading
        keyExtractor={(report) => report.id}
      />
    );
  }

  if (reports.isError) {
    return (
      <DataTable
        columns={columns}
        data={[]}
        error="Não foi possível carregar os relatórios de consulta."
        onRetry={() => reports.refetch()}
        keyExtractor={(report) => report.id}
      />
    );
  }

  if (!reports.data || reports.data.length === 0) {
    return <EmptyState title="Nenhuma consulta gravada." icon={FileAudio} />;
  }

  return (
    <DataTable
      columns={columns}
      data={reports.data}
      keyExtractor={(report) => report.id}
    />
  );
}
