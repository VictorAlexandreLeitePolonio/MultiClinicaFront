"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormSection } from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { PlanoSchema, PlanoFormData } from "../schemas/plano.schema";
import { usePlanoInsert } from "../hooks/insert";
import { toast } from "sonner";

interface Props {
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

export default function PlanoRegister({ onBack, onSave }: Props) {
  const { insertPlano, isPending } = usePlanoInsert();

  const {
    handleSubmit,
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

  const onSubmit = async (data: PlanoFormData) => {
    try {
      await insertPlano(data);
      toast.success("Plano cadastrado com sucesso!");
      onSave();
    } catch {
      // erro já tratado no hook
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Novo Plano" onBack={onBack} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Dados do Plano" columns={1}>
          <FormField
            label="Nome *"
            id="name"
            error={errors.name?.message}
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
              className="text-sm font-semibold text-[#1a2a4a] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Tipo de Plano *
            </label>
            <select
              value={tipoPlano}
              onChange={(e) =>
                setValue("tipoPlano", e.target.value as "Mensal" | "Avulso", {
                  shouldValidate: true,
                })
              }
              className="w-full px-4 py-3 bg-white border-2 border-[#e2ebe6] rounded-sm text-[#1a2a4a]
                focus:border-[#1a4a3a] focus:shadow-[3px_3px_0_0_#1a4a3a] focus:outline-none transition-all"
              style={{ fontFamily: "var(--font-serif)" }}
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
              className="text-sm font-semibold text-[#1a2a4a] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Tipo de Sessão *
            </label>
            <select
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
              className="w-full px-4 py-3 bg-white border-2 border-[#e2ebe6] rounded-sm text-[#1a2a4a]
                focus:border-[#1a4a3a] focus:shadow-[3px_3px_0_0_#1a4a3a] focus:outline-none transition-all"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {tipoSessaoOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
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
