"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FilePlus2, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Column, DataTable } from "@/components/ui/DataTable";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { EvolutionSheet } from "@/components/evolution/EvolutionSheet";
import { useAuth } from "@/contexts/AuthContext";
import { patientRecordKeys } from "@/lib/queryKeys";
import {
  formatCivilDate,
  formatCurrency,
  formatPhone,
  todayCivilDate,
} from "@/utils/formatters";
import { useGetPatientProfile } from "../hooks/profile";
import { PatientPortalAccessSection } from "./PatientPortalAccessSection";
import { PatientTimeline } from "./record/PatientTimeline";
import { PatientAnamnesis } from "./record/PatientAnamnesis";
import { PatientMeasurements } from "./record/PatientMeasurements";
import { PatientDocuments } from "./record/PatientDocuments";

type TabType = "linha-do-tempo" | "anamnese" | "medicoes" | "financeiro" | "documentos";

interface Props {
  id: number;
  onBack: () => void;
}

const TAB_DEFINITIONS: { value: TabType; label: string }[] = [
  { value: "linha-do-tempo", label: "Linha do tempo" },
  { value: "anamnese", label: "Anamnese" },
  { value: "medicoes", label: "Medições" },
  { value: "financeiro", label: "Financeiro" },
  { value: "documentos", label: "Documentos" },
];

const CLINICAL_TABS: TabType[] = ["anamnese", "medicoes", "documentos"];

const isTabType = (value: string | null): value is TabType =>
  TAB_DEFINITIONS.some((tab) => tab.value === value);

const formatField = (value: string | null | undefined) => value?.trim() || "-";

/** Idade em anos a partir da data civil de nascimento. */
function ageLabel(birthDate: string | null): string | null {
  if (!birthDate) return null;
  const [year, month, day] = birthDate.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;
  const today = new Date();
  let age = today.getFullYear() - year;
  const birthdayThisYear = today.getMonth() + 1 > month
    || (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!birthdayThisYear) age -= 1;
  return age >= 0 ? `${age} ${age === 1 ? "ano" : "anos"}` : null;
}

export default function PacienteProfile({ id, onBack }: Props) {
  const { data, loading, error, refetch } = useGetPatientProfile(id);
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const reducedMotion = useReducedMotion();
  const { user } = useAuth();
  const canClinical = user?.role === "Administrador" || user?.role === "Profissional";
  const [newAnamnesisOpen, setNewAnamnesisOpen] = useState(false);
  const [focusAnamnesisId, setFocusAnamnesisId] = useState<number | null>(null);
  const [sheet, setSheet] = useState<{ open: boolean; evolutionId: number | null }>({
    open: false,
    evolutionId: null,
  });
  const tabParam = searchParams.get("aba");
  const requestedTab = isTabType(tabParam) ? tabParam : "linha-do-tempo";
  // Recepção nunca vê conteúdo clínico, mesmo com aba na URL.
  const activeTab =
    canClinical || !CLINICAL_TABS.includes(requestedTab) ? requestedTab : "linha-do-tempo";

  const navigateTab = (value: TabType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", "profile");
    params.set("id", String(id));
    params.set("aba", value);
    router.replace(`/app/pacientes?${params.toString()}`);
  };

  const handleTabChange = (value: string) => {
    if (!isTabType(value)) return;
    if (value !== "anamnese") setFocusAnamnesisId(null);
    navigateTab(value);
  };

  const handleNewAnamnesis = () => {
    setFocusAnamnesisId(null);
    setNewAnamnesisOpen(true);
    navigateTab("anamnese");
  };

  const handleOpenAnamnesis = (recordId: number) => {
    setFocusAnamnesisId(recordId);
    setNewAnamnesisOpen(false);
    navigateTab("anamnese");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-10" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <ErrorState
        message={error ?? "Não foi possível carregar o prontuário do paciente."}
        onRetry={() => void refetch()}
      />
    );
  }

  const paymentColumns: Column<typeof data.payments[0]>[] = [
    {
      key: "referenceMonth",
      label: "Mês Ref.",
      render: (payment) => formatCivilDate(payment.referenceMonth),
    },
    { key: "planName", label: "Plano" },
    {
      key: "amount",
      label: "Valor",
      render: (payment) => formatCurrency(payment.amount),
    },
    { key: "paymentMethod", label: "Método" },
    {
      key: "paymentDate",
      label: "Vencimento",
      render: (payment) => {
        if (!payment.paymentDate) return "-";
        if (payment.paymentDate < todayCivilDate() && payment.status === "Pending") {
          return (
            <span className="rounded-full border border-red-200 bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
              Vencido
            </span>
          );
        }
        return formatCivilDate(payment.paymentDate);
      },
    },
    {
      key: "status",
      label: "Status",
      render: (payment) => {
        const styles = {
          Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
          Paid: "bg-primary-dark text-white border-primary-dark",
          Cancelled: "bg-red-100 text-red-700 border-red-200",
        };
        const labels = {
          Pending: "Pendente",
          Paid: "Pago",
          Cancelled: "Cancelado",
        };
        return (
          <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${styles[payment.status]}`}>
            {labels[payment.status]}
          </span>
        );
      },
    },
    {
      key: "paidAt",
      label: "Pago em",
      render: (payment) => formatCivilDate(payment.paidAt),
    },
  ];

  const visibleTabs = TAB_DEFINITIONS.filter(
    (tab) => canClinical || !CLINICAL_TABS.includes(tab.value),
  );
  const age = ageLabel(data.birthDate);
  const contact = data.phone ? formatPhone(data.phone) : data.email ?? "Sem contato";

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-[#d7f3ea] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Voltar"
              className="mt-0.5 rounded-xl border border-transparent p-2 text-[#475569] transition-colors hover:border-[#d7f3ea] hover:bg-[#ecfdf5] hover:text-[#0f766e] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#99f6e4] dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ecfdf5] text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]">
              <User size={22} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight text-[#0f172a] dark:text-white">
                  {formatField(data.name)}
                </h1>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                    data.isActive
                      ? "border-[#14b8a6] bg-[#14b8a6] text-white"
                      : "border-red-200 bg-red-100 text-red-700"
                  }`}
                >
                  {data.isActive ? "Ativo" : "Inativo"}
                </span>
              </div>
              <p className="mt-1 text-sm text-[#475569] dark:text-slate-300">
                {contact}
                {age ? ` · ${age}` : ""}
              </p>
            </div>
          </div>

          {canClinical && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button fullWidth={false} variant="outline" onClick={handleNewAnamnesis}>
                <FilePlus2 size={16} />
                Nova anamnese
              </Button>
              <Button
                fullWidth={false}
                onClick={() => setSheet({ open: true, evolutionId: null })}
              >
                <Plus size={16} />
                Nova evolução
              </Button>
            </div>
          )}
        </div>
      </header>

      <PatientPortalAccessSection patientId={id} status={data.portalAccessStatus} onChanged={refetch} />

      <Tabs tabs={visibleTabs} value={activeTab} onChange={handleTabChange}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.15, ease: [0.23, 1, 0.32, 1] }}
        >
          {activeTab === "linha-do-tempo" && (
            <PatientTimeline
              patientId={id}
              onOpenEvolution={(evolutionId) => setSheet({ open: true, evolutionId })}
              onOpenAnamnesis={handleOpenAnamnesis}
            />
          )}
          {activeTab === "anamnese" && (
            <PatientAnamnesis
              key={`anamnese-${focusAnamnesisId ?? "latest"}`}
              patientId={id}
              creating={newAnamnesisOpen}
              onCreatingChange={setNewAnamnesisOpen}
              focusRecordId={focusAnamnesisId}
            />
          )}
          {activeTab === "medicoes" && <PatientMeasurements patientId={id} />}
          {activeTab === "financeiro" && (
            <DataTable
              columns={paymentColumns}
              data={data.payments}
              keyExtractor={(payment) => payment.id}
              emptyMessage="Nenhum pagamento encontrado."
            />
          )}
          {activeTab === "documentos" && <PatientDocuments patientId={id} />}
        </motion.div>
      </Tabs>

      <EvolutionSheet
        patientId={id}
        evolutionId={sheet.evolutionId}
        open={sheet.open}
        onOpenChange={(open) => setSheet((current) => ({ ...current, open }))}
        onSaved={() => {
          void queryClient.invalidateQueries({ queryKey: patientRecordKeys.all(id) });
          setSheet({ open: false, evolutionId: null });
        }}
      />
    </div>
  );
}
