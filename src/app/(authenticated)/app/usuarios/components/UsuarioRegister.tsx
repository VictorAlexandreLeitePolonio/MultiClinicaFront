"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormSection } from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/Button";
import { UsuarioCreateSchema, UsuarioCreateFormData } from "../schemas/usuario.schema";
import { useUsuarioInsert } from "../hooks/insert";

interface Props {
  onBack: () => void;
  onSave: () => void;
}

const roleOptions = [
  { value: "Administrador", label: "Administrador" },
  { value: "Profissional", label: "Profissional" },
  { value: "Recepcao", label: "Recepção" },
];

export default function UsuarioRegister({ onBack, onSave }: Props) {
  const { insertUsuario, isPending } = useUsuarioInsert();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UsuarioCreateFormData>({
    resolver: zodResolver(UsuarioCreateSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "Profissional",
    },
  });

  const name = watch("name");
  const email = watch("email");
  const password = watch("password");
  const role = watch("role");

  const onSubmit = async (data: UsuarioCreateFormData) => {
    try {
      await insertUsuario(data);
      toast.success("Usuário cadastrado com sucesso!");
      onSave();
    } catch {
      // erro já tratado no hook
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Novo Usuário" onBack={onBack} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Dados do Usuário" columns={1}>
          <FormField
            label="Nome *"
            id="name"
            error={errors.name?.message}
            value={name || ""}
            onChange={(e) => setValue("name", e.target.value, { shouldValidate: true })}
          />

          <FormField
            label="E-mail *"
            id="email"
            type="email"
            error={errors.email?.message}
            value={email || ""}
            onChange={(e) => setValue("email", e.target.value, { shouldValidate: true })}
          />

          <PasswordField
            label="Senha *"
            id="password"
            placeholder="Mínimo 6 caracteres"
            error={errors.password?.message}
            value={password || ""}
            onChange={(e) => setValue("password", e.target.value, { shouldValidate: true })}
          />

          {/* Select de Perfil */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-semibold text-secondary dark:text-white uppercase tracking-wider"
            >
              Perfil *
            </label>
            <select
              value={role}
              onChange={(e) => setValue("role", e.target.value as UsuarioCreateFormData["role"], { shouldValidate: true })}
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
          Cadastrar
        </Button>
      </form>
    </div>
  );
}
