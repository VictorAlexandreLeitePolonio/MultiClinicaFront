"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormActions } from "@/components/ui/FormActions";
import { FormField } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormSection";
import { PasswordField } from "@/components/ui/PasswordField";
import { Stepper } from "@/components/ui/Stepper";
import {
  ClinicCreateFormData,
  ClinicCreateSchema,
  clinicAddressFields,
  clinicAdminFields,
  clinicBillingFields,
  clinicDataFields,
} from "../schemas/clinic-create.schema";

interface ClinicCreateWizardProps {
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (data: ClinicCreateFormData) => Promise<void> | void;
}

const steps = [
  { title: "Dados cadastrais", description: "Identificação e contato da clínica" },
  { title: "Endereço", description: "Localização operacional" },
  { title: "Cobrança e status", description: "Controle comercial inicial" },
  { title: "Administrador", description: "Primeiro acesso da clínica" },
  { title: "Revisão", description: "Conferência antes do cadastro" },
];

export function ClinicCreateWizard({ loading, onCancel, onSubmit }: ClinicCreateWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const {
    handleSubmit,
    register,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useForm<ClinicCreateFormData>({
    resolver: zodResolver(ClinicCreateSchema),
    defaultValues: {
      name: "",
      document: "",
      email: "",
      phone: "",
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      billingEnabled: true,
      monthlyFee: 0,
      status: "Active",
      internalNotes: "",
      createFirstAdmin: true,
      adminName: "",
      adminEmail: "",
      adminPassword: "",
    },
  });

  const formValues = watch();
  const createFirstAdmin = watch("createFirstAdmin");

  const validateCurrentStep = async () => {
    if (currentStep === 0) return trigger(clinicDataFields);
    if (currentStep === 1) return trigger(clinicAddressFields);
    if (currentStep === 2) return trigger(clinicBillingFields);
    if (currentStep === 3) return trigger(clinicAdminFields);
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Stepper steps={steps} currentStep={currentStep} />

      {currentStep === 0 && (
        <FormSection title="Dados cadastrais" columns={2}>
          <FormField id="clinic-name" label="Nome da clínica" required error={errors.name?.message} {...register("name")} />
          <FormField id="clinic-document" label="Documento" {...register("document")} />
          <FormField id="clinic-email" label="E-mail" type="email" error={errors.email?.message} {...register("email")} />
          <FormField id="clinic-phone" label="Telefone" {...register("phone")} />
        </FormSection>
      )}

      {currentStep === 1 && (
        <FormSection title="Endereço" columns={3}>
          <FormField id="clinic-rua" label="Rua" {...register("rua")} />
          <FormField id="clinic-numero" label="Número" {...register("numero")} />
          <FormField id="clinic-bairro" label="Bairro" {...register("bairro")} />
          <FormField id="clinic-cidade" label="Cidade" {...register("cidade")} />
          <FormField id="clinic-estado" label="Estado" {...register("estado")} />
          <FormField id="clinic-cep" label="CEP" {...register("cep")} />
        </FormSection>
      )}

      {currentStep === 2 && (
        <FormSection title="Cobrança e status" columns={2}>
          <label className="flex items-center gap-3 rounded-sm border-2 border-[#e2ebe6] bg-white px-4 py-3 text-sm font-semibold text-[#1a2a4a]">
            <input
              type="checkbox"
              checked={formValues.billingEnabled}
              onChange={(event) => setValue("billingEnabled", event.target.checked, { shouldValidate: true })}
            />
            Cobrança comercial ativa
          </label>
          <FormField
            label="Mensalidade"
            type="number"
            step="0.01"
            error={errors.monthlyFee?.message}
            {...register("monthlyFee", { valueAsNumber: true })}
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wide text-[#1a2a4a]">
              Status
            </label>
            <select
              value={formValues.status}
              onChange={(event) => setValue("status", event.target.value as ClinicCreateFormData["status"], { shouldValidate: true })}
              className="w-full rounded-sm border-2 border-[#e2ebe6] bg-[#fdfcfa] px-4 py-3 text-[#1a2a4a] focus:border-[#5a9c94] focus:outline-none"
            >
              <option value="Active">Ativa</option>
              <option value="Inactive">Inativa</option>
            </select>
          </div>
          <FormField id="clinic-notes" label="Observações internas" {...register("internalNotes")} />
        </FormSection>
      )}

      {currentStep === 3 && (
        <div className="space-y-4">
          <label className="flex items-center gap-3 rounded-sm border-2 border-[#e2ebe6] bg-white px-4 py-3 text-sm font-semibold text-[#1a2a4a]">
            <input
              type="checkbox"
              checked={createFirstAdmin}
              onChange={(event) => setValue("createFirstAdmin", event.target.checked, { shouldValidate: true })}
            />
            Criar primeiro administrador da clínica
          </label>

          {!createFirstAdmin && (
            <div className="flex gap-3 rounded-sm border-2 border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              <AlertTriangle size={20} className="shrink-0" />
              <p>
                A clínica será criada sem usuário administrador. O acesso inicial precisará ser configurado depois.
              </p>
            </div>
          )}

          {createFirstAdmin && (
            <FormSection title="Primeiro administrador" columns={2}>
              <FormField id="admin-name" label="Nome" required error={errors.adminName?.message} {...register("adminName")} />
              <FormField id="admin-email" label="E-mail" required type="email" error={errors.adminEmail?.message} {...register("adminEmail")} />
              <PasswordField id="admin-password" label="Senha" required error={errors.adminPassword?.message} {...register("adminPassword")} />
            </FormSection>
          )}
        </div>
      )}

      {currentStep === 4 && (
        <section className="rounded-sm border-2 border-[#e2ebe6] bg-white p-6 text-sm text-[#1a2a4a]">
          <h2 className="text-lg font-bold">Revisão do cadastro</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <p><strong>Clínica:</strong> {formValues.name || "-"}</p>
            <p><strong>E-mail:</strong> {formValues.email || "-"}</p>
            <p><strong>Cidade:</strong> {formValues.cidade || "-"}</p>
            <p><strong>Status:</strong> {formValues.status === "Active" ? "Ativa" : "Inativa"}</p>
            <p><strong>Cobrança:</strong> {formValues.billingEnabled ? "Ativa" : "Desativada"}</p>
            <p><strong>Administrador:</strong> {formValues.createFirstAdmin ? formValues.adminName || "-" : "Não será criado agora"}</p>
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="sm:w-40">
          <Button type="button" variant="outline" onClick={currentStep === 0 ? onCancel : handlePrevious}>
            {currentStep === 0 ? "Cancelar" : "Voltar"}
          </Button>
        </div>
        {currentStep < steps.length - 1 ? (
          <div className="sm:w-40">
            <Button type="button" onClick={handleNext}>
              Próximo
            </Button>
          </div>
        ) : (
          <FormActions onCancel={handlePrevious} cancelLabel="Voltar" submitLabel="Criar clínica" loading={loading} />
        )}
      </div>
    </form>
  );
}
