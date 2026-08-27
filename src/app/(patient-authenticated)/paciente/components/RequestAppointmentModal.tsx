"use client";

import * as Dialog from "@radix-ui/react-dialog";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { getApiErrorMessage } from "@/utils/apiError";
import { appointmentRequestSchema, AppointmentRequestFormData, formatSlotTime } from "../schemas/appointment-request.schema";
import { useClinicAvailability, useCreateAppointmentRequest } from "../hooks/usePatientPortal";

interface Props {
  open: boolean;
  clinicId: number;
  clinicName: string | null;
  onClose: () => void;
  onRequestsDisabled?: () => void;
}

const fieldClass = "w-full rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-[#0f172a] transition-all focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white";
const localDate = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

export function RequestAppointmentModal({
  open,
  clinicId,
  clinicName,
  onClose,
  onRequestsDisabled,
}: Props) {
  const create = useCreateAppointmentRequest();
  const today = localDate(new Date());
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentRequestFormData>({
    resolver: zodResolver(appointmentRequestSchema),
    defaultValues: { date: today, requestedDate: "", reason: "" },
  });
  const date = watch("date");
  const requestedDate = watch("requestedDate");
  const availability = useClinicAvailability(clinicId, date, open);

  const close = () => {
    reset({ date: today, requestedDate: "", reason: "" });
    onClose();
  };
  const handleDateChange = (value: string) => {
    setValue("date", value, { shouldValidate: true });
    setValue("requestedDate", "", { shouldValidate: false });
  };

  const onSubmit = async (data: AppointmentRequestFormData) => {
    try {
      await create.mutateAsync({
        clinicId,
        requestedDate: data.requestedDate,
        reason: data.reason.trim() || null,
      });
      toast.success("Solicitação enviada! A clínica responderá em breve.");
      close();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        const code = error.response.data?.code;
        if (code === "SlotUnavailable") {
          setValue("requestedDate", "", { shouldValidate: true });
          toast.error("O horário selecionado não está mais disponível. Escolha outro horário.");
          void availability.refetch();
          return;
        }
        if (code === "RequestsDisabled") onRequestsDisabled?.();
      }
      toast.error(getApiErrorMessage(error, "Não foi possível enviar a solicitação."));
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) close(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900">
          <Dialog.Title className="text-lg font-bold text-[#0f172a] dark:text-white">Solicitar consulta</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-[#64748b] dark:text-slate-300">
            {clinicName ?? "Clínica"} — escolha uma data e um dos horários disponíveis.
          </Dialog.Description>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#0f172a] dark:text-white">
              Data
              <input type="date" min={today} className={fieldClass} value={date} onChange={(event) => handleDateChange(event.target.value)} />
              {errors.date && <span className="text-sm text-red-600">{errors.date.message}</span>}
            </label>
            <input type="hidden" {...register("requestedDate")} />

            <div className="space-y-2">
              <span className="text-sm font-semibold text-[#0f172a] dark:text-white">Horários disponíveis</span>
              {availability.isLoading && <div className="grid grid-cols-3 gap-2"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /></div>}
              {availability.isError && <ErrorState message="Não foi possível carregar os horários." onRetry={() => void availability.refetch()} />}
              {!availability.isLoading && !availability.isError && availability.data?.slots.length === 0 && (
                <p className="rounded-xl bg-[#f8fafc] p-3 text-sm text-[#64748b] dark:bg-slate-800/50 dark:text-slate-300">Nenhum horário disponível nesta data.</p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {availability.data?.slots.map((slot) => (
                  <button key={slot.start} type="button" aria-pressed={requestedDate === slot.start}
                    onClick={() => setValue("requestedDate", slot.start, { shouldValidate: true })}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${requestedDate === slot.start ? "border-[#0f766e] bg-[#0f766e] text-white" : "border-[#d7f3ea] text-[#0f766e] hover:bg-[#ecfdf5] dark:border-slate-700 dark:text-[#67e8f9]"}`}>
                    {formatSlotTime(slot.start)}
                  </button>
                ))}
              </div>
              {errors.requestedDate && <span className="text-sm text-red-600">{errors.requestedDate.message}</span>}
              {availability.data && <p className="text-xs text-[#94a3b8]">Horários no fuso {availability.data.timeZoneId}.</p>}
            </div>

            <label className="flex flex-col gap-2 text-sm font-semibold text-[#0f172a] dark:text-white">
              Motivo <span className="font-normal text-[#94a3b8]">(opcional)</span>
              <textarea rows={3} className={fieldClass} {...register("reason")} />
              {errors.reason && <span className="text-sm text-red-600">{errors.reason.message}</span>}
            </label>

            <div className="mt-2 flex gap-3">
              <Button type="button" variant="outline" disabled={create.isPending} onClick={close}>Cancelar</Button>
              <Button type="submit" loading={create.isPending}>Enviar solicitação</Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
