"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { Controller, useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { FocusForm, type FocusFormStep } from "@/components/ui/FocusForm";
import { FormField } from "@/components/ui/FormField";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Patient, PatientCreatedResponse } from "@/types";
import { maskCEP, maskCPF, maskPhone, maskRG } from "@/utils/masks";
import { unformatCEP, unformatCPF, unformatPhone, unformatRG } from "@/utils/formatters";
import {
  PacienteSchema,
  PacienteUpdateSchema,
  step1Fields,
  step2Fields,
  type PacienteFormData,
} from "../schemas/paciente.schema";
import { usePacienteById } from "../hooks/getId";
import { usePacienteInsert } from "../hooks/insert";
import { usePacienteUpdate } from "../hooks/update";
import { PatientPortalAccessSection } from "./PatientPortalAccessSection";

type Mode = "create" | "edit";
type FieldName = keyof PacienteFormData;

interface Props {
  mode: Mode;
  open: boolean;
  patientId?: number | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY_FORM: PacienteFormData = {
  name: "",
  email: "",
  cpf: "",
  rg: "",
  phone: "",
  birthDate: "",
  rua: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
};

const BASE_STEPS: FocusFormStep[] = [
  {
    id: "dados-pessoais",
    label: "Dados pessoais",
    title: "Dados pessoais",
    description: "Identificação e contato do paciente.",
  },
  {
    id: "endereco",
    label: "Endereço",
    title: "Endereço",
    description: "Localização do paciente. Os campos são opcionais.",
  },
];

const STEPS: Record<Mode, FocusFormStep[]> = {
  create: BASE_STEPS,
  edit: [
    ...BASE_STEPS,
    {
      id: "acesso",
      label: "Acesso ao portal",
      title: "Acesso ao portal",
      description: "Gerencie o convite e o acesso do paciente ao portal Cliniq.",
    },
  ],
};

const FORM_ID = "paciente-form";

const toNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

function toFormValues(patient: Patient): PacienteFormData {
  return {
    name: patient.name ?? "",
    email: patient.email ?? "",
    cpf: maskCPF(patient.cpf ?? ""),
    rg: maskRG(patient.rg ?? ""),
    phone: maskPhone(patient.phone ?? ""),
    birthDate: patient.birthDate?.slice(0, 10) ?? "",
    rua: patient.rua ?? "",
    numero: patient.numero ?? "",
    bairro: patient.bairro ?? "",
    cidade: patient.cidade ?? "",
    estado: patient.estado ?? "",
    cep: unformatCEP(patient.cep ?? ""),
  };
}

/** Feedback do cadastro conforme a identidade global resolvida e o envio do convite. */
const registrationMessage = (res: PatientCreatedResponse): string => {
  if (res.patientAccountStatus === "PendingActivation" && !res.invitationSent)
    return "Paciente cadastrado, mas não foi possível enviar o convite. Você pode reenviá-lo pelo perfil.";
  if (res.linkResult === "LinkedExistingAccount")
    return "Paciente cadastrado e vinculado à conta Cliniq existente.";
  return "Paciente cadastrado. Enviamos um convite para ele ativar sua conta Cliniq.";
};

export default function PacienteFocusForm({
  mode,
  open,
  patientId = null,
  onClose,
  onSaved,
}: Props) {
  const isEdit = mode === "edit";
  const steps = STEPS[mode];
  const [step, setStep] = useState(0);

  const { data, loading, error, refetch } = usePacienteById(isEdit ? patientId : null);
  const { insertPaciente, isPending: isCreating } = usePacienteInsert();
  const { updatePaciente, isPending: isUpdating } = usePacienteUpdate();

  const {
    register,
    control,
    reset,
    handleSubmit,
    trigger,
    formState: { errors, isDirty },
  } = useForm<PacienteFormData>({
    resolver: zodResolver(isEdit ? PacienteUpdateSchema : PacienteSchema) as Resolver<PacienteFormData>,
    defaultValues: EMPTY_FORM,
  });

  const ready = !isEdit || Boolean(data && data.id === patientId);
  const isSubmitting = isEdit ? isUpdating : isCreating;
  const isLastStep = step === steps.length - 1;

  useEffect(() => {
    if (open && !isEdit) reset(EMPTY_FORM);
  }, [open, isEdit, reset]);

  useLayoutEffect(() => {
    if (!open || !isEdit) return;
    if (!data || data.id !== patientId || isDirty) return;
    reset(toFormValues(data));
  }, [open, isEdit, patientId, data, isDirty, reset]);

  const handleClose = () => {
    setStep(0);
    reset(EMPTY_FORM);
    onClose();
  };

  const onSubmit = async (formData: PacienteFormData) => {
    const payload = {
      name: toNullable(formData.name),
      email: toNullable(formData.email),
      cpf: formData.cpf ? toNullable(unformatCPF(formData.cpf)) : null,
      rg: formData.rg ? toNullable(unformatRG(formData.rg)) : null,
      phone: formData.phone ? toNullable(unformatPhone(formData.phone)) : null,
      birthDate: toNullable(formData.birthDate),
      rua: toNullable(formData.rua),
      numero: toNullable(formData.numero),
      bairro: toNullable(formData.bairro),
      cidade: toNullable(formData.cidade),
      estado: toNullable(formData.estado),
      cep: formData.cep ? toNullable(unformatCEP(formData.cep)) : null,
    };

    try {
      if (isEdit && patientId) {
        await updatePaciente(patientId, payload);
        toast.success("Paciente atualizado com sucesso!");
        await refetch();
        reset(EMPTY_FORM);
      } else {
        const response = await insertPaciente(payload);
        toast.success(registrationMessage(response));
        reset(EMPTY_FORM);
      }
      setStep(0);
      onSaved();
    } catch {
      // erro já tratado no hook
    }
  };

  const onInvalid = (formErrors: FieldErrors<PacienteFormData>) => {
    if (step1Fields.some((field) => formErrors[field])) {
      setStep(0);
      return;
    }
    if (step2Fields.some((field) => formErrors[field])) {
      setStep(1);
    }
  };

  const goToNextStep = async () => {
    const fields = step === 0 ? step1Fields : step2Fields;
    const isValid = await trigger(fields as unknown as FieldName[]);
    if (isValid) setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const personalFields = (
    <>
      <FormField
        label="Nome"
        id="name"
        error={errors.name?.message}
        {...register("name")}
      />
      <FormField
        label="E-mail"
        id="email"
        type="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <Controller
        control={control}
        name="cpf"
        render={({ field }) => (
          <FormField
            label="CPF"
            id="cpf"
            error={errors.cpf?.message}
            value={field.value ?? ""}
            onChange={(event) => field.onChange(maskCPF(event.target.value))}
            onBlur={field.onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="rg"
        render={({ field }) => (
          <FormField
            label="RG"
            id="rg"
            error={errors.rg?.message}
            value={field.value ?? ""}
            onChange={(event) => field.onChange(maskRG(event.target.value))}
            onBlur={field.onBlur}
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <FormField
            label="Telefone"
            id="phone"
            error={errors.phone?.message}
            value={field.value ?? ""}
            onChange={(event) => field.onChange(maskPhone(event.target.value))}
            onBlur={field.onBlur}
          />
        )}
      />

      <FormField
        label="Data de nascimento"
        id="birthDate"
        type="date"
        error={errors.birthDate?.message}
        {...register("birthDate")}
      />
    </>
  );

  const addressFields = (
    <>
      <Controller
        control={control}
        name="cep"
        render={({ field }) => (
          <FormField
            label="CEP"
            id="cep"
            error={errors.cep?.message}
            // O estado guarda só os dígitos (o schema de edição exige 8); a máscara é só de exibição.
            value={maskCEP(field.value ?? "")}
            onChange={(event) => field.onChange(unformatCEP(maskCEP(event.target.value)))}
            onBlur={field.onBlur}
          />
        )}
      />
      <FormField label="Rua" id="rua" error={errors.rua?.message} {...register("rua")} />
      <FormField label="Número" id="numero" error={errors.numero?.message} {...register("numero")} />
      <FormField label="Bairro" id="bairro" error={errors.bairro?.message} {...register("bairro")} />
      <FormField label="Cidade" id="cidade" error={errors.cidade?.message} {...register("cidade")} />
      <FormField label="Estado" id="estado" error={errors.estado?.message} {...register("estado")} />
    </>
  );

  const body = !ready ? (
    loading || (isEdit && !error) ? (
      <div className="space-y-4" aria-label="Carregando paciente">
        <Skeleton className="h-[4.25rem]" />
        <Skeleton className="h-[4.25rem]" />
        <Skeleton className="h-[4.25rem]" />
      </div>
    ) : (
      <ErrorState
        message={error ?? "Não foi possível carregar os dados do paciente."}
        onRetry={() => void refetch()}
      />
    )
  ) : (
    <form id={FORM_ID} onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
      <div className="space-y-5">
        {step === 0 && personalFields}
        {step === 1 && addressFields}
        {isEdit && step === 2 && (
          <PatientPortalAccessSection
            patientId={patientId ?? 0}
            status={data?.portalAccessStatus}
            onChanged={refetch}
          />
        )}
      </div>
    </form>
  );

  return (
    <FocusForm
      open={open}
      onClose={handleClose}
      title={isEdit ? "Detalhes do paciente" : "Novo paciente"}
      description={
        isEdit
          ? "Atualize os dados e o acesso ao portal do paciente."
          : "Cadastre o paciente em duas etapas."
      }
      steps={steps}
      step={step}
      onStepChange={setStep}
      dirty={open && ready && isDirty}
      footer={
        ready
          ? (requestClose) => (
              <>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth={false}
                  onClick={step === 0 ? requestClose : () => setStep((current) => current - 1)}
                >
                  {step === 0 ? "Cancelar" : "Voltar"}
                </Button>
                {isLastStep ? (
                  <Button
                    type="submit"
                    form={FORM_ID}
                    loading={isSubmitting}
                    fullWidth={false}
                  >
                    {isEdit ? "Salvar alterações" : "Cadastrar paciente"}
                  </Button>
                ) : (
                  <Button type="button" fullWidth={false} onClick={goToNextStep}>
                    Continuar
                  </Button>
                )}
              </>
            )
          : undefined
      }
    >
      {body}
    </FocusForm>
  );
}
