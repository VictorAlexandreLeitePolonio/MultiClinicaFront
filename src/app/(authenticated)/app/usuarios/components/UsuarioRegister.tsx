"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormSection } from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { UsuarioInviteSchema, UsuarioInviteFormData } from "../schemas/usuario.schema";
import { useUsuarioInsert } from "../hooks/insert";

interface Props {
  onBack: () => void;
  onSave: () => void;
  /** "sheet" remove o cabeçalho de página quando renderizado dentro do FormSheet. */
  variant?: "page" | "sheet";
  onDirtyChange?: (dirty: boolean) => void;
}

const roleOptions = [
  { value: "Profissional", label: "Profissional" },
  { value: "Recepcao", label: "Recepção" },
];

export default function UsuarioRegister({
  onBack,
  onSave,
  variant = "page",
  onDirtyChange,
}: Props) {
  const { insertUsuario, isPending } = useUsuarioInsert();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<UsuarioInviteFormData>({
    resolver: zodResolver(UsuarioInviteSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Profissional",
    },
  });

  const name = watch("name");
  const email = watch("email");
  const role = watch("role");

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const onSubmit = async (data: UsuarioInviteFormData) => {
    try {
      const result = await insertUsuario(data);
      if (result.emailSent) toast.success("Convite enviado! A pessoa receberá um link para definir a senha.");
      else toast.warning("Usuário criado, mas o e-mail não foi enviado. Use “Reenviar convite” na lista.");
      onSave();
    } catch {
      return; // O hook mantém o formulário aberto e apresenta o erro.
    }
  };

  return (
    <div className={variant === "page" ? "space-y-6 max-w-2xl" : "space-y-6"}>
      {variant === "page" && <PageHeader title="Convidar para a equipe" onBack={onBack} />}

      <p className="text-sm text-slate-600 dark:text-slate-300">Informe nome, e-mail e perfil. O convite vale por 72 horas; a pessoa define a própria senha.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Dados do Usuário" columns={1}>
          <FormField
            label="Nome *"
            id="name"
            error={errors.name?.message}
            value={name || ""}
            onChange={(e) => setValue("name", e.target.value, { shouldValidate: true, shouldDirty: true })}
          />

          <FormField
            label="E-mail *"
            id="email"
            type="email"
            error={errors.email?.message}
            value={email || ""}
            onChange={(e) => setValue("email", e.target.value, { shouldValidate: true, shouldDirty: true })}
          />

          {/* Select de Perfil */}
          <div className="flex flex-col gap-2">
            <label htmlFor="invite-role"
              className="text-sm font-semibold text-secondary dark:text-white uppercase tracking-wider"
            >
              Perfil *
            </label>
            <select id="invite-role"
              value={role}
              onChange={(e) => setValue("role", e.target.value as UsuarioInviteFormData["role"], { shouldValidate: true, shouldDirty: true })}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-secondary dark:text-white
                focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </FormSection>

        <Button type="submit" loading={isPending}>
          Enviar convite
        </Button>
      </form>
    </div>
  );
}
