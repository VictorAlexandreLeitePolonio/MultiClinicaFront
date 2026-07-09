"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormSection";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCategoriasFinanceiras } from "@/services/categoriasFinanceiras/categoriasFinanceiras.service";
import { createContaReceber } from "@/services/contasReceber/contasReceber.service";
import { getPatients } from "@/services/patients/patients.service";
import { CategoriaFinanceira, Patient } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";
import { CreateContaReceberFormData, CreateContaReceberSchema } from "../schemas/contaReceber.schema";

interface ContaReceberRegisterProps {
  onBack: () => void;
  onSave: () => void;
}

export function ContaReceberRegister({ onBack, onSave }: ContaReceberRegisterProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [saving, setSaving] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CreateContaReceberFormData>({
    resolver: zodResolver(CreateContaReceberSchema),
    defaultValues: {
      pacienteId: 0,
      categoriaFinanceiraId: null,
      descricao: "",
      valorOriginal: 0,
      valorDesconto: 0,
      valorJuros: 0,
      dataEmissao: new Date().toISOString().slice(0, 10),
      dataVencimento: "",
      observacao: "",
    },
  });

  useEffect(() => {
    getPatients({ pageSize: 100 })
      .then((result) => setPatients(result.data))
      .catch(() => {});
    getCategoriasFinanceiras({ pageSize: 100 })
      .then((result) => setCategorias(result.data.filter((categoria) => categoria.tipo === "Receita")))
      .catch(() => {});
  }, []);

  const onSubmit = async (data: CreateContaReceberFormData) => {
    setSaving(true);
    try {
      await createContaReceber(data);
      toast.success("Conta a receber cadastrada com sucesso!");
      onSave();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Erro ao cadastrar conta a receber"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Nova Conta a Receber" onBack={onBack} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Dados da Conta">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#0f172a] dark:text-white">Paciente *</label>
            <select
              {...register("pacienteId", { valueAsNumber: true })}
              className="w-full rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-[#0f172a] transition-all focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <option value={0}>Selecione um paciente</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
            {errors.pacienteId && <span className="text-xs text-red-600">{errors.pacienteId.message}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#0f172a] dark:text-white">Categoria</label>
            <select
              {...register("categoriaFinanceiraId", {
                setValueAs: (value) => (Number(value) > 0 ? Number(value) : null),
              })}
              className="w-full rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-[#0f172a] transition-all focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <option value={0}>Sem categoria</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>

          <FormField id="descricao" label="Descrição" required error={errors.descricao?.message} {...register("descricao")} />
          <FormField
            id="valorOriginal"
            label="Valor Original"
            type="number"
            step="0.01"
            required
            error={errors.valorOriginal?.message}
            {...register("valorOriginal", { valueAsNumber: true })}
          />
          <FormField
            id="valorDesconto"
            label="Desconto"
            type="number"
            step="0.01"
            error={errors.valorDesconto?.message}
            {...register("valorDesconto", { valueAsNumber: true })}
          />
          <FormField
            id="valorJuros"
            label="Juros"
            type="number"
            step="0.01"
            error={errors.valorJuros?.message}
            {...register("valorJuros", { valueAsNumber: true })}
          />
          <FormField
            id="dataEmissao"
            label="Data de Emissão"
            type="date"
            required
            error={errors.dataEmissao?.message}
            {...register("dataEmissao")}
          />
          <FormField
            id="dataVencimento"
            label="Data de Vencimento"
            type="date"
            required
            error={errors.dataVencimento?.message}
            {...register("dataVencimento")}
          />
          <FormField id="observacao" label="Observação" error={errors.observacao?.message} {...register("observacao")} />
        </FormSection>

        <Button type="submit" loading={saving}>
          Cadastrar
        </Button>
      </form>
    </div>
  );
}
