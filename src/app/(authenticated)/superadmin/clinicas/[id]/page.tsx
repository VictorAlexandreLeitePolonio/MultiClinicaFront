"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, CreditCard, FileText, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import {
  SuperAdminClinicUser,
  SuperAdminCommercialHistoryItem,
} from "@/types";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/formatters";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  configureClinicBilling,
  createSuperAdminClinicUser,
  registerClinicPayment,
  unblockClinicBilling,
} from "@/services/superadmin/clinics.service";
import { BillingConfigDialog, BillingConfigFormData } from "../components/BillingConfigDialog";
import { CreateClinicUserDialog, CreateClinicUserFormData } from "../components/CreateClinicUserDialog";
import { RegisterPaymentDialog, RegisterPaymentFormData } from "../components/RegisterPaymentDialog";
import { UnblockBillingDialog, UnblockBillingFormData } from "../components/UnblockBillingDialog";
import { useSuperAdminClinicDetail } from "../../hooks/useSuperAdminClinicDetail";

const tabs = [
  { value: "overview", label: "Visão geral" },
  { value: "data", label: "Dados cadastrais" },
  { value: "billing", label: "Cobrança" },
  { value: "users", label: "Usuários" },
  { value: "history", label: "Histórico" },
];

const userColumns: Column<SuperAdminClinicUser>[] = [
  { key: "name", label: "Nome" },
  { key: "email", label: "E-mail" },
  { key: "role", label: "Perfil" },
  {
    key: "isActive",
    label: "Status",
    render: (user) => (
      <StatusBadge
        status={user.isActive ? "Active" : "Inactive"}
        mapping={{
          Active: { label: "Ativo", className: "bg-green-100 text-green-700 border-green-200" },
          Inactive: { label: "Inativo", className: "bg-gray-100 text-gray-700 border-gray-200" },
        }}
      />
    ),
  },
  { key: "createdAt", label: "Cadastro", render: (user) => formatDate(user.createdAt) },
];

const historyColumns: Column<SuperAdminCommercialHistoryItem>[] = [
  { key: "action", label: "Ação" },
  { key: "description", label: "Descrição" },
  { key: "createdByName", label: "Responsável", render: (item) => item.createdByName ?? "-" },
  { key: "createdAt", label: "Data", render: (item) => formatDateTime(item.createdAt) },
];

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-sm border-2 border-[#e2ebe6] bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280] dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#1a2a4a] dark:text-slate-50">
        {value || "-"}
      </p>
    </div>
  );
}

export default function SuperAdminClinicDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clinicId = Number(params.id);
  const queryTab = searchParams.get("tab");
  const queryAction = searchParams.get("action");
  const initialTab: string = queryAction
    ? "billing"
    : queryTab !== null && tabs.some((item) => item.value === queryTab)
      ? queryTab
      : "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [billingDialogOpen, setBillingDialogOpen] = useState(queryAction === "billing");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(queryAction === "payment");
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(queryAction === "unblock");
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const { data, isLoading, error, refetch } = useSuperAdminClinicDetail(clinicId);

  const billingMutation = useMutation({
    mutationFn: (payload: BillingConfigFormData) => configureClinicBilling(clinicId, payload),
    onSuccess: () => {
      toast.success("Cobrança atualizada com sucesso.");
      setBillingDialogOpen(false);
      void refetch();
    },
    onError: (mutationError) => {
      toast.error(getApiErrorMessage(mutationError, "Erro ao atualizar cobrança."));
    },
  });

  const paymentMutation = useMutation({
    mutationFn: (payload: RegisterPaymentFormData) => registerClinicPayment(clinicId, payload),
    onSuccess: () => {
      toast.success("Pagamento registrado com sucesso.");
      setPaymentDialogOpen(false);
      void refetch();
    },
    onError: (mutationError) => {
      toast.error(getApiErrorMessage(mutationError, "Erro ao registrar pagamento."));
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (payload: UnblockBillingFormData) => unblockClinicBilling(clinicId, payload),
    onSuccess: () => {
      toast.success("Cobrança desbloqueada com sucesso.");
      setUnblockDialogOpen(false);
      void refetch();
    },
    onError: (mutationError) => {
      toast.error(getApiErrorMessage(mutationError, "Erro ao desbloquear cobrança."));
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (payload: CreateClinicUserFormData) => createSuperAdminClinicUser(clinicId, payload),
    onSuccess: () => {
      toast.success("Usuário criado com sucesso.");
      setCreateUserDialogOpen(false);
      setActiveTab("users");
      void refetch();
    },
    onError: (mutationError) => {
      toast.error(getApiErrorMessage(mutationError, "Erro ao criar usuário."));
    },
  });

  if (!Number.isFinite(clinicId) || clinicId <= 0) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
        <ErrorState message="Identificador da clínica inválido." />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
        <Skeleton className="h-12" />
        <Skeleton className="h-40" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
        <PageHeader title="Detalhes da clínica" onBack={() => router.push("/superadmin/clinicas")} />
        <ErrorState
          message="Não foi possível carregar os detalhes da clínica."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
        <PageHeader title="Detalhes da clínica" onBack={() => router.push("/superadmin/clinicas")} />
        <EmptyState title="Clínica não encontrada" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
      <PageHeader
        title={data.name}
        onBack={() => router.push("/superadmin/clinicas")}
        actions={
          <div className="flex flex-wrap gap-2">
            <div className="w-44">
              <Button type="button" variant="outline" onClick={() => setBillingDialogOpen(true)}>
                Configurar cobrança
              </Button>
            </div>
            <div className="w-44">
              <Button type="button" onClick={() => setPaymentDialogOpen(true)}>
                Registrar pagamento
              </Button>
            </div>
            {data.billing.status === "Blocked" && (
              <div className="w-44">
                <Button type="button" variant="danger" onClick={() => setUnblockDialogOpen(true)}>
                  Desbloquear
                </Button>
              </div>
            )}
          </div>
        }
      />

      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab}>
        {activeTab === "overview" && (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Usuários" value={data.usersCount} icon={Users} />
            <MetricCard
              label="Status da clínica"
              value={data.status === "Active" ? "Ativa" : "Inativa"}
              icon={CalendarDays}
            />
            <MetricCard
              label="Cobrança"
              value={data.billing.status === "Blocked" ? "Bloqueada" : data.billing.enabled ? "Ativa" : "Desativada"}
              icon={CreditCard}
            />
            <MetricCard
              label="Mensalidade"
              value={formatCurrency(data.billing.monthlyFee)}
              icon={FileText}
            />
          </section>
        )}

        {activeTab === "data" && (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InfoRow label="Documento" value={data.document} />
            <InfoRow label="E-mail" value={data.email} />
            <InfoRow label="Telefone" value={data.phone} />
            <InfoRow label="Rua" value={data.address.rua} />
            <InfoRow label="Número" value={data.address.numero} />
            <InfoRow label="Bairro" value={data.address.bairro} />
            <InfoRow label="Cidade" value={data.address.cidade} />
            <InfoRow label="Estado" value={data.address.estado} />
            <InfoRow label="CEP" value={data.address.cep} />
            <InfoRow label="Observações internas" value={data.internalNotes} />
          </section>
        )}

        {activeTab === "billing" && (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InfoRow label="Cobrança ativa" value={data.billing.enabled ? "Sim" : "Não"} />
            <InfoRow label="Status comercial" value={data.billing.status} />
            <InfoRow label="Mensalidade" value={formatCurrency(data.billing.monthlyFee)} />
            <InfoRow label="Motivo do bloqueio" value={data.billing.billingBlockedReason} />
            <InfoRow label="Bloqueado em" value={formatDateTime(data.billing.blockedAt)} />
          </section>
        )}

        {activeTab === "users" && (
          <section className="flex flex-col gap-4">
            <div className="flex justify-end">
              <div className="w-44">
                <Button type="button" onClick={() => setCreateUserDialogOpen(true)}>
                  <UserPlus size={16} className="mr-2 inline" />
                  Novo usuário
                </Button>
              </div>
            </div>
            <DataTable
              columns={userColumns}
              data={data.users}
              emptyMessage="Nenhum usuário cadastrado para esta clínica."
              keyExtractor={(user) => user.id}
            />
          </section>
        )}

        {activeTab === "history" && (
          <DataTable
            columns={historyColumns}
            data={data.commercialHistory}
            emptyMessage="Nenhum evento comercial registrado."
            keyExtractor={(item) => item.id}
          />
        )}
      </Tabs>

      <BillingConfigDialog
        open={billingDialogOpen}
        defaultValues={{
          enabled: data.billing.enabled,
          monthlyFee: data.billing.monthlyFee,
        }}
        loading={billingMutation.isPending}
        onClose={() => setBillingDialogOpen(false)}
        onSubmit={(payload) => billingMutation.mutate(payload)}
      />

      <RegisterPaymentDialog
        open={paymentDialogOpen}
        defaultAmount={data.billing.monthlyFee}
        loading={paymentMutation.isPending}
        onClose={() => setPaymentDialogOpen(false)}
        onSubmit={(payload) => paymentMutation.mutate(payload)}
      />

      <UnblockBillingDialog
        open={unblockDialogOpen}
        loading={unblockMutation.isPending}
        onClose={() => setUnblockDialogOpen(false)}
        onSubmit={(payload) => unblockMutation.mutate(payload)}
      />

      <CreateClinicUserDialog
        open={createUserDialogOpen}
        loading={createUserMutation.isPending}
        onClose={() => setCreateUserDialogOpen(false)}
        onSubmit={(payload) => createUserMutation.mutate(payload)}
      />
    </div>
  );
}
