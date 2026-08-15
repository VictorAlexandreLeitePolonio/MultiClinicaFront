"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useCategoriasProduto } from "../../categorias-produto/hooks/useCategoriasProduto";
import { ProdutoSchema, type ProdutoFormData } from "../schemas/produto.schema";

interface ProdutoRegisterProps { open: boolean; defaultValues: ProdutoFormData; loading?: boolean; onClose: () => void; onSubmit: (data: ProdutoFormData) => Promise<void> | void; }

export function ProdutoRegister({ open, defaultValues, loading, onClose, onSubmit }: ProdutoRegisterProps) {
  const { data } = useCategoriasProduto({ page: 1, pageSize: 100 });
  const { register, handleSubmit, formState: { errors } } = useForm<ProdutoFormData>({ resolver: zodResolver(ProdutoSchema), values: defaultValues });
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"><form onSubmit={handleSubmit(onSubmit)} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#d7f3ea] bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Produto</h2><div data-tutorial="product-form-fields" className="mt-5 grid gap-4 sm:grid-cols-2"><FormField id="produto-nome" label="Nome" required error={errors.nome?.message} {...register("nome")} /><div className="flex flex-col gap-2"><label htmlFor="produto-categoria" className="text-sm font-semibold">Categoria</label><select id="produto-categoria" className="rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900" {...register("categoriaProdutoId", { valueAsNumber: true })}><option value={0}>Sem categoria</option>{data?.data.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></div><FormField id="produto-codigo-interno" label="Código interno" {...register("codigoInterno")} /><FormField id="produto-codigo-barras" label="Código de barras" {...register("codigoBarras")} /><FormField id="produto-valor-compra" label="Valor de compra" type="number" step="0.01" error={errors.valorCompra?.message} {...register("valorCompra", { valueAsNumber: true })} /><FormField id="produto-valor-venda" label="Valor de venda" type="number" step="0.01" error={errors.valorVenda?.message} {...register("valorVenda", { valueAsNumber: true })} /><FormField id="produto-quantidade-minima" label="Quantidade mínima" type="number" error={errors.quantidadeMinima?.message} {...register("quantidadeMinima", { valueAsNumber: true })} /><FormField id="produto-descricao" label="Descrição" {...register("descricao")} /></div><div className="mt-6 flex gap-3"><Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button><div data-tutorial="product-form-save"><Button type="submit" loading={loading}>Salvar</Button></div></div></form></div>;
}
