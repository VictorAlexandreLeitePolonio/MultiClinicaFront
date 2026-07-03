"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormSection } from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { PacienteSchema, PacienteFormData } from "../schemas/paciente.schema";
import { toast } from "sonner";
import { usePacienteById } from "../hooks/getId";
import { usePacienteUpdate } from "../hooks/update";
import { Eye, Edit3, Save, X } from "lucide-react";
import { maskCPF, maskRG, maskPhone } from "@/utils/masks";
import { unformatCPF, unformatRG, formatCEP, unformatCEP, unformatPhone } from "@/utils/formatters";

interface Props {
  id: number;
  onBack: () => void;
  onSave: () => void;
}

const toNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

export default function PacienteDetails({ id, onBack, onSave }: Props) {
  const { data, loading, error } = usePacienteById(id);
  const { updatePaciente, isPending } = usePacienteUpdate();
  const [isEditing, setIsEditing] = useState(false);

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
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

  // Watch all values
  const name = watch("name");
  const email = watch("email");
  const rua = watch("rua");
  const numero = watch("numero");
  const bairro = watch("bairro");
  const cidade = watch("cidade");
  const estado = watch("estado");
  const cep = watch("cep");

  // Reset form when data is loaded
  useEffect(() => {
    if (data) {
      reset({
        name: data.name ?? "",
        email: data.email ?? "",
        cpf: maskCPF(data.cpf ?? ""),
        rg: maskRG(data.rg || ""),
        phone: maskPhone(data.phone ?? ""),
        rua: data.rua ?? "",
        numero: data.numero ?? "",
        bairro: data.bairro ?? "",
        cidade: data.cidade ?? "",
        estado: data.estado ?? "",
        cep: data.cep ?? "",
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData: PacienteFormData) => {
    try {
      const payload = {
        name: toNullable(formData.name),
        email: toNullable(formData.email),
        cpf: formData.cpf ? toNullable(unformatCPF(formData.cpf)) : null,
        rg: formData.rg ? toNullable(unformatRG(formData.rg)) : null,
        phone: formData.phone ? toNullable(unformatPhone(formData.phone)) : null,
        rua: toNullable(formData.rua),
        numero: toNullable(formData.numero),
        bairro: toNullable(formData.bairro),
        cidade: toNullable(formData.cidade),
        estado: toNullable(formData.estado),
        cep: formData.cep ? toNullable(unformatCEP(formData.cep)) : null,
      };
      await updatePaciente(id, payload);
      toast.success("Paciente atualizado com sucesso!");
      setIsEditing(false);
      onSave();
    } catch {
      // erro já tratado no hook
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (data) {
      reset({
        name: data.name ?? "",
        email: data.email ?? "",
        cpf: maskCPF(data.cpf ?? ""),
        rg: maskRG(data.rg || ""),
        phone: maskPhone(data.phone ?? ""),
        rua: data.rua ?? "",
        numero: data.numero ?? "",
        bairro: data.bairro ?? "",
        cidade: data.cidade ?? "",
        estado: data.estado ?? "",
        cep: data.cep ?? "",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <PageHeader title="Detalhes do Paciente" onBack={onBack} />
        <p className="text-gray-600 dark:text-slate-300">
          Carregando...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-3xl">
        <PageHeader title="Detalhes do Paciente" onBack={onBack} />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Detalhes do Paciente"
        onBack={onBack}
        actions={
          !isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 size={16} className="mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelEdit}>
                <X size={16} className="mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSubmit(onSubmit)} loading={isPending}>
                <Save size={16} className="mr-2" />
                Salvar Alterações
              </Button>
            </div>
          )
        }
      />

      {/* Status Visual */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
          isEditing
            ? "bg-primary-dark/10 border-primary-dark"
            : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
        }`}
      >
        {isEditing ? (
          <>
            <Edit3 size={18} className="text-primary-dark" />
            <span className="text-sm font-semibold text-primary-dark">
              Modo Edição — Você pode alterar os dados abaixo
            </span>
          </>
        ) : (
          <>
            <Eye size={18} className="text-gray-600 dark:text-slate-300" />
            <span className="text-sm font-semibold text-gray-600 dark:text-slate-300">
              Modo Visualização — Clique em &quot;Editar&quot; para modificar
            </span>
          </>
        )}
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Dados Pessoais">
          <FormField
            label="Nome"
            id="name"
            name="name"
            error={errors.name?.message}
            disabled={!isEditing}
            value={name || ""}
            onChange={(e) => setValue("name", e.target.value, { shouldValidate: true })}
          />
          <FormField
            label="E-mail"
            id="email"
            name="email"
            error={errors.email?.message}
            disabled={!isEditing}
            value={email || ""}
            onChange={(e) => setValue("email", e.target.value, { shouldValidate: true })}
          />
          <Controller
            control={control}
            name="cpf"
            render={({ field }) => (
              <FormField
                label="CPF"
                id="cpf"
                name="cpf"
                error={errors.cpf?.message}
                disabled={!isEditing}
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
                id="rg"
                name="rg"
                error={errors.rg?.message}
                disabled={!isEditing}
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
                id="phone"
                name="phone"
                error={errors.phone?.message}
                disabled={!isEditing}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(maskPhone(e.target.value))}
                onBlur={field.onBlur}
              />
            )}
          />
        </FormSection>

        <FormSection title="Endereço">
          <FormField
            label="CEP"
            id="cep"
            name="cep"
            error={errors.cep?.message}
            disabled={!isEditing}
            value={formatCEP(cep || "")}
            onChange={(e) => {
              const raw = unformatCEP(e.target.value);
              if (raw.length <= 8) setValue("cep", raw, { shouldValidate: true });
            }}
          />
          <FormField
            label="Rua"
            id="rua"
            name="rua"
            error={errors.rua?.message}
            disabled={!isEditing}
            value={rua || ""}
            onChange={(e) => setValue("rua", e.target.value, { shouldValidate: true })}
          />
          <FormField
            label="Número"
            id="numero"
            name="numero"
            error={errors.numero?.message}
            disabled={!isEditing}
            value={numero || ""}
            onChange={(e) => setValue("numero", e.target.value, { shouldValidate: true })}
          />
          <FormField
            label="Bairro"
            id="bairro"
            name="bairro"
            error={errors.bairro?.message}
            disabled={!isEditing}
            value={bairro || ""}
            onChange={(e) => setValue("bairro", e.target.value, { shouldValidate: true })}
          />
          <FormField
            label="Cidade"
            id="cidade"
            name="cidade"
            error={errors.cidade?.message}
            disabled={!isEditing}
            value={cidade || ""}
            onChange={(e) => setValue("cidade", e.target.value, { shouldValidate: true })}
          />
          <FormField
            label="Estado"
            id="estado"
            name="estado"
            error={errors.estado?.message}
            disabled={!isEditing}
            value={estado || ""}
            onChange={(e) => setValue("estado", e.target.value, { shouldValidate: true })}
          />
        </FormSection>

        {/* Botões mobile */}
        <div className="flex gap-2 md:hidden">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 size={16} className="mr-2" />
              Editar
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X size={16} className="mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSubmit(onSubmit)} loading={isPending}>
                <Save size={16} className="mr-2" />
                Salvar
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
