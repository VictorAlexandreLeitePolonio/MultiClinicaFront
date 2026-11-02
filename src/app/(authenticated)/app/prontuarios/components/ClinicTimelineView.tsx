"use client";

import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Activity, Calendar, FileText, History } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ClinicTimelineEvent, PatientTimelineEventType } from "@/types/evolution";
import { getClinicTimeline } from "../services/clinic-timeline.service";

const clinicTimelineKey = ["clinic-timeline"] as const;

const EVENT_ICONS: Record<PatientTimelineEventType, typeof Calendar> = {
  appointment: Calendar,
  evolution: Activity,
  anamnesis: FileText,
};

interface TimelineGroup {
  key: string;
  label: string;
  events: ClinicTimelineEvent[];
}

function toDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function groupLabel(date: Date, now: Date): string {
  if (isSameDay(date, now)) return "Hoje";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return "Ontem";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatTime(value: string): string {
  const date = toDate(value);
  if (!date) return "";
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function groupEvents(events: ClinicTimelineEvent[]): TimelineGroup[] {
  const now = new Date();
  const groups: TimelineGroup[] = [];

  for (const item of events) {
    const date = toDate(item.event.date);
    const key = date ? dayKey(date) : "sem-data";
    let group = groups.find((candidate) => candidate.key === key);
    if (!group) {
      group = { key, label: date ? groupLabel(date, now) : "Sem data", events: [] };
      groups.push(group);
    }
    group.events.push(item);
  }

  return groups;
}

/** Linha do tempo da clínica: consultas, evoluções e anamneses de todos os pacientes. */
export function ClinicTimelineView() {
  const router = useRouter();
  const timelineQuery = useInfiniteQuery({
    queryKey: clinicTimelineKey,
    queryFn: ({ pageParam }) => getClinicTimeline(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextBefore,
  });

  const events = timelineQuery.data?.pages.flatMap((page) => page.events) ?? [];
  const groups = groupEvents(events);

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
        message="Não foi possível carregar a linha do tempo da clínica."
        onRetry={() => void timelineQuery.refetch()}
      />
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="Nenhum registro na linha do tempo ainda."
        description="Consultas, evoluções e anamneses da clínica aparecem aqui."
        icon={History}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-card)] shadow-[var(--shadow-sm)]">
        {groups.map((group, groupIndex) => (
          <section
            key={group.key}
            className={groupIndex > 0 ? "border-t border-[var(--color-gray-200)]" : undefined}
          >
            <h3 className="bg-[var(--color-gray-50)] px-4 py-2 font-mono text-xs font-semibold tracking-wide text-[var(--color-gray-600)]">
              {group.label}
            </h3>
            <ul className="divide-y divide-[var(--color-gray-200)]">
              {group.events.map((item) => {
                const Icon = EVENT_ICONS[item.event.type];
                const time = formatTime(item.event.date);
                return (
                  <li
                    key={`${item.patientId}-${item.event.type}-${item.event.id}`}
                    className="flex items-start gap-3 px-4 py-3"
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-muted)] text-[var(--color-primary-dark)]">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        {time && (
                          <time
                            dateTime={item.event.date}
                            className="font-mono text-xs tabular-nums text-[var(--color-gray-600)]"
                          >
                            {time}
                          </time>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/app/pacientes?mode=profile&id=${item.patientId}`)
                          }
                          className="rounded-sm text-sm font-semibold text-[var(--color-primary-dark)] transition-colors duration-150 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] active:scale-[0.97]"
                        >
                          {item.patientName}
                        </button>
                        <span className="text-sm text-[var(--color-secondary)]">
                          {item.event.title}
                        </span>
                      </span>
                      {item.event.professionalName && (
                        <span className="mt-0.5 block text-xs text-[var(--color-gray-600)]">
                          {item.event.professionalName}
                        </span>
                      )}
                    </span>
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
