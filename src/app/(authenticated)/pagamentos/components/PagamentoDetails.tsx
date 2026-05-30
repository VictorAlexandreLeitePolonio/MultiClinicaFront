"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormSection } from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { PagamentoSchema, PagamentoFormData } from "../schemas/pagamento.schema";
import { usePagamentoById } from "../hooks/getId";
import { usePagamentoUpdate } from "../hooks/update";
import { usePlanos } from "../hooks/usePlanos";
import { Eye, Edit3, Save, X } from "lucide-react";
import { Patient, PagedResult } from "@/types";
import api from "@/lib/api";
import { formatCurrency } from "@/utils/formatters";
import { toast } from "sonner";

interface Props {
  id: number;
  onBack: () => void;
  onSave: () => void;
}

const paymentStatusOptions = [
  { value: "Pending", label: "Pendente" },
  { value: "Paid", label: "Pago" },
  { value: "Cancelled", label: "Cancelado" },
];

const paymentMethodOptions = [
  "Dinheiro",
  "Cartão",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Pix",
  "Boleto",
  "Transferência",
];

export default function PagamentoDetails({ id, onBack, onSave }: Props) {
  const { data, loading, error } = usePagamentoById(id);
  const { updatePagamento, isPending } = usePagamentoUpdate();
  const { data: planos, loading: loadingPlanos } = usePlanos();
  const [isEditing, setIsEditing] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PagamentoFormData>({
    resolver: zodResolver(PagamentoSchema),
    defaultValues: {
      patientId: 0,
      planId: 0,
      referenceMonth: "",
      paymentMethod: "",
      status: "Pending",
      paymentDate: null,
    },
  });

  const status = watch("status");
  const patientId = watch("patientId");
  const planId = watch("planId");
  const referenceMonth = watch("referenceMonth");
  const paymentMethod = watch("paymentMethod");
  const paidAt = watch("paidAt");
  const paymentDate = watch("paymentDate");

  const selectedPlan = planos.find((p) => p.id === planId);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get<PagedResult<Patient>>("/api/patients");
        setPatients(response.data.data);
      } catch {
        // erro silencioso
      }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    if (data) {
      reset({
        patientId:     data.patientId,
        planId:        data.planId,
        referenceMonth: data.referenceMonth,
        paymentMethod: data.paymentMethod,
        status:        data.status,
        // input[type=date] exige "YYYY-MM-DD" — a API retorna ISO completo "2026-03-25T00:00:00Z"
        paidAt:      data.paidAt      ? data.paidAt.split("T")[0]      : "",
        paymentDate: data.paymentDate ? data.paymentDate.split("T")[0] : null,
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData: PagamentoFormData) => {
    try {
      await updatePagamento(id, formData);
      toast.success("Pagamento atualizado com sucesso!");
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
        patientId:      data.patientId,
        planId:         data.planId,
        referenceMonth: data.referenceMonth,
        paymentMethod:  data.paymentMethod,
        status:         data.status,
        paidAt:      data.paidAt      ? data.paidAt.split("T")[0]      : "",
        paymentDate: data.paymentDate ? data.paymentDate.split("T")[0] : null,
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <PageHeader title="Detalhes do Pagamento" onBack={onBack} />
        <p className="text-[#4a6354]" style={{ fontFamily: "var(--font-serif)" }}>
          Carregando...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-2xl">
        <PageHeader title="Detalhes do Pagamento" onBack={onBack} />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Detalhes do Pagamento"
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
        <FormSection title="Dados do Pagamento">
          {/* Select de Paciente */}
          <div className="flex flex-col gap-2">
            <label
              className={`text-sm font-semibold uppercase tracking-wider ${
                !isEditing ? "text-gray-400" : "text-[#1a2a4a]"
              }`}
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Paciente *
            </label>
            <select
              disabled={!isEditing}
              value={patientId || 0}
              onChange={(e) => setValue("patientId", Number(e.target.value), { shouldValidate: true })}
              className={`w-full px-4 py-3 border-2 rounded-sm transition-all
                ${!isEditing
                  ? "bg-[#f0f4f2] border-[#e2ebe6] text-gray-400 cursor-not-allowed"
                  : "bg-white border-[#e2ebe6] text-[#1a2a4a] focus:border-[#1a4a3a] focus:shadow-[3px_3px_0_0_#1a4a3a] focus:outline-none"
                }`}
              style={{ fontFamily: "var(--font-serif)" }}
            >
              <option value={0}>Selecione um paciente</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.patientId && isEditing && (
              <span className="text-xs text-red-600">{errors.patientId.message}</span>
            )}
          </div>

          {/* Select de Plano */}
          <div className="flex flex-col gap-2">
            <label
              className={`text-sm font-semibold uppercase tracking-wider ${
                !isEditing ? "text-gray-400" : "text-[#1a2a4a]"
              }`}
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Plano *
            </label>
            <select
              disabled={!isEditing}
              value={planId || 0}
              onChange={(e) => setValue("planId", Number(e.target.value), { shouldValidate: true })}
              className={`w-full px-4 py-3 border-2 rounded-sm transition-all
                ${!isEditing
                  ? "bg-[#f0f4f2] border-[#e2ebe6] text-gray-400 cursor-not-allowed"
                  : "bg-white border-[#e2ebe6] text-[#1a2a4a] focus:border-[#1a4a3a] focus:shadow-[3px_3px_0_0_#1a4a3a] focus:outline-none"
                }`}
              style={{ fontFamily: "var(--font-serif)" }}
            >
              <option value={0}>{loadingPlanos ? "Carregando..." : "Selecione um plano"}</option>
              {planos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - {formatCurrency(p.valor)}
                </option>
              ))}
            </select>
            {errors.planId && isEditing && (
              <span className="text-xs text-red-600">{errors.planId.message}</span>
            )}
          </div>

          {/* Preview do valor do plano */}
          {selectedPlan && (
            <div className="bg-[#f0f4f2] border-2 border-[#e2ebe6] rounded-sm p-4">
              <p className="text-sm text-[#4a6354]" style={{ fontFamily: "var(--font-serif)" }}>
                Valor do plano:
              </p>
              <p className="text-2xl font-bold text-[#1a4a3a]" style={{ fontFamily: "var(--font-serif)" }}>
                {formatCurrency(selectedPlan.valor)}
              </p>
            </div>
          )}

          <FormField
            label="Mês de Referência *"
            id="referenceMonth"
            error={errors.referenceMonth?.message}
            disabled={!isEditing}
            value={referenceMonth || ""}
            onChange={(e) => setValue("referenceMonth", e.target.value, { shouldValidate: true })}
          />

          {/* Select de Método */}
          <div className="flex flex-col gap-2">
            <label
              className={`text-sm font-semibold uppercase tracking-wider ${
                !isEditing ? "text-gray-400" : "text-[#1a2a4a]"
              }`}
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Método de Pagamento *
            </label>
            <select
              disabled={!isEditing}
              value={paymentMethod || ""}
              onChange={(e) => setValue("paymentMethod", e.target.value, { shouldValidate: true })}
              className={`w-full px-4 py-3 border-2 rounded-sm transition-all
                ${!isEditing
                  ? "bg-[#f0f4f2] border-[#e2ebe6] text-gray-400 cursor-not-allowed"
                  : "bg-white border-[#e2ebe6] text-[#1a2a4a] focus:border-[#1a4a3a] focus:shadow-[3px_3px_0_0_#1a4a3a] focus:outline-none"
                }`}
              style={{ fontFamily: "var(--font-serif)" }}
            >
              <option value="">Selecione um método</option>
              {paymentMethodOptions.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            {errors.paymentMethod && isEditing && (
              <span className="text-xs text-red-600">{errors.paymentMethod.message}</span>
            )}
          </div>

          {/* Select de Status */}
          <div className="flex flex-col gap-2">
            <label
              className={`text-sm font-semibold uppercase tracking-wider ${
                !isEditing ? "text-gray-400" : "text-[#1a2a4a]"
              }`}
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Status *
            </label>
            <select
              disabled={!isEditing}
              value={status || "Pending"}
              onChange={(e) => setValue("status", e.target.value as "Pending" | "Paid" | "Cancelled", { shouldValidate: true })}
              className={`w-full px-4 py-3 border-2 rounded-sm transition-all
                ${!isEditing
                  ? "bg-[#f0f4f2] border-[#e2ebe6] text-gray-400 cursor-not-allowed"
                  : "bg-white border-[#e2ebe6] text-[#1a2a4a] focus:border-[#1a4a3a] focus:shadow-[3px_3px_0_0_#1a4a3a] focus:outline-none"
                }`}
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {paymentStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Data de Vencimento (opcional) */}
          <FormField
            label="Data de Vencimento (opcional)"
            id="paymentDate"
            type="date"
            disabled={!isEditing}
            value={paymentDate || ""}
            onChange={(e) => {
              const value = e.target.value;
              setValue("paymentDate", value ? value : null, { shouldValidate: true });
            }}
          />

          {/* Data de Pagamento */}
          {status === "Paid" && (
            <FormField
              label="Data do Pagamento"
              id="paidAt"
              type="date"
              disabled={!isEditing}
              value={paidAt || ""}
              onChange={(e) => setValue("paidAt", e.target.value, { shouldValidate: true })}
            />
          )}

          {/* Valor (read-only, apenas visualização) */}
          {data && (
            <div className="border-t-2 border-[#e2ebe6] pt-4 mt-4">
              <p className="text-sm text-[#4a6354] mb-2" style={{ fontFamily: "var(--font-serif)" }}>
                Valor registrado no pagamento:
              </p>
              <p className="text-xl font-bold text-[#1a2a4a]" style={{ fontFamily: "var(--font-serif)" }}>
                {formatCurrency(data.planAmount)}
              </p>
              <p className="text-xs text-[#4a6354]" style={{ fontFamily: "var(--font-serif)" }}>
                Plano: {data.planName}
              </p>
            </div>
          )}
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
