"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormSection } from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { UsuarioSchema, UsuarioFormData } from "../schemas/usuario.schema";
import { useUsuarioById } from "../hooks/getId";
import { useUsuarioUpdate } from "../hooks/update";
import { toast } from "sonner";
import { Eye, Edit3, Save, X } from "lucide-react";

interface Props {
  id: number;
  onBack: () => void;
  onSave: () => void;
}

const roleOptions = [
  { value: "Administrador", label: "Administrador" },
  { value: "Profissional", label: "Profissional" },
  { value: "Recepcao", label: "Recepção" },
];

function isClinicUserRole(role: string): role is UsuarioFormData["role"] {
  return roleOptions.some((option) => option.value === role);
}

export default function UsuarioDetails({ id, onBack, onSave }: Props) {
  const { data, loading, error } = useUsuarioById(id);
  const { updateUsuario, isPending } = useUsuarioUpdate();
  const [isEditing, setIsEditing] = useState(false);

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(UsuarioSchema),
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
    if (data) {
      reset({
        name: data.name,
        email: data.email,
        role: isClinicUserRole(data.role) ? data.role : "Profissional",
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData: UsuarioFormData) => {
    try {
      await updateUsuario(id, formData);
      toast.success("Usuário atualizado com sucesso!");
      setIsEditing(false);
      onSave();
    } catch {
      // erro já tratado no hook
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (data) {
      reset({
        name: data.name,
        email: data.email,
        role: isClinicUserRole(data.role) ? data.role : "Profissional",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <PageHeader title="Detalhes do Usuário" onBack={onBack} />
        <p className="text-gray-600 dark:text-slate-300">
          Carregando...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-2xl">
        <PageHeader title="Detalhes do Usuário" onBack={onBack} />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Detalhes do Usuário"
        onBack={onBack}
        actions={
          !isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 size={16} className="mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelEdit}>
                <X size={16} className="mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSubmit(onSubmit)} loading={isPending}>
                <Save size={16} className="mr-2" />
                Salvar Alterações
              </Button>
            </div>
          )
        }
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
          isEditing
            ? "bg-primary-dark/10 border-primary-dark"
            : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
        }`}
      >
        {isEditing ? (
          <>
            <Edit3 size={18} className="text-primary-dark" />
            <span className="text-sm font-semibold text-primary-dark">
              Modo Edição — Você pode alterar os dados abaixo
            </span>
          </>
        ) : (
          <>
            <Eye size={18} className="text-gray-600 dark:text-slate-300" />
            <span className="text-sm font-semibold text-gray-600 dark:text-slate-300">
              Modo Visualização — Clique em &quot;Editar&quot; para modificar
            </span>
          </>
        )}
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Dados do Usuário" columns={1}>
          <FormField
            label="Nome *"
            id="name"
            error={errors.name?.message}
            disabled={!isEditing}
            value={name || ""}
            onChange={(e) => setValue("name", e.target.value, { shouldValidate: true })}
          />

          <FormField
            label="E-mail *"
            id="email"
            type="email"
            error={errors.email?.message}
            disabled={!isEditing}
            value={email || ""}
            onChange={(e) => setValue("email", e.target.value, { shouldValidate: true })}
          />

          {/* Select de Perfil */}
          <div className="flex flex-col gap-2">
            <label
              className={`text-sm font-semibold uppercase tracking-wider ${
                !isEditing ? "text-gray-400" : "text-secondary dark:text-white"
              }`}
            >
              Perfil *
            </label>
            <select
              disabled={!isEditing}
              value={role}
              onChange={(e) => setValue("role", e.target.value as UsuarioFormData["role"], { shouldValidate: true })}
              className={`w-full px-4 py-3 border rounded-xl transition-all
                ${!isEditing
                  ? "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 cursor-not-allowed"
                  : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-secondary dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none"
                }`}
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </FormSection>

        <div className="flex gap-2 md:hidden">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 size={16} className="mr-2" />
              Editar
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                <X size={16} className="mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSubmit(onSubmit)} loading={isPending}>
                <Save size={16} className="mr-2" />
                Salvar
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
