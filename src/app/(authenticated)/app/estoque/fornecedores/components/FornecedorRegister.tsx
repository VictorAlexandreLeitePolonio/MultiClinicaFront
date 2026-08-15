"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { FornecedorSchema, type FornecedorFormData } from "../schemas/fornecedor.schema";

interface Props {
  open: boolean;
  defaultValues: FornecedorFormData;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: FornecedorFormData) => Promise<void> | void;
}

export function FornecedorRegister({ open, defaultValues, loading, onClose, onSubmit }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FornecedorFormData>({
    resolver: zodResolver(FornecedorSchema),
    values: defaultValues,
  });
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <motion.form
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-[#d7f3ea] bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-[#d7f3ea] px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Fornecedor</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-2 text-[#64748b] transition-colors hover:bg-[#ecfdf5] hover:text-[#0f766e] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div data-tutorial="supplier-form-fields" className="px-6 py-5">
          <FormField id="fornecedor-nome" label="Nome" required error={errors.nome?.message} {...register("nome")} />
        </div>
        <div className="flex gap-3 border-t border-[#d7f3ea] px-6 py-4 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <div data-tutorial="supplier-form-save"><Button type="submit" loading={loading}>Salvar</Button></div>
        </div>
      </motion.form>
    </div>
  );
}
