"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { getApiErrorMessage } from "@/utils/apiError";
import { queryKeys } from "@/lib/queryKeys";
import { usePatientTreatments } from "@/app/(authenticated)/app/pacientes/hooks/evolution/usePatientEvolution";
import { createEvolutionFromConsultation } from "../../services/consultation.service";

interface Props {
  appointmentId: number;
  patientId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EvolutionFromConsultationDialog({
  appointmentId,
  patientId,
  open,
  onOpenChange,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const treatmentsQuery = usePatientTreatments(patientId);
  const treatments = treatmentsQuery.data ?? [];
  const [treatmentId, setTreatmentId] = useState<number | null>(null);

  const createEvolution = useMutation({
    mutationFn: () => {
      if (!treatmentId) throw new Error("Selecione um acompanhamento.");
      return createEvolutionFromConsultation(appointmentId, treatmentId);
    },
    onSuccess: async () => {
      toast.success("Rascunho de evolução criado.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.evolution.patientTreatments(patientId) });
      onOpenChange(false);
      router.push(`/app/pacientes?mode=profile&id=${patientId}&tab=evolution`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível criar a evolução."));
    },
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900">
          <Dialog.Title className="text-lg font-bold text-secondary dark:text-white">
            Gerar evolução
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600 dark:text-slate-300">
            Escolha o acompanhamento que receberá o rascunho desta consulta.
          </Dialog.Description>

          {treatmentsQuery.isPending && (
            <p className="mt-4 text-sm text-gray-600 dark:text-slate-300">Carregando acompanhamentos...</p>
          )}

          {treatmentsQuery.isError && (
            <div className="mt-4 space-y-2 text-sm text-red-700 dark:text-red-300">
              <p>Não foi possível carregar os acompanhamentos.</p>
              <button type="button" onClick={() => treatmentsQuery.refetch()} className="font-semibold underline">
                Tentar novamente
              </button>
            </div>
          )}

          {!treatmentsQuery.isPending && !treatmentsQuery.isError && treatments.length === 0 && (
            <p className="mt-4 text-sm text-gray-600 dark:text-slate-300">
              O paciente não tem tratamento ativo. Crie um tratamento na aba Evolução.
            </p>
          )}

          {treatments.length > 0 && (
            <div className="mt-4">
              <Select
                id="evolution-treatment"
                label="Acompanhamento"
                value={treatmentId ?? ""}
                onChange={(event) => setTreatmentId(event.target.value ? Number(event.target.value) : null)}
              >
                <option value="">Selecione um acompanhamento</option>
                {treatments.map((treatment) => (
                  <option key={treatment.id} value={treatment.id}>
                    {treatment.title}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Dialog.Close asChild>
              <Button type="button" variant="outline" disabled={createEvolution.isPending}>
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              type="button"
              loading={createEvolution.isPending}
              disabled={!treatmentId}
              onClick={() => createEvolution.mutate()}
            >
              Criar rascunho
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
