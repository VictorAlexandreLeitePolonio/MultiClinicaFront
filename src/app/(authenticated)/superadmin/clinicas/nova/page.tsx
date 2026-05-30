"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { getApiErrorMessage } from "@/utils/apiError";
import { createSuperAdminClinic, CreateSuperAdminClinicPayload } from "@/services/superadmin/clinics.service";
import { ClinicCreateWizard } from "../components/ClinicCreateWizard";
import { ClinicCreateFormData } from "../schemas/clinic-create.schema";

function emptyToUndefined(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function buildPayload(data: ClinicCreateFormData): CreateSuperAdminClinicPayload {
  return {
    name: data.name,
    document: emptyToUndefined(data.document),
    email: emptyToUndefined(data.email),
    phone: emptyToUndefined(data.phone),
    address: {
      rua: emptyToUndefined(data.rua),
      numero: emptyToUndefined(data.numero),
      bairro: emptyToUndefined(data.bairro),
      cidade: emptyToUndefined(data.cidade),
      estado: emptyToUndefined(data.estado),
      cep: emptyToUndefined(data.cep),
    },
    billing: {
      enabled: data.billingEnabled,
      monthlyFee: data.monthlyFee,
    },
    status: data.status,
    internalNotes: emptyToUndefined(data.internalNotes),
    firstAdministrator: data.createFirstAdmin
      ? {
          name: data.adminName ?? "",
          email: data.adminEmail ?? "",
          password: data.adminPassword ?? "",
        }
      : undefined,
  };
}

export default function NewSuperAdminClinicPage() {
  const router = useRouter();

  const handleSubmit = async (data: ClinicCreateFormData) => {
    try {
      await createSuperAdminClinic(buildPayload(data));
      toast.success("Clínica criada com sucesso.");
      router.push("/superadmin/clinicas");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao criar clínica."));
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-8">
      <PageHeader title="Nova Clínica" />
      <ClinicCreateWizard
        onCancel={() => router.push("/superadmin/clinicas")}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
