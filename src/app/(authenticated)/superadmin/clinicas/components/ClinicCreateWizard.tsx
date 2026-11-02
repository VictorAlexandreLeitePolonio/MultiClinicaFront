"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  clinicDataFields,
  clinicStatusFields,
} from "../schemas/clinic-create.schema";

interface ClinicCreateWizardProps {
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (data: ClinicCreateFormData) => Promise<void> | void;
}

const steps = [
  { title: "Dados cadastrais", description: "Identificação e contato da clínica" },
  { title: "Endereço", description: "Localização operacional" },
  { title: "Status", description: "Situação inicial da clínica" },
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
      status: "Active",
      internalNotes: "",
      createFirstAdmin: true,
      adminName: "",
      adminEmail: "",
      adminPassword: "",
    },
  });

  const formValues = watch();

  const validateCurrentStep = async () => {
    if (currentStep === 0) return trigger(clinicDataFields);
    if (currentStep === 1) return trigger(clinicAddressFields);
    if (currentStep === 2) return trigger(clinicStatusFields);
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
        <FormSection title="Status" columns={2}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold uppercase tracking-wide text-secondary dark:text-white">
              Status
            </label>
            <select
              value={formValues.status}
              onChange={(event) => setValue("status", event.target.value as ClinicCreateFormData["status"], { shouldValidate: true })}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-secondary dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none"
            >
              <option value="Active">Ativa</option>
              <option value="Inactive">Inativa</option>
            </select>
          </div>
          <FormField id="clinic-notes" label="Observações internas" {...register("internalNotes")} />
        </FormSection>
      )}

      {currentStep === 3 && (
        <FormSection title="Primeiro administrador" columns={2}>
          <FormField id="admin-name" label="Nome" required error={errors.adminName?.message} {...register("adminName")} />
          <FormField id="admin-email" label="E-mail" required type="email" error={errors.adminEmail?.message} {...register("adminEmail")} />
          <PasswordField id="admin-password" label="Senha" required error={errors.adminPassword?.message} {...register("adminPassword")} />
        </FormSection>
      )}

      {currentStep === 4 && (
        <section className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-sm text-secondary dark:text-white">
          <h2 className="text-lg font-bold">Revisão do cadastro</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <p><strong>Clínica:</strong> {formValues.name || "-"}</p>
            <p><strong>E-mail:</strong> {formValues.email || "-"}</p>
            <p><strong>Cidade:</strong> {formValues.cidade || "-"}</p>
            <p><strong>Status:</strong> {formValues.status === "Active" ? "Ativa" : "Inativa"}</p>
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
