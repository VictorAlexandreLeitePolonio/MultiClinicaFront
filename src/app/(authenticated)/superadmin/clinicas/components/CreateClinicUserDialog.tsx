"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { PasswordField } from "@/components/ui/PasswordField";

const ClinicUserSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["Administrador", "Profissional", "Recepcao"]),
});

export type CreateClinicUserFormData = z.infer<typeof ClinicUserSchema>;

interface CreateClinicUserDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClinicUserFormData) => Promise<void> | void;
}

export function CreateClinicUserDialog({
  open,
  loading,
  onClose,
  onSubmit,
}: CreateClinicUserDialogProps) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CreateClinicUserFormData>({
    resolver: zodResolver(ClinicUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "Administrador",
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md rounded-sm border-2 border-[#1a2a4a] bg-white p-6 shadow-[6px_6px_0_0_rgba(26,42,74,0.25)] dark:border-slate-700 dark:bg-slate-900"
      >
        <h2 className="text-lg font-bold text-[#1a2a4a] dark:text-slate-50">
          Novo usuário
        </h2>
        <p className="mt-2 text-sm text-[#4a6354] dark:text-slate-300">
          Crie um usuário operacional vinculado a esta clínica.
        </p>

        <div className="mt-5 space-y-4">
          <FormField id="clinic-user-name" label="Nome" error={errors.name?.message} {...register("name")} />
          <FormField id="clinic-user-email" label="E-mail" type="email" error={errors.email?.message} {...register("email")} />
          <PasswordField id="clinic-user-password" label="Senha" error={errors.password?.message} {...register("password")} />

          <div className="flex flex-col gap-2">
            <label
              htmlFor="clinic-user-role"
              className="text-sm font-semibold uppercase tracking-wide text-[#1a2a4a]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Perfil
            </label>
            <select
              id="clinic-user-role"
              className="w-full rounded-sm border-2 border-[#e2ebe6] bg-[#fdfcfa] px-4 py-3 text-[#1a2a4a] transition-all duration-150 focus:border-[#5a9c94] focus:shadow-[3px_3px_0_0_#5a9c94] focus:outline-none"
              style={{ fontFamily: "var(--font-serif)" }}
              {...register("role")}
            >
              <option value="Administrador">Administrador</option>
              <option value="Profissional">Profissional</option>
              <option value="Recepcao">Recepção</option>
            </select>
            {errors.role?.message && (
              <span className="text-xs font-medium text-red-600">{errors.role.message}</span>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Criar usuário
          </Button>
        </div>
      </form>
    </div>
  );
}
