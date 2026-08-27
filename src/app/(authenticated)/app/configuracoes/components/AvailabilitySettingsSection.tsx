"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { DayOfWeekName } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  useAvailabilityProfessionals,
  useAvailabilitySettings,
  useProfessionalAvailability,
  useReplaceProfessionalAvailability,
  useUpdateAvailabilitySettings,
} from "../hooks/useAvailability";
import { availabilitySettingsSchema, professionalAvailabilitySchema } from "../schemas/availability.schema";
import { AvailabilitySettings, ProfessionalAvailabilityRange } from "../types/availability.types";

interface Props { canEdit: boolean }

const DAYS: { value: DayOfWeekName; label: string }[] = [
  { value: "Monday", label: "Segunda" }, { value: "Tuesday", label: "Terça" },
  { value: "Wednesday", label: "Quarta" }, { value: "Thursday", label: "Quinta" },
  { value: "Friday", label: "Sexta" }, { value: "Saturday", label: "Sábado" },
  { value: "Sunday", label: "Domingo" },
];
const TIME_ZONES = [
  "America/Sao_Paulo", "America/Manaus", "America/Cuiaba", "America/Recife",
  "America/Fortaleza", "America/Rio_Branco", "UTC",
];
const DURATION_OPTIONS = [15, 20, 30, 40, 45, 50, 60, 90, 120];
const inputClass = "rounded-xl border border-[#d7f3ea] bg-white px-3 py-2 text-sm text-[#0f172a] focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white";
const normalizeTime = (value: string) => value.length === 5 ? `${value}:00` : value;

export function AvailabilitySettingsSection({ canEdit }: Props) {
  const settingsQuery = useAvailabilitySettings();
  const updateSettings = useUpdateAvailabilitySettings();
  const professionalsQuery = useAvailabilityProfessionals();
  const [settingsOverride, setSettingsOverride] = useState<AvailabilitySettings | null>(null);
  const [professionalId, setProfessionalId] = useState<number | null>(null);
  const professionals = professionalsQuery.data;
  const effectiveProfessionalId = professionalId ?? professionals?.[0]?.id ?? null;
  const scheduleQuery = useProfessionalAvailability(effectiveProfessionalId);
  const replaceSchedule = useReplaceProfessionalAvailability();
  const [rangesOverride, setRangesOverride] = useState<ProfessionalAvailabilityRange[] | null>(null);
  const settingsDraft = settingsOverride ?? settingsQuery.data ?? null;
  const ranges = rangesOverride ?? scheduleQuery.data ?? [];
  const settingsDirty = settingsOverride !== null;
  const scheduleDirty = rangesOverride !== null;

  useEffect(() => {
    const dirty = settingsDirty || scheduleDirty;
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [scheduleDirty, settingsDirty]);

  const selectedProfessional = professionals?.find(
    (professional) => professional.id === effectiveProfessionalId,
  );

  const chooseProfessional = (nextId: number) => {
    if (scheduleDirty && !window.confirm("Descartar alterações não salvas desta agenda?")) return;
    setRangesOverride(null);
    setProfessionalId(nextId);
  };

  const saveSettings = async () => {
    const parsed = availabilitySettingsSchema.safeParse(settingsDraft);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Configuração inválida.");
      return;
    }
    try {
      await updateSettings.mutateAsync(parsed.data);
      setSettingsOverride(null);
      toast.success("Configurações de agenda salvas.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível salvar as configurações de agenda."));
    }
  };

  const updateRange = (index: number, field: "startTime" | "endTime", value: string) => {
    setRangesOverride(ranges.map((range, itemIndex) =>
      itemIndex === index ? { ...range, [field]: value } : range));
  };
  const addRange = (dayOfWeek: DayOfWeekName) => {
    setRangesOverride([...ranges, { dayOfWeek, startTime: "08:00", endTime: "12:00" }]);
  };
  const removeRange = (index: number) => {
    setRangesOverride(ranges.filter((_, itemIndex) => itemIndex !== index));
  };
  const saveSchedule = async () => {
    if (effectiveProfessionalId === null) return;
    const payload = ranges.map((range) => ({
      ...range,
      startTime: normalizeTime(range.startTime),
      endTime: normalizeTime(range.endTime),
    }));
    const parsed = professionalAvailabilitySchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise as faixas de horário.");
      return;
    }
    try {
      await replaceSchedule.mutateAsync({ professionalId: effectiveProfessionalId, ranges: parsed.data });
      setRangesOverride(null);
      toast.success("Agenda do profissional salva.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível salvar a agenda do profissional."));
    }
  };

  if (settingsQuery.isLoading) return <Skeleton className="h-64" />;
  if (settingsQuery.isError) return <ErrorState message="Não foi possível carregar a disponibilidade." onRetry={() => void settingsQuery.refetch()} />;
  if (!settingsDraft) return null;

  return (
    <section className="space-y-6 rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Disponibilidade para solicitações</h2>
        <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">Defina a duração dos slots, o fuso da clínica e a jornada semanal de cada profissional.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-[#0f172a] dark:text-white">
          Duração da consulta
          <select className={inputClass} value={settingsDraft.slotDurationMinutes} disabled={!canEdit}
            onChange={(event) => setSettingsOverride({ ...settingsDraft, slotDurationMinutes: Number(event.target.value) })}>
            {DURATION_OPTIONS.map((duration) => <option key={duration} value={duration}>{duration} minutos</option>)}
            {!DURATION_OPTIONS.includes(settingsDraft.slotDurationMinutes) &&
              <option value={settingsDraft.slotDurationMinutes}>{settingsDraft.slotDurationMinutes} minutos</option>}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-[#0f172a] dark:text-white">
          Fuso horário
          <select className={inputClass} value={settingsDraft.timeZoneId} disabled={!canEdit}
            onChange={(event) => setSettingsOverride({ ...settingsDraft, timeZoneId: event.target.value })}>
            {TIME_ZONES.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
          </select>
        </label>
      </div>
      {canEdit && <div className="flex justify-end"><Button fullWidth={false} disabled={!settingsDirty} loading={updateSettings.isPending} onClick={() => void saveSettings()}>Salvar configuração</Button></div>}

      <div className="border-t border-[#eef7f3] pt-6 dark:border-slate-800">
        <label className="flex max-w-md flex-col gap-2 text-sm font-semibold text-[#0f172a] dark:text-white">
          Profissional
          <select className={inputClass} value={effectiveProfessionalId ?? ""} disabled={professionalsQuery.isLoading}
            onChange={(event) => chooseProfessional(Number(event.target.value))}>
            {professionals?.map((professional) => <option key={professional.id} value={professional.id}>{professional.name}</option>)}
          </select>
        </label>
      </div>

      {professionalsQuery.isError ? <ErrorState message="Não foi possível carregar os profissionais." onRetry={() => void professionalsQuery.refetch()} /> :
        professionals?.length === 0 ? <p className="text-sm text-[#64748b]">Nenhum profissional ativo encontrado.</p> :
        scheduleQuery.isLoading ? <Skeleton className="h-48" /> : (
          <div className="space-y-4">
            <p className="text-sm text-[#64748b]">Jornada de {selectedProfessional?.name}. Dias sem faixas ficam inativos.</p>
            {DAYS.map((day) => {
              const dayRanges = ranges.map((range, index) => ({ range, index })).filter(({ range }) => range.dayOfWeek === day.value);
              return (
                <div key={day.value} className="grid gap-2 border-b border-[#eef7f3] pb-4 dark:border-slate-800 sm:grid-cols-[7rem_1fr]">
                  <div className="flex items-center justify-between sm:block"><span className="text-sm font-semibold text-[#0f172a] dark:text-white">{day.label}</span></div>
                  <div className="space-y-2">
                    {dayRanges.length === 0 && <span className="text-sm text-[#94a3b8]">Inativo</span>}
                    {dayRanges.map(({ range, index }) => (
                      <div key={`${day.value}-${index}`} className="flex flex-wrap items-center gap-2">
                        <input aria-label={`Início ${day.label}`} type="time" className={inputClass} value={range.startTime.slice(0, 5)} disabled={!canEdit} onChange={(event) => updateRange(index, "startTime", event.target.value)} />
                        <span className="text-sm text-[#64748b]">até</span>
                        <input aria-label={`Fim ${day.label}`} type="time" className={inputClass} value={range.endTime.slice(0, 5)} disabled={!canEdit} onChange={(event) => updateRange(index, "endTime", event.target.value)} />
                        {canEdit && <button type="button" aria-label={`Remover faixa de ${day.label}`} className="rounded-lg p-2 text-red-600 hover:bg-red-50" onClick={() => removeRange(index)}><Trash2 size={16} /></button>}
                      </div>
                    ))}
                    {canEdit && <button type="button" className="inline-flex items-center gap-1 text-sm font-semibold text-[#0f766e]" onClick={() => addRange(day.value)}><Plus size={15} />Adicionar faixa</button>}
                  </div>
                </div>
              );
            })}
            {canEdit && <div className="flex justify-end"><Button fullWidth={false} disabled={!scheduleDirty} loading={replaceSchedule.isPending} onClick={() => void saveSchedule()}>Salvar agenda</Button></div>}
          </div>
        )}
    </section>
  );
}
