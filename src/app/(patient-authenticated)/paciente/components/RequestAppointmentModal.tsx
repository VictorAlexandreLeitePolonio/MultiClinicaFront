"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  appointmentRequestSchema,
  AppointmentRequestFormData,
  dateTimeLocalToIso,
} from "../schemas/appointment-request.schema";
import { useCreateAppointmentRequest } from "../hooks/usePatientPortal";

interface Props {
  open: boolean;
  clinicId: number;
  clinicName: string | null;
  onClose: () => void;
}

const fieldClass =
  "w-full rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-[#0f172a] transition-all focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white";

export function RequestAppointmentModal({ open, clinicId, clinicName, onClose }: Props) {
  const create = useCreateAppointmentRequest();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentRequestFormData>({
    resolver: zodResolver(appointmentRequestSchema),
    defaultValues: { requestedDate: "", reason: "" },
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset();
      onClose();
    }
  };

  const onSubmit = async (data: AppointmentRequestFormData) => {
    try {
      await create.mutateAsync({
        clinicId,
        requestedDate: dateTimeLocalToIso(data.requestedDate),
        reason: data.reason.trim(),
      });
      toast.success("Solicitação enviada! A clínica responderá em breve.");
      reset();
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Não foi possível enviar a solicitação."));
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900">
          <Dialog.Title className="text-lg font-bold text-[#0f172a] dark:text-white">
            Solicitar consulta
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-[#64748b] dark:text-slate-300">
            {clinicName ?? "Clínica"} — escolha data, horário e descreva o motivo.
          </Dialog.Description>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="requestedDate" className="text-sm font-semibold text-[#0f172a] dark:text-white">
                Data e horário
              </label>
              <input id="requestedDate" type="datetime-local" className={fieldClass} {...register("requestedDate")} />
              {errors.requestedDate && (
                <span className="text-sm text-red-600">{errors.requestedDate.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="reason" className="text-sm font-semibold text-[#0f172a] dark:text-white">
                Motivo
              </label>
              <textarea id="reason" rows={3} className={fieldClass} {...register("reason")} />
              {errors.reason && <span className="text-sm text-red-600">{errors.reason.message}</span>}
            </div>

            <div className="mt-2 flex gap-3">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" disabled={create.isPending}>
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button type="submit" loading={create.isPending}>
                Enviar solicitação
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
