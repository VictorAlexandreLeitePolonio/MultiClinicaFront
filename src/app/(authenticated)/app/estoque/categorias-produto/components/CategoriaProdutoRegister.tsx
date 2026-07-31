"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { CategoriaProdutoSchema, type CategoriaProdutoFormData } from "../schemas/categoriaProduto.schema";

interface Props { open: boolean; defaultValues: CategoriaProdutoFormData; loading?: boolean; onClose: () => void; onSubmit: (data: CategoriaProdutoFormData) => Promise<void> | void; }
export function CategoriaProdutoRegister({ open, defaultValues, loading, onClose, onSubmit }: Props) { const { register, handleSubmit, formState: { errors } } = useForm<CategoriaProdutoFormData>({ resolver: zodResolver(CategoriaProdutoSchema), values: defaultValues }); if (!open) return null; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"><form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-2xl border border-[#d7f3ea] bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><h2 className="text-lg font-bold">Categoria de Produto</h2><div className="mt-5"><FormField id="categoria-produto-nome" label="Nome" required error={errors.nome?.message} {...register("nome")} /></div><div className="mt-6 flex gap-3"><Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button><Button type="submit" loading={loading}>Salvar</Button></div></form></div>; }
