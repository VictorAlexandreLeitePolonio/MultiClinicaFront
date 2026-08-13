"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/utils/apiError";
import { ClinicSettingsForm } from "./ClinicSettingsForm";
import { useClinicSettings, useUpdateClinicSettings } from "../hooks/useClinicSettings";

export function SettingsPage() {
  const router = useRouter();
  const { can, updateTenant } = useAuth();
  const canView = can("clinic.settings.view");
  const canEdit = can("clinic.settings.update");
  const settingsQuery = useClinicSettings(canView);
  const updateMutation = useUpdateClinicSettings();

  useEffect(() => {
    if (!canView) router.replace("/access-denied");
  }, [canView, router]);

  if (!canView) return null;

  if (settingsQuery.isLoading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
        <Skeleton className="h-12" />
        <Skeleton className="h-72" />
        <Skeleton className="h-48" />
      </div>
    );
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

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
      <PageHeader title="Configurações" />
      <ClinicSettingsForm
        settings={settingsQuery.data}
        canEdit={canEdit}
        loading={updateMutation.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
