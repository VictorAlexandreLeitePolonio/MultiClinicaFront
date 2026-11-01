"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Activity, Calendar, FileText, History } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { patientRecordKeys } from "@/lib/queryKeys";
import { PatientTimelineEvent, PatientTimelineEventType } from "@/types/evolution";
import { getPatientTimeline } from "../../services/patient-record.service";

interface Props {
  patientId: number;
  /** Abre a aba Anamnese já na avaliação clicada. */
  onOpenAnamnesis?: (recordId: number) => void;
  /** Abre o painel lateral da evolução. */
  onOpenEvolution: (evolutionId: number) => void;
}

const EVENT_ICONS: Record<PatientTimelineEventType, typeof Calendar> = {
  appointment: Calendar,
  evolution: Activity,
  anamnesis: FileText,
};

const EVENT_ICON_STYLES: Record<PatientTimelineEventType, string> = {
  appointment: "bg-[#ecfdf5] text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]",
  evolution: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  anamnesis: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
};

const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

function formatEventDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatEventTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function evolutionCountLabel(count: number): string {
  return count === 1 ? "1 evolução" : `${count} evoluções`;
}

function Chip({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" }) {
  const styles =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
      : "border-[#d7f3ea] bg-[#f8fffc] text-[#475569] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${styles}`}>
      {children}
    </span>
  );
}

function eventChips(event: PatientTimelineEvent, appointmentDates: Map<number, string>): ReactNode[] {
  if (event.type === "appointment") {
    const chips: ReactNode[] = [];
    if (event.consultationStatus) {
      chips.push(<Chip key="recorded" tone="success">Consulta gravada</Chip>);
    }
    if (event.consultationStatus === "Ready") {
      chips.push(<Chip key="ready" tone="success">Relatório pronto</Chip>);
    }
    if (event.evolutionCount > 0) {
      chips.push(<Chip key="evolutions">{evolutionCountLabel(event.evolutionCount)}</Chip>);
    }
    return chips;
  }

  if (event.type === "evolution") {
    const chips: ReactNode[] = [];
    if (event.appointmentId) {
      const appointmentDate = appointmentDates.get(event.appointmentId);
      chips.push(
        <Chip key="appointment">
          {appointmentDate ? `Ligada à consulta de ${formatEventDate(appointmentDate)}` : "Ligada a uma consulta"}
        </Chip>,
      );
    }
    for (const templateName of event.templateNames) {
      chips.push(<Chip key={`template-${templateName}`}>{templateName}</Chip>);
    }
    return chips;
  }

  return [];
}

export function PatientTimeline({ patientId, onOpenAnamnesis, onOpenEvolution }: Props) {
  const router = useRouter();
  const timelineQuery = useInfiniteQuery({
    queryKey: patientRecordKeys.timeline(patientId),
    queryFn: ({ pageParam }) => getPatientTimeline(patientId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextBefore,
  });

  const events = timelineQuery.data?.pages.flatMap((page) => page.events) ?? [];
  const appointmentDates = new Map<number, string>();
  for (const event of events) {
    if (event.type === "appointment") appointmentDates.set(event.id, event.date);
  }

  const groups: { key: string; label: string; events: PatientTimelineEvent[] }[] = [];
  for (const event of events) {
    const date = new Date(event.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    let group = groups.find((item) => item.key === key);
    if (!group) {
      group = { key, label: monthFormatter.format(date), events: [] };
      groups.push(group);
    }
    group.events.push(event);
  }

  const handleEventClick = (event: PatientTimelineEvent) => {
    if (event.type === "appointment") {
      router.push(`/app/agenda?mode=view&id=${event.id}`);
      return;
    }
    if (event.type === "evolution") {
      onOpenEvolution(event.id);
      return;
    }
    onOpenAnamnesis?.(event.id);
  };

  if (timelineQuery.isPending) {
    return (
      <div className="space-y-2" aria-label="Carregando linha do tempo">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-20" />
        ))}
      </div>
    );
  }

  if (timelineQuery.isError) {
    return (
      <ErrorState
        message="Não foi possível carregar a linha do tempo."
        onRetry={() => void timelineQuery.refetch()}
      />
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="Nenhum registro ainda. Agende uma consulta ou registre uma evolução."
        icon={History}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-[#d7f3ea] bg-white shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900">
        {groups.map((group, groupIndex) => (
          <section
            key={group.key}
            className={groupIndex > 0 ? "border-t border-[#d7f3ea] dark:border-slate-800" : undefined}
          >
            <h3 className="bg-[#f0fdf9] px-4 py-2 text-xs font-semibold tracking-wide text-[#475569] dark:bg-slate-900 dark:text-slate-300">
              {group.label}
            </h3>
            <ul className="divide-y divide-[#e6fbf4] dark:divide-slate-800">
              {group.events.map((event) => {
                const Icon = EVENT_ICONS[event.type];
                const chips = eventChips(event, appointmentDates);
                return (
                  <li key={`${event.type}-${event.id}`}>
                    <button
                      type="button"
                      onClick={() => handleEventClick(event)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#ecfdf5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#99f6e4] dark:hover:bg-slate-800/70"
                    >
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${EVENT_ICON_STYLES[event.type]}`}
                      >
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="text-sm font-semibold text-[#0f172a] dark:text-white">
                            {event.title}
                          </span>
                          <span className="text-xs text-[#475569] dark:text-slate-300">
                            {formatEventDate(event.date)} · {formatEventTime(event.date)}
                          </span>
                        </span>
                        {event.professionalName && (
                          <span className="mt-0.5 block text-xs text-[#475569] dark:text-slate-300">
                            {event.professionalName}
                          </span>
                        )}
                        {chips.length > 0 && (
                          <span className="mt-1.5 flex flex-wrap gap-1.5">{chips}</span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {timelineQuery.hasNextPage && (
        <div className="flex justify-center">
          <Button
            fullWidth={false}
            variant="outline"
            loading={timelineQuery.isFetchingNextPage}
            onClick={() => void timelineQuery.fetchNextPage()}
          >
            Carregar mais
          </Button>
        </div>
      )}
    </div>
  );
}
