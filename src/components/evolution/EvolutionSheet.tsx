"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { patientRecordKeys, queryKeys } from "@/lib/queryKeys";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDate, todayCivilDate } from "@/utils/formatters";
import {
  buildEvolutionValuesPayload,
  EvolutionFormValues,
  getInitialEvolutionFormValues,
} from "@/app/(authenticated)/app/modelos-evolucao/services/evolutionPayload";
import {
  getEvolutionTemplateFields,
  getEvolutionTemplates,
} from "@/app/(authenticated)/app/modelos-evolucao/services/evolution.service";
import {
  createPatientEvolution,
  getPatientEvolution,
  getPatientMeasurements,
  updatePatientEvolution,
} from "@/app/(authenticated)/app/pacientes/services/patient-record.service";
import {
  getAppointmentById,
  getAppointmentProfessionals,
} from "@/app/(authenticated)/app/agenda/services/appointments.service";
import {
  EvolutionStatus,
  EvolutionTemplate,
  EvolutionTemplateField,
} from "@/types/evolution";
import { EvolutionFieldInput } from "./EvolutionFieldInput";
import { TemplatePicker } from "./TemplatePicker";

export interface EvolutionSheetProps {
  patientId: number;
  /** Evolução existente para editar; ausente = nova. */
  evolutionId?: number | null;
  /** Consulta de origem para uma evolução nova. */
  appointmentId?: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Chamado depois de salvar ou concluir. */
  onSaved?: (evolutionId: number) => void;
}

interface SelectedTemplate {
  template: EvolutionTemplate;
  fields: EvolutionTemplateField[];
}

const textareaStyles =
  "w-full rounded-xl border border-[#d7f3ea] bg-white px-3 py-2 text-sm text-[#0f172a] transition-colors focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-[#67e8f9] dark:focus:ring-[#134e4a]";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

function toIsoDate(civilDate: string): string | null {
  if (!civilDate) return null;
  return new Date(`${civilDate}T12:00:00`).toISOString();
}

/** Dia local (YYYY-MM-DD) de um instante ISO; slice(0, 10) daria o dia UTC. */
function toCivilDate(isoDate: string): string {
  const date = new Date(isoDate);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatConsultationDate(isoDate: string, timeZoneId?: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: timeZoneId ?? "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(isoDate));
  } catch {
    return formatDate(isoDate);
  }
}

export function EvolutionSheet({
  patientId,
  evolutionId,
  appointmentId,
  open,
  onOpenChange,
  onSaved,
}: EvolutionSheetProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const prefersReducedMotion = useReducedMotion();
  const userId = user?.id;
  const userRole = user?.role;
  const isAdmin = userRole === "Administrador";

  const [date, setDate] = useState(todayCivilDate);
  const [professionalId, setProfessionalId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [conduct, setConduct] = useState("");
  const [observations, setObservations] = useState("");
  const [nextGuidance, setNextGuidance] = useState("");
  const [selectedTemplates, setSelectedTemplates] = useState<SelectedTemplate[]>([]);
  const [values, setValues] = useState<EvolutionFormValues>({});
  const [savingError, setSavingError] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<EvolutionStatus | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateLoadFailed, setTemplateLoadFailed] = useState(false);
  const [hydrationAttempt, setHydrationAttempt] = useState(0);

  const hydratedHeaderRef = useRef<number | null>(null);
  const hydratedTemplatesRef = useRef<number | null>(null);

  const editing = evolutionId !== null && evolutionId !== undefined;

  const evolutionQuery = useQuery({
    queryKey: patientRecordKeys.evolution(patientId, evolutionId ?? 0),
    queryFn: () => getPatientEvolution(patientId, evolutionId as number),
    enabled: open && editing,
  });

  const measurementsQuery = useQuery({
    queryKey: patientRecordKeys.measurements(patientId),
    queryFn: () => getPatientMeasurements(patientId),
    enabled: open,
  });

  const templatesQuery = useQuery({
    queryKey: queryKeys.evolution.templates.list({ page: 1, pageSize: 100 }),
    queryFn: () => getEvolutionTemplates({ page: 1, pageSize: 100 }),
    enabled: open,
  });

  const effectiveAppointmentId = evolutionQuery.data?.appointmentId ?? appointmentId ?? null;
  const appointmentQuery = useQuery({
    queryKey: queryKeys.appointments.detail(effectiveAppointmentId ?? 0),
    queryFn: () => getAppointmentById(effectiveAppointmentId as number),
    enabled: open && effectiveAppointmentId !== null,
  });

  const professionalsQuery = useQuery({
    queryKey: queryKeys.appointments.professionals,
    queryFn: getAppointmentProfessionals,
    enabled: open && isAdmin,
  });

  // Nova evolução: limpa o formulário a cada abertura.
  useEffect(() => {
    if (!open) {
      hydratedHeaderRef.current = null;
      hydratedTemplatesRef.current = null;
      setLoadingTemplates(false);
      return;
    }

    setSavingError(null);
    setPendingStatus(null);
    setTemplateLoadFailed(false);

    if (editing) return;

    hydratedHeaderRef.current = null;
    hydratedTemplatesRef.current = null;
    setLoadingTemplates(false);
    setTemplateLoadFailed(false);
    setDate(todayCivilDate());
    setProfessionalId(userRole === "Profissional" ? (userId ?? null) : null);
    setDescription("");
    setConduct("");
    setObservations("");
    setNextGuidance("");
    setSelectedTemplates([]);
    setValues({});
  }, [open, editing, userId, userRole]);

  // Ao abrir uma consulta, o administrador já começa com o profissional do agendamento.
  const appointmentProfessionalId = appointmentQuery.data?.professionalId;
  useEffect(() => {
    if (!open || editing || !isAdmin || professionalId !== null || appointmentProfessionalId == null) {
      return;
    }
    setProfessionalId(appointmentProfessionalId);
  }, [open, editing, isAdmin, professionalId, appointmentProfessionalId]);

  // Edição: carrega textos e reconstrói as fichas usadas a partir dos valores.
  const evolution = evolutionQuery.data;
  const templatesData = templatesQuery.data;
  const templatesPending = templatesQuery.isPending;
  const templatesError = templatesQuery.isError;
  useEffect(() => {
    if (!open || !evolution) return;

    if (hydratedHeaderRef.current !== evolution.id) {
      hydratedHeaderRef.current = evolution.id;
      setDate(toCivilDate(evolution.date));
      setProfessionalId(evolution.professionalId);
      setDescription(evolution.description ?? "");
      setConduct(evolution.conduct ?? "");
      setObservations(evolution.observations ?? "");
      setNextGuidance(evolution.nextGuidance ?? "");
    }

    if (hydratedTemplatesRef.current === evolution.id || templatesPending) return;

    if (templatesError) {
      setTemplateLoadFailed(true);
      return;
    }

    let cancelled = false;
    const valueFieldIds = new Set(evolution.values.map((value) => value.fieldId));
    const templateNames = new Set(evolution.templateNames ?? []);
    const allTemplates = templatesData?.data ?? [];

    const loadPairs = async (candidates: EvolutionTemplate[]) =>
      Promise.all(
        candidates.map(async (template) => ({
          template,
          fields: (await getEvolutionTemplateFields(template.id)).filter((field) => field.isActive),
        })),
      );

    const hydrateTemplates = async () => {
      setLoadingTemplates(true);
      try {
        let pairs = await loadPairs(
          templateNames.size > 0
            ? allTemplates.filter((template) => templateNames.has(template.name))
            : allTemplates,
        );
        let used = pairs.filter((pair) =>
          pair.fields.some((field) => valueFieldIds.has(field.id)),
        );

        const coveredFieldIds = new Set(
          used.flatMap((pair) => pair.fields.map((field) => field.id)),
        );
        const coversAllValues = Array.from(valueFieldIds).every((fieldId) =>
          coveredFieldIds.has(fieldId),
        );

        if (!coversAllValues && templateNames.size > 0) {
          pairs = await loadPairs(allTemplates);
          used = pairs.filter((pair) =>
            pair.fields.some((field) => valueFieldIds.has(field.id)),
          );
        }

        const loadedFieldIds = new Set(
          used.flatMap((pair) => pair.fields.map((field) => field.id)),
        );
        const loadsEveryValue = Array.from(valueFieldIds).every((fieldId) =>
          loadedFieldIds.has(fieldId),
        );

        if (!loadsEveryValue) {
          if (!cancelled) {
            setTemplateLoadFailed(true);
            toast.error("Não foi possível carregar todas as fichas desta evolução.");
          }
          return;
        }

        if (cancelled) return;

        setSelectedTemplates(used);
        setValues(
          getInitialEvolutionFormValues(
            used.flatMap((pair) => pair.fields),
            evolution.values,
          ),
        );
        setTemplateLoadFailed(false);
        hydratedTemplatesRef.current = evolution.id;
      } catch (error) {
        if (!cancelled) {
          setTemplateLoadFailed(true);
          toast.error(
            getApiErrorMessage(error, "Não foi possível carregar as fichas desta evolução."),
          );
        }
      } finally {
        if (!cancelled) setLoadingTemplates(false);
      }
    };

    void hydrateTemplates();
    return () => {
      cancelled = true;
    };
  }, [open, evolution, templatesData, templatesPending, templatesError, hydrationAttempt]);

  const editedEvolutionDate = evolutionQuery.data?.date;
  const previousValues = useMemo(() => {
    const map = new Map<number, number>();
    const cutoff = editedEvolutionDate ? new Date(editedEvolutionDate).getTime() : null;

    for (const series of measurementsQuery.data ?? []) {
      for (const field of series.fields) {
        const lastPoint =
          cutoff === null
            ? field.data[field.data.length - 1]
            : [...field.data]
                .reverse()
                .find((point) => new Date(point.date).getTime() < cutoff);
        if (lastPoint) map.set(field.fieldId, lastPoint.value);
      }
    }
    return map;
  }, [measurementsQuery.data, editedEvolutionDate]);

  const saveMutation = useMutation({
    mutationFn: async (status: EvolutionStatus) => {
      const fields = selectedTemplates.flatMap((item) => item.fields);
      const payload = {
        professionalId,
        appointmentId: effectiveAppointmentId,
        date: toIsoDate(date),
        description: description.trim() || null,
        conduct: conduct.trim() || null,
        observations: observations.trim() || null,
        nextGuidance: nextGuidance.trim() || null,
        status,
        values: buildEvolutionValuesPayload(fields, values).filter(
          (value) => value.valueText === null || value.valueText.trim().length > 0,
        ),
      };

      if (evolutionId) {
        await updatePatientEvolution(patientId, evolutionId, payload);
        return evolutionId;
      }

      const created = await createPatientEvolution(patientId, payload);
      return created.id;
    },
    onSuccess: (savedId, status) => {
      toast.success(status === "Draft" ? "Rascunho salvo." : "Evolução concluída.");
      onSaved?.(savedId);
      void queryClient.invalidateQueries({ queryKey: patientRecordKeys.all(patientId) });
      onOpenChange(false);
    },
    onError: (error) => {
      const message = getApiErrorMessage(error, "Não foi possível salvar a evolução.");
      setSavingError(message);
      toast.error(message);
    },
    onSettled: () => setPendingStatus(null),
  });

  function save(status: EvolutionStatus) {
    if (pendingStatus !== null) return;
    if (isAdmin && professionalId === null) {
      setSavingError("Selecione o profissional.");
      return;
    }
    setSavingError(null);
    setPendingStatus(status);
    saveMutation.mutate(status);
  }

  async function addTemplate(template: EvolutionTemplate) {
    if (selectedTemplates.some((item) => item.template.id === template.id)) return;
    setSavingError(null);

    try {
      const fields = (await getEvolutionTemplateFields(template.id)).filter(
        (field) => field.isActive,
      );
      setSelectedTemplates((current) => [...current, { template, fields }]);
      setValues((current) => ({
        ...getInitialEvolutionFormValues(fields),
        ...current,
      }));
    } catch (error) {
      const message = getApiErrorMessage(error, "Não foi possível carregar os campos da ficha.");
      setSavingError(message);
      toast.error(message);
    }
  }

  function removeTemplate(templateId: number) {
    setSelectedTemplates((current) =>
      current.filter((item) => item.template.id !== templateId),
    );
  }

  async function retryTemplateHydration() {
    setSavingError(null);
    setTemplateLoadFailed(false);
    hydratedTemplatesRef.current = null;
    setHydrationAttempt((current) => current + 1);
    if (templatesQuery.isError) {
      await templatesQuery.refetch();
    }
  }

  const actionsDisabled =
    pendingStatus !== null ||
    (editing &&
      (evolutionQuery.isPending ||
        templatesPending ||
        templatesError ||
        loadingTemplates ||
        templateLoadFailed));

  const sheetTransition = prefersReducedMotion
    ? { duration: 0.15, ease: "easeOut" as const }
    : { duration: 0.24, ease: EASE_OUT };
  const sheetExit = prefersReducedMotion
    ? { duration: 0.1, ease: "easeOut" as const }
    : { duration: 0.18, ease: EASE_OUT };

  const showEditLoading = editing && evolutionQuery.isPending;
  const showEditError = editing && evolutionQuery.isError;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && pendingStatus !== null) return;
        onOpenChange(nextOpen);
      }}
    >
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0.1 : 0.18 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                className="fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col overflow-hidden border-l border-[#d7f3ea] bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.5)] dark:border-slate-800 dark:bg-slate-900 sm:w-[560px]"
                initial={prefersReducedMotion ? { opacity: 0 } : { x: "100%" }}
                animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0, transition: sheetExit }
                    : { x: "100%", transition: sheetExit }
                }
                transition={sheetTransition}
              >
                <header className="flex items-start justify-between gap-3 border-b border-[#d7f3ea] px-6 py-4 dark:border-slate-800">
                  <div className="min-w-0">
                    <Dialog.Title className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-white">
                      {editing ? "Editar evolução" : "Nova evolução"}
                    </Dialog.Title>
                    <p className="mt-1 text-sm text-[#475569] dark:text-slate-300">
                      Registre os textos e as medições desta sessão.
                    </p>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Fechar"
                      className="rounded-xl p-2 text-[#475569] transition-all duration-150 hover:bg-[#ecfdf5] hover:text-[#0f766e] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#99f6e4] active:scale-[0.97] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-[#67e8f9]"
                    >
                      <X size={18} />
                    </button>
                  </Dialog.Close>
                </header>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {showEditLoading && (
                    <div className="space-y-3">
                      <Skeleton className="h-9 w-full" />
                      <Skeleton className="h-9 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  )}

                  {showEditError && (
                    <ErrorState
                      message="Não foi possível carregar a evolução."
                      onRetry={() => evolutionQuery.refetch()}
                    />
                  )}

                  {!showEditLoading && !showEditError && (
                    <form
                      className="space-y-5"
                      onSubmit={(event) => {
                        event.preventDefault();
                        save("Completed");
                      }}
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor="evolution-date"
                            className="text-sm font-semibold text-[#0f172a] dark:text-white"
                          >
                            Data
                          </label>
                          <input
                            id="evolution-date"
                            type="date"
                            value={date}
                            onChange={(event) => setDate(event.target.value)}
                            className={textareaStyles}
                          />
                        </div>

                        {isAdmin ? (
                          <div className="flex flex-col gap-2">
                            <Select
                              id="evolution-professional"
                              label="Profissional"
                              value={professionalId ?? ""}
                              onChange={(event) =>
                                setProfessionalId(
                                  event.target.value ? Number(event.target.value) : null,
                                )
                              }
                            >
                              <option value="">Selecione</option>
                              {(professionalsQuery.data ?? []).map((professional) => (
                                <option key={professional.id} value={professional.id}>
                                  {professional.name}
                                </option>
                              ))}
                            </Select>
                            {professionalsQuery.isError && (
                              <button
                                type="button"
                                onClick={() => professionalsQuery.refetch()}
                                className="self-start text-xs font-semibold text-[#0f766e] underline underline-offset-2 dark:text-[#67e8f9]"
                              >
                                Não foi possível carregar os profissionais. Tentar novamente
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <span className="text-sm font-semibold text-[#0f172a] dark:text-white">
                              Profissional
                            </span>
                            <div className="rounded-xl border border-[#d7f3ea] bg-[#f8fffc] px-3 py-2 text-sm text-[#0f172a] dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                              {user?.name ?? "Você"}
                            </div>
                          </div>
                        )}
                      </div>

                      {effectiveAppointmentId !== null && (
                        <div className="flex flex-wrap items-center gap-1.5 text-sm text-[#475569] dark:text-slate-300">
                          <CalendarDays size={16} className="text-[#0f766e] dark:text-[#67e8f9]" />
                          <span>
                            Consulta de{" "}
                            {appointmentQuery.data
                              ? formatConsultationDate(
                                  appointmentQuery.data.appointmentDate,
                                  appointmentQuery.data.timeZoneId,
                                )
                              : "—"}{" "}
                            ·
                          </span>
                          <Link
                            href={`/app/agenda?mode=view&id=${effectiveAppointmentId}`}
                            className="font-semibold text-[#0f766e] underline underline-offset-2 dark:text-[#67e8f9]"
                          >
                            ver relatório
                          </Link>
                        </div>
                      )}

                      <div className="space-y-4 border-t border-[#d7f3ea] pt-5 dark:border-slate-800">
                        {(
                          [
                            ["Descrição", description, setDescription],
                            ["Conduta", conduct, setConduct],
                            ["Observações", observations, setObservations],
                            ["Próxima orientação", nextGuidance, setNextGuidance],
                          ] as const
                        ).map(([label, value, setValue]) => {
                          const id = `evolution-${label
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .replace(/\s+/g, "-")
                            .toLowerCase()}`;
                          return (
                            <div key={label} className="flex flex-col gap-2">
                              <label
                                htmlFor={id}
                                className="text-sm font-semibold text-[#0f172a] dark:text-white"
                              >
                                {label}
                              </label>
                              <textarea
                                id={id}
                                rows={3}
                                value={value}
                                onChange={(event) => setValue(event.target.value)}
                                className={textareaStyles}
                              />
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-4 border-t border-[#d7f3ea] pt-5 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">
                            Medições
                          </h2>
                          <TemplatePicker
                            selectedTemplateIds={selectedTemplates.map(
                              (item) => item.template.id,
                            )}
                            onSelect={addTemplate}
                            disabled={pendingStatus !== null}
                          />
                        </div>

                        {loadingTemplates && (
                          <div className="space-y-2">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                          </div>
                        )}

                        {!loadingTemplates && templateLoadFailed && (
                          <div
                            role="alert"
                            className="space-y-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                          >
                            <p>Não foi possível carregar as fichas desta evolução.</p>
                            <button
                              type="button"
                              onClick={() => void retryTemplateHydration()}
                              className="font-semibold underline underline-offset-2"
                            >
                              Tentar novamente
                            </button>
                          </div>
                        )}

                        {!loadingTemplates && !templateLoadFailed && selectedTemplates.length === 0 && (
                          <p className="text-sm text-[#475569] dark:text-slate-300">
                            Nenhuma ficha adicionada. Use &quot;Adicionar ficha&quot; para
                            registrar as medições desta evolução.
                          </p>
                        )}

                        {selectedTemplates.map(({ template, fields }) => (
                          <section
                            key={template.id}
                            className="space-y-3 rounded-xl border border-[#d7f3ea] bg-[#f8fffc] p-4 dark:border-slate-700 dark:bg-slate-950/60"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <h3 className="text-sm font-bold text-[#0f172a] dark:text-white">
                                {template.name}
                              </h3>
                              <button
                                type="button"
                                aria-label={`Remover ficha ${template.name}`}
                                onClick={() => removeTemplate(template.id)}
                                className="rounded-lg p-1.5 text-[#475569] transition-all duration-150 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#99f6e4] active:scale-[0.97] dark:text-slate-300 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              {fields.map((field) => (
                                <EvolutionFieldInput
                                  key={field.id}
                                  field={field}
                                  value={values[field.id]}
                                  previousValue={previousValues.get(field.id) ?? null}
                                  onChange={(value) =>
                                    setValues((current) => ({
                                      ...current,
                                      [field.id]: value,
                                    }))
                                  }
                                  disabled={pendingStatus !== null}
                                />
                              ))}
                            </div>
                          </section>
                        ))}
                      </div>

                      {savingError && (
                        <p
                          role="alert"
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                        >
                          {savingError}
                        </p>
                      )}

                      <div className="-mx-6 -mb-5 flex flex-col-reverse gap-2 border-t border-[#d7f3ea] bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          fullWidth={false}
                          disabled={actionsDisabled}
                          loading={pendingStatus === "Draft"}
                          onClick={() => save("Draft")}
                        >
                          Salvar rascunho
                        </Button>
                        <Button
                          type="submit"
                          fullWidth={false}
                          disabled={actionsDisabled}
                          loading={pendingStatus === "Completed"}
                        >
                          Concluir
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
