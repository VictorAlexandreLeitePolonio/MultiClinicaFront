"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormSection";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCategoriasFinanceiras } from "@/app/(authenticated)/app/financeiro/configuracoes/services/categoriasFinanceiras.service";
import { useFornecedores } from "@/app/(authenticated)/app/financeiro/fornecedores/hooks/useFornecedores";
import { getApiErrorMessage } from "@/utils/apiError";
import { useContaPagar, useContaPagarMutations } from "../hooks/useContaPagar";
import {
  CreateContaPagarFormData,
  CreateContaPagarSchema,
} from "../schemas/contaPagar.schema";
import type {
  ContaPagar,
  UpdateContaPagarPayload,
} from "../services/contasPagar.service";

interface ContaPagarRegisterProps {
  id?: number | null;
  onBack: () => void;
  onSave: () => void;
}

function toDateInputValue(value?: string | null): string {
  return value ? value.slice(0, 10) : "";
}

function getDefaultValues(conta?: ContaPagar | null): CreateContaPagarFormData {
  return {
    fornecedorId: conta?.fornecedorId ?? 0,
    categoriaFinanceiraId: conta?.categoriaFinanceiraId ?? null,
    descricao: conta?.descricao ?? "",
    valorOriginal: conta?.valorOriginal ?? 0,
    valorDesconto: conta?.valorDesconto ?? 0,
    valorJuros: conta?.valorJuros ?? 0,
    dataEmissao: toDateInputValue(conta?.dataEmissao) || new Date().toISOString().slice(0, 10),
    dataVencimento: toDateInputValue(conta?.dataVencimento),
    observacao: conta?.observacao ?? "",
  };
}

export function ContaPagarRegister({ id = null, onBack, onSave }: ContaPagarRegisterProps) {
  const editing = id !== null;
  const contaQuery = useContaPagar(id);
  const fornecedoresQuery = useFornecedores({ page: 1, pageSize: 100 });
  const categoriasQuery = useQuery({
    queryKey: ["categorias-financeiras", "despesa"],
    queryFn: () => getCategoriasFinanceiras({ tipo: "Despesa", page: 1, pageSize: 100 }),
  });
  const { createContaPagar, updateContaPagar, isCreating, isUpdating } = useContaPagarMutations();
  const conta = contaQuery.data;
  const defaultValues = useMemo(() => getDefaultValues(conta), [conta]);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CreateContaPagarFormData>({
    resolver: zodResolver(CreateContaPagarSchema),
    values: defaultValues,
  });

  const saving = isCreating || isUpdating;

  const onSubmit = async (data: CreateContaPagarFormData) => {
    try {
      if (editing && id !== null) {
        const payload: UpdateContaPagarPayload = {
          categoriaFinanceiraId: data.categoriaFinanceiraId,
          descricao: data.descricao,
          valorOriginal: data.valorOriginal,
          valorDesconto: data.valorDesconto,
          valorJuros: data.valorJuros,
          dataVencimento: data.dataVencimento,
          observacao: data.observacao || null,
        };
        await updateContaPagar(id, payload);
        toast.success("Conta a pagar atualizada!");
      } else {
        await createContaPagar({
          ...data,
          observacao: data.observacao || null,
        });
        toast.success("Conta a pagar cadastrada!");
      }
      onSave();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao salvar conta a pagar."));
    }
  };

  if (editing && contaQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Editar Conta a Pagar" onBack={onBack} />
        <div className="h-48 animate-pulse rounded-2xl bg-[#d7f3ea] dark:bg-slate-800" />
      </div>
    );
  }

  if (editing && (contaQuery.isError || !conta)) {
    return (
      <div className="space-y-6">
        <PageHeader title="Editar Conta a Pagar" onBack={onBack} />
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">
          {getApiErrorMessage(contaQuery.error, "Conta a pagar não encontrada.")}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title={editing ? `Editar Conta a Pagar #${id}` : "Nova Conta a Pagar"} onBack={onBack} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Dados da Conta">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#0f172a] dark:text-white">Fornecedor *</label>
            <select
              {...register("fornecedorId", { valueAsNumber: true })}
              disabled={editing}
              className="w-full rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-[#0f172a] disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <option value={0}>Selecione um fornecedor</option>
              {(fornecedoresQuery.data?.data ?? [])
                .filter((fornecedor) => fornecedor.isActive || fornecedor.id === conta?.fornecedorId)
                .map((fornecedor) => (
                  <option key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.nome}
                  </option>
                ))}
            </select>
            {errors.fornecedorId && <span className="text-xs text-red-600">{errors.fornecedorId.message}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#0f172a] dark:text-white">Categoria de despesa</label>
            <select
              {...register("categoriaFinanceiraId", {
                setValueAs: (value) => (Number(value) > 0 ? Number(value) : null),
              })}
              className="w-full rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-[#0f172a] dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <option value={0}>Sem categoria</option>
              {(categoriasQuery.data?.data ?? []).map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>

          <FormField id="conta-pagar-descricao" label="Descrição" required error={errors.descricao?.message} {...register("descricao")} />
          <FormField id="conta-pagar-valor" label="Valor Original" type="number" step="0.01" required error={errors.valorOriginal?.message} {...register("valorOriginal", { valueAsNumber: true })} />
          <FormField id="conta-pagar-desconto" label="Desconto" type="number" step="0.01" error={errors.valorDesconto?.message} {...register("valorDesconto", { valueAsNumber: true })} />
          <FormField id="conta-pagar-juros" label="Juros" type="number" step="0.01" error={errors.valorJuros?.message} {...register("valorJuros", { valueAsNumber: true })} />
          <FormField id="conta-pagar-emissao" label="Data de Emissão" type="date" required disabled={editing} error={errors.dataEmissao?.message} {...register("dataEmissao")} />
          <FormField id="conta-pagar-vencimento" label="Data de Vencimento" type="date" required error={errors.dataVencimento?.message} {...register("dataVencimento")} />
          <FormField id="conta-pagar-observacao" label="Observação" error={errors.observacao?.message} {...register("observacao")} />
        </FormSection>

        <Button type="submit" loading={saving}>
          {editing ? "Salvar alterações" : "Cadastrar"}
        </Button>
      </form>
    </div>
  );
}
