"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { useGetPatientProfile } from "../hooks/profile";
import { formatDate, formatCurrency, formatCPF, formatPhone } from "@/utils/formatters";
import { Calendar, FileText, CreditCard, User, Phone, MapPin } from "lucide-react";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

type TabType = "appointments" | "medicalRecords" | "payments";

interface Props {
  id: number;
  onBack: () => void;
}

const formatField = (value: string | null | undefined) => value?.trim() || "-";

const formatAddress = (data: {
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
}) => {
  const line1 = [data.rua, data.numero].filter(Boolean).join(", ");
  const line2 = [data.bairro, data.cidade].filter(Boolean).join(", ");
  const state = data.estado ?? null;
  const address = [line1, line2 && state ? `${line2}/${state}` : line2 || state].filter(Boolean).join(" - ");
  return address || "-";
};

export default function PacienteProfile({ id, onBack }: Props) {
  const { data, loading } = useGetPatientProfile(id);
  const [activeTab, setActiveTab] = useState<TabType>("appointments");

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Perfil do Paciente" onBack={onBack} />
        <p className="text-[#4a6354] py-8 text-center">Carregando...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Perfil do Paciente" onBack={onBack} />
        <p className="text-red-500 py-8 text-center">Erro ao carregar perfil do paciente.</p>
      </div>
    );
  }

  const appointmentColumns: Column<typeof data.appointments[0]>[] = [
    {
      key: "appointmentDate",
      label: "Data",
      render: (a) => formatDate(a.appointmentDate),
    },
    {
      key: "time",
      label: "Horário",
      render: (a) => {
        const date = new Date(a.appointmentDate);
        return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      },
    },
    {
      key: "status",
      label: "Status",
      render: (a) => {
        const styles = {
          Scheduled: "bg-blue-100 text-blue-700 border-blue-200",
          Completed: "bg-green-100 text-green-700 border-green-200",
          Cancelled: "bg-red-100 text-red-700 border-red-200",
        };
        const labels = {
          Scheduled: "Agendado",
          Completed: "Completo",
          Cancelled: "Cancelado",
        };
        return (
          <span className={`px-2 py-1 rounded-sm text-xs font-semibold border-2 ${styles[a.status]}`}>
            {labels[a.status]}
          </span>
        );
      },
    },
    { key: "userName", label: "Fisioterapeuta" },
  ];

  const medicalRecordColumns: Column<typeof data.medicalRecords[0]>[] = [
    { key: "titulo", label: "Título" },
    { key: "sessao", label: "Sessão" },
    { key: "patologia", label: "Patologia" },
    {
      key: "createdAt",
      label: "Data",
      render: (m) => formatDate(m.createdAt),
    },
    { key: "userName", label: "Fisioterapeuta" },
  ];

  const paymentColumns: Column<typeof data.payments[0]>[] = [
    { key: "referenceMonth", label: "Mês Ref." },
    { key: "planName", label: "Plano" },
    {
      key: "amount",
      label: "Valor",
      render: (p) => formatCurrency(p.amount),
    },
    { key: "paymentMethod", label: "Método" },
    {
      key: "paymentDate",
      label: "Vencimento",
      render: (p) => {
        if (!p.paymentDate) return "-";
        const paymentDate = new Date(p.paymentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (paymentDate < today && p.status === "Pending") {
          return (
            <span className="px-2 py-1 rounded-sm text-xs font-semibold border-2 bg-red-100 text-red-700 border-red-200">
              Vencido
            </span>
          );
        }
        return formatDate(p.paymentDate);
      },
    },
    {
      key: "status",
      label: "Status",
      render: (p) => {
        const styles = {
          Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
          Paid: "bg-[#1a4a3a] text-white border-[#143d2f]",
          Cancelled: "bg-red-100 text-red-700 border-red-200",
        };
        const labels = {
          Pending: "Pendente",
          Paid: "Pago",
          Cancelled: "Cancelado",
        };
        return (
          <span className={`px-2 py-1 rounded-sm text-xs font-semibold border-2 ${styles[p.status]}`}>
            {labels[p.status]}
          </span>
        );
      },
    },
    {
      key: "paidAt",
      label: "Pago em",
      render: (p) => (p.paidAt ? formatDate(p.paidAt) : "-"),
    },
  ];

  const tabs = [
    { key: "appointments" as TabType, label: "Consultas", icon: Calendar, count: data.appointments.length },
    { key: "medicalRecords" as TabType, label: "Prontuários", icon: FileText, count: data.medicalRecords.length },
    { key: "payments" as TabType, label: "Pagamentos", icon: CreditCard, count: data.payments.length },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={fadeSlideUp}>
        <PageHeader title={`Perfil: ${formatField(data.name)}`} onBack={onBack} />
      </motion.div>

      {/* Header Card */}
      <motion.div
        variants={fadeSlideUp}
        className="bg-white border-2 border-[#e2ebe6] rounded-sm p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1a4a3a] flex items-center justify-center text-white">
              <User size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#1a2a4a]" style={{ fontFamily: "var(--font-serif)" }}>
                  {formatField(data.name)}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-sm text-xs font-semibold border-2 ${
                    data.isActive
                      ? "bg-[#1a4a3a] text-white border-[#143d2f]"
                      : "bg-red-100 text-red-700 border-red-200"
                  }`}
                >
                  {data.isActive ? "Ativo" : "Inativo"}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-[#4a6354]">
                <span className="flex items-center gap-1">
                  <Phone size={14} />
                  {data.phone ? formatPhone(data.phone) : "-"}
                </span>
                <span>|</span>
                <span>CPF: {data.cpf ? formatCPF(data.cpf) : "-"}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-sm text-[#4a6354]">
                <MapPin size={14} />
                {formatAddress(data)}
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-[#4a6354]">
            <p>Cadastrado em: {formatDate(data.createdAt)}</p>
            <p className="mt-1">{formatField(data.email)}</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeSlideUp} className="border-b-2 border-[#e2ebe6]">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-all
                  ${
                    isActive
                      ? "bg-[#1a4a3a] text-white border-2 border-[#1a4a3a]"
                      : "bg-white text-[#4a6354] border-2 border-transparent hover:border-[#e2ebe6]"
                  }`}
                style={{ fontFamily: "var(--font-serif)" }}
              >
                <Icon size={16} />
                {tab.label}
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-sm text-xs ${
                    isActive ? "bg-white/20" : "bg-[#f0f4f2]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        variants={fadeSlideUp}
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "appointments" && (
          <DataTable
            columns={appointmentColumns}
            data={data.appointments}
            keyExtractor={(a) => a.id}
            emptyMessage="Nenhuma consulta encontrada."
          />
        )}
        {activeTab === "medicalRecords" && (
          <DataTable
            columns={medicalRecordColumns}
            data={data.medicalRecords}
            keyExtractor={(m) => m.id}
            emptyMessage="Nenhum prontuário encontrado."
          />
        )}
        {activeTab === "payments" && (
          <DataTable
            columns={paymentColumns}
            data={data.payments}
            keyExtractor={(p) => p.id}
            emptyMessage="Nenhum pagamento encontrado."
          />
        )}
      </motion.div>
    </motion.div>
  );
}
