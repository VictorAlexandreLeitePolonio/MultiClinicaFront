"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { Plus, Trash2, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { formatCurrency } from "@/utils/formatters";
import { useFornecedores } from "../../../financeiro/fornecedores/hooks/useFornecedores";
import { useProdutos } from "../../produtos/hooks/useProdutos";
import { CompraSchema, type CompraFormData } from "../schemas/compra.schema";

interface Props {
  defaultValues: CompraFormData;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: CompraFormData) => Promise<void> | void;
}

export function CompraRegister({ defaultValues, loading, onClose, onSubmit }: Props) {
  const fornecedores = useFornecedores({ page: 1, pageSize: 100 });
  const produtos = useProdutos({ page: 1, pageSize: 100 });
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<CompraFormData>({
    resolver: zodResolver(CompraSchema),
    values: defaultValues,
  });
  const { fields, append, remove } = useFieldArray({ control, name: "itens" });
  const itens = watch("itens");
  const total = (itens ?? []).reduce(
    (sum, item) => sum + (Number(item?.quantidade) || 0) * (Number(item?.valorUnitario) || 0),
    0,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <motion.form
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        onSubmit={handleSubmit(onSubmit)}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#d7f3ea] bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d7f3ea] px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Registrar compra</h2>
            <p className="text-sm text-[#64748b] dark:text-slate-400">Fornecedor, data e itens adquiridos.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-2 text-[#64748b] transition-colors hover:bg-[#ecfdf5] hover:text-[#0f766e] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              id="compra-fornecedor"
              label="Fornecedor"
              error={errors.fornecedorId?.message}
              {...register("fornecedorId", { valueAsNumber: true })}
            >
              <option value={0}>Selecione</option>
              {fornecedores.data?.data.filter((item) => item.isActive).map((item) => (
                <option key={item.id} value={item.id}>{item.nome}</option>
              ))}
            </Select>
            <FormField id="compra-data" label="Data da compra" type="date" error={errors.dataCompra?.message} {...register("dataCompra")} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#0f172a] dark:text-white">Itens</h3>
              <Button type="button" variant="outline" onClick={() => append({ produtoId: 0, quantidade: 1, valorUnitario: 0 })}>
                <span className="inline-flex items-center gap-1"><Plus size={15} />Adicionar item</span>
              </Button>
            </div>

            {errors.itens?.message && <p className="text-xs text-red-600">{errors.itens.message}</p>}

            {fields.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#d7f3ea] px-4 py-6 text-center text-sm text-[#64748b] dark:border-slate-700 dark:text-slate-400">
                Nenhum item adicionado ainda.
              </p>
            ) : (
              fields.map((field, index) => {
                const subtotal = (Number(itens?.[index]?.quantidade) || 0) * (Number(itens?.[index]?.valorUnitario) || 0);
                return (
                  <div key={field.id} className="rounded-xl border border-[#d7f3ea] bg-[#f8fffc] p-4 dark:border-slate-800 dark:bg-slate-950/40">
                    <div className="grid items-end gap-3 sm:grid-cols-[1fr_100px_130px_auto]">
                      <Select
                        id={`compra-item-produto-${index}`}
                        label="Produto"
                        error={errors.itens?.[index]?.produtoId?.message}
                        {...register(`itens.${index}.produtoId`, { valueAsNumber: true })}
                      >
                        <option value={0}>Selecione</option>
                        {produtos.data?.data.filter((item) => item.isActive).map((item) => (
                          <option key={item.id} value={item.id}>{item.nome}</option>
                        ))}
                      </Select>
                      <FormField id={`compra-item-quantidade-${index}`} label="Qtd." type="number" error={errors.itens?.[index]?.quantidade?.message} {...register(`itens.${index}.quantidade`, { valueAsNumber: true })} />
                      <FormField id={`compra-item-valor-${index}`} label="Valor unit." type="number" step="0.01" error={errors.itens?.[index]?.valorUnitario?.message} {...register(`itens.${index}.valorUnitario`, { valueAsNumber: true })} />
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        aria-label="Remover item"
                        className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 text-red-500 transition-colors hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/40"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="mt-2 text-right text-xs font-medium text-[#64748b] dark:text-slate-400">
                      Subtotal: <span className="text-[#0f766e] dark:text-[#67e8f9]">{formatCurrency(subtotal)}</span>
                    </p>
                  </div>
                );
              })
            )}
          </div>

          <FormField id="compra-observacao" label="Observação" {...register("observacao")} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-[#d7f3ea] px-6 py-4 dark:border-slate-800">
          <div className="text-sm">
            <span className="text-[#64748b] dark:text-slate-400">Total</span>
            <p className="text-lg font-bold text-[#0f172a] dark:text-white">{formatCurrency(total)}</p>
          </div>
          <div className="flex w-auto gap-3">
            <div className="w-32"><Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button></div>
            <div className="w-32"><Button type="submit" loading={loading}>Salvar</Button></div>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
