"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { getProfessionalDaySchedule } from "../services/appointments.service";

interface Props {
  professionalId: number;
  date: string;
  selectedLocalDateTime: string;
  onSelect: (value: string) => void;
}

const time = (iso: string) => iso.slice(11, 16);

export function ProfessionalDaySchedule({ professionalId, date, selectedLocalDateTime, onSelect }: Props) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: queryKeys.appointments.day(professionalId, date),
    queryFn: () => getProfessionalDaySchedule(professionalId, date),
  });

  return (
    <aside aria-label="Agenda do profissional" className="self-start rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:sticky lg:top-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-secondary dark:text-white">Agenda do profissional</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">{date.split("-").reverse().join("/")}</p>
        </div>
        {data && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary-dark dark:text-emerald-300">{data.durationMinutes} min</span>}
      </div>

      {isPending && <p role="status" className="text-sm text-gray-600 dark:text-slate-300">Carregando horários…</p>}
      {isError && (
        <div role="alert" className="space-y-2 text-sm text-red-700 dark:text-red-300">
          <p>Não foi possível carregar a agenda.</p>
          <button type="button" onClick={() => refetch()} className="font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2">Tentar novamente</button>
        </div>
      )}
      {data && (
        <>
          <section aria-label="Consultas agendadas" className="mb-5">
            <h3 className="mb-2 text-sm font-semibold text-secondary dark:text-white">Consultas agendadas</h3>
            {data.appointments.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-slate-300">Nenhuma consulta agendada neste dia.</p>
            ) : (
              <ul className="space-y-2">
                {data.appointments.map((appointment) => (
                  <li key={appointment.id} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-slate-800">
                    <span className="min-w-0 truncate font-medium text-secondary dark:text-white">{appointment.patientName}</span>
                    <time className="shrink-0 tabular-nums text-gray-600 dark:text-slate-300">{time(appointment.start)}–{time(appointment.end)}</time>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section aria-label="Horários sugeridos">
            <h3 className="mb-2 text-sm font-semibold text-secondary dark:text-white">Horários sugeridos</h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
              {data.slots.map((slot) => {
                const local = slot.start.slice(0, 16);
                const selected = selectedLocalDateTime === local;
                return (
                  <button key={slot.start} type="button" disabled={!slot.available}
                    onClick={() => onSelect(local)}
                    aria-label={`${time(slot.start)} ${slot.available ? "livre" : "ocupado"}`}
                    aria-pressed={selected}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      selected ? "border-primary bg-primary text-white" : slot.available
                        ? "border-gray-200 text-secondary hover:border-primary hover:bg-primary/5 dark:border-slate-700 dark:text-white"
                        : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >{time(slot.start)}</button>
                );
              })}
            </div>
          </section>
          <p className="mt-4 border-t border-gray-200 pt-3 text-xs leading-relaxed text-gray-600 dark:border-slate-700 dark:text-slate-300">
            Livre significa sem outra consulta agendada. Horários fora das sugestões podem ser digitados no campo de data e hora.
          </p>
        </>
      )}
    </aside>
  );
}
