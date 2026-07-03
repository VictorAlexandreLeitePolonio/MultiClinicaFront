"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormSection } from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { PlanoSchema, PlanoFormData } from "../schemas/plano.schema";
import { usePlanoById } from "../hooks/getId";
import { usePlanoUpdate } from "../hooks/update";
import { toast } from "sonner";
import { Eye, Edit3, Save, X } from "lucide-react";

interface Props {
  id: number;
  onBack: () => void;
  onSave: () => void;
}

const tipoPlanoOptions = [
  { value: "Mensal", label: "Mensal" },
  { value: "Avulso", label: "Avulso" },
];

const tipoSessaoOptions = [
  "Fisioterapia",
  "Pilates",
  "Massagem",
  "Hidrolipo",
  "Lipedema",
  "Linfedema",
];

export default function PlanoDetails({ id, onBack, onSave }: Props) {
  const { data, loading, error } = usePlanoById(id);
  const { updatePlano, isPending } = usePlanoUpdate();
  const [isEditing, setIsEditing] = useState(false);

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlanoFormData>({
    resolver: zodResolver(PlanoSchema),
    defaultValues: {
      name: "",
      valor: 0,
      tipoPlano: "Mensal",
      tipoSessao: "Fisioterapia",
    },
  });

  const name = watch("name");
  const valor = watch("valor");
  const tipoPlano = watch("tipoPlano");
  const tipoSessao = watch("tipoSessao");

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        valor: data.valor,
        tipoPlano: data.tipoPlano,
        tipoSessao: data.tipoSessao,
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData: PlanoFormData) => {
    try {
      await updatePlano(id, formData);
      toast.success("Plano atualizado com sucesso!");
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
        valor: data.valor,
        tipoPlano: data.tipoPlano,
        tipoSessao: data.tipoSessao,
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <PageHeader title="Detalhes do Plano" onBack={onBack} />
        <p className="text-gray-600 dark:text-slate-300">
          Carregando...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-2xl">
        <PageHeader title="Detalhes do Plano" onBack={onBack} />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Detalhes do Plano"
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
        <FormSection title="Dados do Plano" columns={1}>
          <FormField
            label="Nome *"
            id="name"
            error={errors.name?.message}
            disabled={!isEditing}
            value={name || ""}
            onChange={(e) =>
              setValue("name", e.target.value, { shouldValidate: true })
            }
          />

          <FormField
            label="Valor (R$) *"
            id="valor"
            type="number"
            step="0.01"
            error={errors.valor?.message}
            disabled={!isEditing}
            value={String(valor) || ""}
            onChange={(e) =>
              setValue("valor", Number(e.target.value), {
                shouldValidate: true,
              })
            }
          />

          {/* Select Tipo Plano */}
          <div className="flex flex-col gap-2">
            <label
              className={`text-sm font-semibold uppercase tracking-wider ${
                !isEditing ? "text-gray-400" : "text-secondary dark:text-white"
              }`}
            >
              Tipo de Plano *
            </label>
            <select
              disabled={!isEditing}
              value={tipoPlano}
              onChange={(e) =>
                setValue("tipoPlano", e.target.value as "Mensal" | "Avulso", {
                  shouldValidate: true,
                })
              }
              className={`w-full px-4 py-3 border rounded-xl transition-all
                ${
                  !isEditing
                    ? "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 cursor-not-allowed"
                    : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-secondary dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none"
                }`}
            >
              {tipoPlanoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Select Tipo Sessão */}
          <div className="flex flex-col gap-2">
            <label
              className={`text-sm font-semibold uppercase tracking-wider ${
                !isEditing ? "text-gray-400" : "text-secondary dark:text-white"
              }`}
            >
              Tipo de Sessão *
            </label>
            <select
              disabled={!isEditing}
              value={tipoSessao}
              onChange={(e) =>
                setValue(
                  "tipoSessao",
                  e.target.value as
                    | "Fisioterapia"
                    | "Pilates"
                    | "Massagem"
                    | "Hidrolipo"
                    | "Lipedema"
                    | "Linfedema",
                  { shouldValidate: true },
                )
              }
              className={`w-full px-4 py-3 border rounded-xl transition-all
                ${
                  !isEditing
                    ? "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 cursor-not-allowed"
                    : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-secondary dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none"
                }`}
            >
              {tipoSessaoOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
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
