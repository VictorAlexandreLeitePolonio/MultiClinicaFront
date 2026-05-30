"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { getApiErrorMessage } from "@/utils/apiError";
import { createSuperAdminClinic, CreateSuperAdminClinicPayload } from "@/services/superadmin/clinics.service";
import { ClinicCreateWizard } from "../components/ClinicCreateWizard";
import { ClinicCreateFormData } from "../schemas/clinic-create.schema";

function trimValue(value?: string): string {
  return value?.trim() ?? "";
}

function buildPayload(data: ClinicCreateFormData): CreateSuperAdminClinicPayload {
  return {
    nome: trimValue(data.name),
    nomeFantasia: trimValue(data.name),
    nomeResponsavel: trimValue(data.adminName),
    cnpj: trimValue(data.document),
    email: trimValue(data.email),
    telefone: trimValue(data.phone),
    rua: trimValue(data.rua),
    numero: trimValue(data.numero),
    bairro: trimValue(data.bairro),
    cidade: trimValue(data.cidade),
    estado: trimValue(data.estado),
    cep: trimValue(data.cep),
    firstAdmin: {
      name: trimValue(data.adminName),
      email: trimValue(data.adminEmail),
      password: data.adminPassword ?? "",
    },
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
