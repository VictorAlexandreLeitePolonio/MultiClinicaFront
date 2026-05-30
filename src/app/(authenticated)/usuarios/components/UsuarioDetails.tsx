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
  { value: "Admin", label: "Administrador" },
  { value: "Fisio", label: "Fisioterapeuta" },
];

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
      role: "Fisio",
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
        role: data.role,
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
        role: data.role,
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <PageHeader title="Detalhes do Usuário" onBack={onBack} />
        <p className="text-[#4a6354]" style={{ fontFamily: "var(--font-serif)" }}>
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
        className={`flex items-center gap-2 px-4 py-3 rounded-sm border-2 ${
          isEditing
            ? "bg-[#1a4a3a]/10 border-[#1a4a3a]"
            : "bg-[#f0f4f2] border-[#e2ebe6]"
        }`}
      >
        {isEditing ? (
          <>
            <Edit3 size={18} className="text-[#1a4a3a]" />
            <span className="text-sm font-semibold text-[#1a4a3a]" style={{ fontFamily: "var(--font-serif)" }}>
              Modo Edição — Você pode alterar os dados abaixo
            </span>
          </>
        ) : (
          <>
            <Eye size={18} className="text-[#4a6354]" />
            <span className="text-sm font-semibold text-[#4a6354]" style={{ fontFamily: "var(--font-serif)" }}>
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
                !isEditing ? "text-gray-400" : "text-[#1a2a4a]"
              }`}
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Perfil *
            </label>
            <select
              disabled={!isEditing}
              value={role}
              onChange={(e) => setValue("role", e.target.value as "Admin" | "Fisio", { shouldValidate: true })}
              className={`w-full px-4 py-3 border-2 rounded-sm transition-all
                ${!isEditing
                  ? "bg-[#f0f4f2] border-[#e2ebe6] text-gray-400 cursor-not-allowed"
                  : "bg-white border-[#e2ebe6] text-[#1a2a4a] focus:border-[#1a4a3a] focus:shadow-[3px_3px_0_0_#1a4a3a] focus:outline-none"
                }`}
              style={{ fontFamily: "var(--font-serif)" }}
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
