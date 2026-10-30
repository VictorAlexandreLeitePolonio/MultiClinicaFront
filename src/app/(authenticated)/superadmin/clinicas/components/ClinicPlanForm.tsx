"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { getApiErrorMessage } from "@/utils/apiError";
import { PLAN_LABELS, type ClinicPlan } from "@/lib/plans";
import { useSetClinicPlan } from "../../hooks/useSuperAdminClinicPlan";

interface ClinicPlanFormProps {
  clinicId: number;
  plan: ClinicPlan;
  isFounder: boolean;
}

const options: ClinicPlan[] = ["Free", "Pro", "Premium"];

export function ClinicPlanForm({ clinicId, plan, isFounder }: ClinicPlanFormProps) {
  const [selectedPlan, setSelectedPlan] = useState<ClinicPlan>(plan);
  const [selectedFounder, setSelectedFounder] = useState(isFounder);
  const mutation = useSetClinicPlan(clinicId);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await mutation.mutateAsync({ plan: selectedPlan, isFounder: selectedFounder });
      toast.success("Plano da clínica atualizado.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar o plano."));
    }
  };

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Plano da clínica</h2>
      <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
        Marque como fundadora para manter o Premium de cortesia e o selo no hub.
      </p>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="sm:w-56">
          <Select
            id="clinic-plan"
            label="Plano"
            value={selectedPlan}
            onChange={(event) => setSelectedPlan(event.target.value as ClinicPlan)}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {PLAN_LABELS[option]}
              </option>
            ))}
          </Select>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-[#0f172a] dark:border-slate-700 dark:text-white">
          <input
            type="checkbox"
            checked={selectedFounder}
            onChange={(event) => setSelectedFounder(event.target.checked)}
          />
          Fundadora
        </label>

        <div className="sm:w-44">
          <Button type="submit" loading={mutation.isPending}>
            Salvar plano
          </Button>
        </div>
      </div>
    </form>
  );
}
