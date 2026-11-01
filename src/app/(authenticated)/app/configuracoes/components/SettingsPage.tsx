"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/utils/apiError";
import { ClinicSettingsForm } from "./ClinicSettingsForm";
import { ClinicCategoriesSection } from "./ClinicCategoriesSection";
import { ClinicBusinessHoursSection } from "./ClinicBusinessHoursSection";
import { ClinicMediaSection } from "./ClinicMediaSection";
import { useClinicSettings, useUpdateClinicSettings } from "../hooks/useClinicSettings";
import { AvailabilitySettingsSection } from "./AvailabilitySettingsSection";
import { WhatsAppLinkSection } from "./WhatsAppLinkSection";
import { MercadoPagoSection } from "./MercadoPagoSection";

type SettingsTab = "atendimento" | "clinica" | "integracoes" | "plano";

const TAB_DEFINITIONS: { value: SettingsTab; label: string; description: string; adminOnly?: boolean }[] = [
  {
    value: "atendimento",
    label: "Atendimento",
    description: "Disponibilidade, duração das consultas e horários públicos da clínica.",
  },
  {
    value: "clinica",
    label: "Clínica",
    description: "Dados, identidade visual, perfil público, categorias e mídia.",
  },
  {
    value: "integracoes",
    label: "Integrações",
    description: "WhatsApp e Mercado Pago usados pela clínica.",
    adminOnly: true,
  },
  {
    value: "plano",
    label: "Plano",
    description: "Plano atual, limites de uso e assinatura.",
    adminOnly: true,
  },
];

function resolveTab(value: string | null, isAdmin: boolean): SettingsTab {
  const tab = TAB_DEFINITIONS.find((item) => item.value === value);
  if (!tab) return "atendimento";
  if (tab.adminOnly && !isAdmin) return "atendimento";
  return tab.value;
}

function SettingsSkeleton() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
      <Skeleton className="h-12" />
      <Skeleton className="h-72" />
      <Skeleton className="h-48" />
    </div>
  );
}

function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { can, updateTenant, user } = useAuth();
  const canView = can("clinic.settings.view");
  const canEdit = can("clinic.settings.update");
  const isAdmin = user?.role === "Administrador";
  const activeTab = resolveTab(searchParams.get("aba"), isAdmin);
  const settingsQuery = useClinicSettings(canView);
  const updateMutation = useUpdateClinicSettings();

  useEffect(() => {
    if (!canView) router.replace("/access-denied");
  }, [canView, router]);

  if (!canView) return null;

  if (settingsQuery.isLoading) {
    return <SettingsSkeleton />;
  }

  if (settingsQuery.isError) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
        <PageHeader title="Configurações" />
        <ErrorState
          message={getApiErrorMessage(settingsQuery.error, "Não foi possível carregar as configurações da clínica.")}
          onRetry={() => void settingsQuery.refetch()}
        />
      </div>
    );
  }

  if (!settingsQuery.data) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
        <PageHeader title="Configurações" />
        <EmptyState title="Configurações não encontradas" />
      </div>
    );
  }

  const handleSubmit = async (payload: Parameters<typeof updateMutation.mutateAsync>[0]) => {
    try {
      const updatedSettings = await updateMutation.mutateAsync(payload);
      updateTenant({
        id: updatedSettings.clinicId,
        name: updatedSettings.name,
        displayName: updatedSettings.displayName,
        logoUrl: updatedSettings.logoUrl,
        primaryColor: updatedSettings.primaryColor,
        secondaryColor: updatedSettings.secondaryColor,
        accentColor: updatedSettings.accentColor,
        contactEmail: updatedSettings.contactEmail,
        contactPhone: updatedSettings.contactPhone,
      });
      toast.success("Configurações salvas com sucesso.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível salvar as configurações."));
    }
  };

  const visibleTabs = TAB_DEFINITIONS.filter((tab) => !tab.adminOnly || isAdmin);
  const activeDefinition = TAB_DEFINITIONS.find((tab) => tab.value === activeTab) ?? TAB_DEFINITIONS[0];

  const handleTabChange = (value: string) => {
    router.replace(`/app/configuracoes?aba=${resolveTab(value, isAdmin)}`);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
      <PageHeader title="Configurações" />

      <Tabs
        tabs={visibleTabs.map((tab) => ({ value: tab.value, label: tab.label }))}
        value={activeTab}
        onChange={handleTabChange}
      >
        <p className="text-sm text-[#475569] dark:text-slate-300">{activeDefinition.description}</p>

        {activeTab === "atendimento" && (
          <div className="space-y-6">
            <AvailabilitySettingsSection canEdit={canEdit} />
            <ClinicBusinessHoursSection canEdit={canEdit} />
          </div>
        )}

        {activeTab === "clinica" && (
          <div className="space-y-6">
            <ClinicSettingsForm
              settings={settingsQuery.data}
              canEdit={canEdit}
              loading={updateMutation.isPending}
              onSubmit={handleSubmit}
            />
            <ClinicCategoriesSection canEdit={canEdit} />
            <ClinicMediaSection canEdit={canEdit} />
          </div>
        )}

        {activeTab === "integracoes" && isAdmin && (
          <div className="space-y-6">
            <WhatsAppLinkSection />
            <Suspense fallback={null}>
              <MercadoPagoSection />
            </Suspense>
          </div>
        )}

        {activeTab === "plano" && isAdmin && (
          <section className="rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Plano e assinatura</h2>
            <p className="mt-2 text-sm text-[#475569] dark:text-slate-300">
              Veja o plano atual, os limites de uso e gerencie a assinatura da clínica.
            </p>
            <Link
              href="/app/configuracoes/plano"
              className="mt-4 inline-flex items-center rounded-xl border border-[#99f6e4] bg-white px-4 py-2 text-sm font-semibold text-[#0f766e] shadow-sm transition-colors hover:border-[#14b8a6] hover:bg-[#ecfdf5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#99f6e4] dark:border-slate-700 dark:bg-slate-900 dark:text-[#67e8f9] dark:hover:bg-slate-800"
            >
              Plano e assinatura
            </Link>
          </section>
        )}
      </Tabs>
    </div>
  );
}

export function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsPageContent />
    </Suspense>
  );
}
