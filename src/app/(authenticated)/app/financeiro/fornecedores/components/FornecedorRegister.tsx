"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import {
  FornecedorFormData,
  FornecedorSchema,
} from "../schemas/fornecedor.schema";

interface FornecedorRegisterProps {
  open: boolean;
  defaultValues: FornecedorFormData;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: FornecedorFormData) => Promise<void> | void;
}

export function FornecedorRegister({
  open,
  defaultValues,
  loading,
  onClose,
  onSubmit,
}: FornecedorRegisterProps) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FornecedorFormData>({
    resolver: zodResolver(FornecedorSchema),
    values: defaultValues,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">
          Fornecedor
        </h2>
        <div className="mt-5">
          <FormField
            id="fornecedor-nome"
            label="Nome"
            required
            error={errors.nome?.message}
            {...register("nome")}
          />
        </div>
        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
}
