"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormSection } from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { PacienteSchema, PacienteFormData, step1Fields } from "../schemas/paciente.schema";
import { usePacienteInsert } from "../hooks/insert";
import { maskCPF, maskRG, maskPhone, maskCEP } from "@/utils/masks";
import { unformatCPF, unformatRG, unformatPhone, unformatCEP } from "@/utils/formatters";

interface Props {
  onBack: () => void;
  onSave: () => void;
}

const toNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

export default function PacienteRegister({ onBack, onSave }: Props) {
  const { insertPaciente, isPending } = usePacienteInsert();
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<
    z.input<typeof PacienteSchema>,
    unknown,
    PacienteFormData
  >({
    resolver: zodResolver(PacienteSchema),
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      rg: "",
      phone: "",
      rua: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
    },
  });

  const onSubmit = async (data: PacienteFormData) => {
    try {
      const payload = {
        name: toNullable(data.name),
        email: toNullable(data.email),
        cpf: toNullable(unformatCPF(data.cpf)),
        rg: data.rg ? toNullable(unformatRG(data.rg)) : null,
        phone: data.phone ? toNullable(unformatPhone(data.phone)) : null,
        rua: toNullable(data.rua),
        numero: toNullable(data.numero),
        bairro: toNullable(data.bairro),
        cidade: toNullable(data.cidade),
        estado: toNullable(data.estado),
        cep: data.cep ? toNullable(unformatCEP(data.cep)) : null,
      };
      await insertPaciente(payload);
      toast.success("Paciente cadastrado com sucesso!");
      onSave();
    } catch {
      // erro já tratado no hook
    }
  };

  const goToNextStep = async () => {
    const isValid = await trigger(step1Fields as unknown as (keyof PacienteFormData)[]);
    if (isValid) {
      setStep(2);
    }
  };

  const goToPreviousStep = () => {
    setStep(1);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Novo Paciente" onBack={onBack} />

      {/* Indicador de Progresso */}
      <div className="flex items-center justify-center gap-4 py-4">
        {/* Step 1 */}
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step === 1
                ? "bg-primary-dark text-white"
                : "bg-white dark:bg-slate-900 border border-primary-dark text-primary-dark"
            }`}
          >
            1
          </div>
          <span
            className={`text-sm font-medium ${
              step === 1 ? "text-primary-dark" : "text-gray-600 dark:text-slate-300"
            }`}
          >
            Dados Pessoais
          </span>
        </div>

        {/* Linha conectora */}
        <div
          className={`w-16 h-0.5 transition-colors ${
            step === 2 ? "bg-primary-dark" : "bg-gray-200"
          }`}
        />

        {/* Step 2 */}
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step === 2
                ? "bg-primary-dark text-white"
                : "bg-white dark:bg-slate-900 border border-primary-dark text-primary-dark"
            }`}
          >
            2
          </div>
          <span
            className={`text-sm font-medium ${
              step === 2 ? "text-primary-dark" : "text-gray-600 dark:text-slate-300"
            }`}
          >
            Endereço
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 && (
        <FormSection title="Dados Pessoais">
          <FormField label="Nome" error={errors.name?.message} {...register("name")} />
          <FormField label="E-mail" error={errors.email?.message} {...register("email")} />

          <Controller
            control={control}
            name="cpf"
            render={({ field }) => (
              <FormField
                label="CPF"
                error={errors.cpf?.message}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(maskCPF(e.target.value))}
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
                value={field.value ?? ""}
                onChange={(e) => field.onChange(maskRG(e.target.value))}
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
                error={errors.phone?.message}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(maskPhone(e.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />
        </FormSection>
        )}

        {step === 2 && (
        <FormSection title="Endereço">
          <Controller
            control={control}
            name="cep"
            render={({ field }) => (
              <FormField
                label="CEP"
                error={errors.cep?.message}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(maskCEP(e.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />
          <FormField label="Rua" error={errors.rua?.message} {...register("rua")} />
          <FormField label="Número" error={errors.numero?.message} {...register("numero")} />
          <FormField label="Bairro" error={errors.bairro?.message} {...register("bairro")} />
          <FormField label="Cidade" error={errors.cidade?.message} {...register("cidade")} />
          <FormField label="Estado" error={errors.estado?.message} {...register("estado")} />
        </FormSection>
        )}

        {/* Botões de navegação */}
        <div className="flex gap-3">
          {step === 1 ? (
            <Button type="button" onClick={goToNextStep}>
              Próximo →
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={goToPreviousStep}>
                ← Voltar
              </Button>
              <Button type="submit" loading={isPending}>
                Cadastrar
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
