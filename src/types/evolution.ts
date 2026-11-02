import type { PagedResult } from "./index";

export type EvolutionFieldType =
  | "Number"
  | "Scale"
  | "Percentage"
  | "Boolean"
  | "Text"
  | "SelectScore";

export type EvolutionFieldUnit =
  | "None"
  | "Points"
  | "Percentage"
  | "Kg"
  | "G"
  | "Mg"
  | "Cm"
  | "Mm"
  | "M"
  | "Degrees"
  | "Seconds"
  | "Minutes"
  | "Hours"
  | "Days"
  | "Repetitions"
  | "Liters"
  | "Ml"
  | "Score";

export type EvolutionDirection = "Neutral" | "Increase" | "Decrease";
export type EvolutionStatus = "Draft" | "Completed" | "Canceled";

export interface EvolutionTemplate {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EvolutionTemplatePayload {
  name: string;
  description?: string | null;
  category?: string | null;
  isDefault: boolean;
}

export interface EvolutionTemplateUpdatePayload {
  name?: string;
  description?: string | null;
  category?: string | null;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface EvolutionTemplateField {
  id: number;
  templateId: number;
  label: string;
  key: string;
  type: EvolutionFieldType;
  unit: EvolutionFieldUnit;
  minValue: number | null;
  maxValue: number | null;
  targetValue: number | null;
  expectedDirection: EvolutionDirection;
  weight: number;
  required: boolean;
  showInChart: boolean;
  isActive: boolean;
  order: number;
  optionsJson: string | null;
}

export interface EvolutionTemplateFieldPayload {
  label: string;
  type: EvolutionFieldType;
  unit?: EvolutionFieldUnit | null;
  minValue?: number | null;
  maxValue?: number | null;
  targetValue?: number | null;
  expectedDirection: EvolutionDirection;
  weight: number;
  required: boolean;
  showInChart: boolean;
  order: number;
  optionsJson?: string | null;
}

export interface EvolutionTemplateFieldUpdatePayload extends Partial<EvolutionTemplateFieldPayload> {
  isActive?: boolean;
}

export interface PatientEvolutionValue {
  fieldId: number;
  valueNumber: number | null;
  valueText: string | null;
  valueBoolean: boolean | null;
  valueJson: string | null;
}

export interface PatientEvolution {
  id: number;
  patientId: number;
  /** Consulta de origem; uma consulta pode ter várias evoluções. */
  appointmentId: number | null;
  /** Fichas medidas nesta evolução. */
  templateNames: string[];
  professionalId: number;
  serviceId: number | null;
  date: string;
  description: string | null;
  conduct: string | null;
  observations: string | null;
  nextGuidance: string | null;
  status: EvolutionStatus;
  values: PatientEvolutionValue[];
}

export interface PatientEvolutionPayload {
  professionalId?: number | null;
  appointmentId?: number | null;
  serviceId?: number | null;
  date?: string | null;
  description?: string | null;
  conduct?: string | null;
  observations?: string | null;
  nextGuidance?: string | null;
  status: EvolutionStatus;
  values: PatientEvolutionValue[];
}

export interface PatientEvolutionUpdatePayload extends Partial<Omit<PatientEvolutionPayload, "values">> {
  values?: PatientEvolutionValue[];
}

export interface TreatmentProgressChart {
  fieldId: number;
  label: string;
  unit: EvolutionFieldUnit;
  direction: EvolutionDirection;
  initialValue: number;
  currentValue: number;
  targetValue: number | null;
  progress: number | null;
  data: TreatmentProgressPoint[];
}

export interface TreatmentProgressPoint {
  date: string;
  value: number;
}

export interface EvolutionDashboardSummary {
  /** Pacientes com evolução concluída com medição nos últimos 60 dias. */
  patientsInFollowUp: number;
  completedEvolutionsThisMonth: number;
  patientsImproving: number;
  patientsStable: number;
  patientsWorsening: number;
  averageProgress: number | null;
  mostUsedTemplates: MostUsedEvolutionTemplate[];
}

export interface MostUsedEvolutionTemplate {
  templateId: number;
  name: string;
  count: number;
}

export type EvolutionTemplatesResult = PagedResult<EvolutionTemplate>;
export type PatientEvolutionsResult = PagedResult<PatientEvolution>;

// GET /api/patients/{id}/measurements: uma série por ficha medida.
export interface PatientMeasurementSeries {
  templateId: number;
  templateName: string;
  lastDate: string;
  evolutionCount: number;
  fields: TreatmentProgressChart[];
}

export type PatientTimelineEventType = "appointment" | "evolution" | "anamnesis";

// GET /api/patients/{id}/timeline?before=&take=
export interface PatientTimelineEvent {
  type: PatientTimelineEventType;
  id: number;
  date: string;
  title: string;
  professionalName: string | null;
  status: string | null;
  consultationStatus: string | null;
  appointmentId: number | null;
  evolutionCount: number;
  templateNames: string[];
}

export interface PatientTimeline {
  events: PatientTimelineEvent[];
  /** Passe em ?before= para a próxima página; null quando acabou. */
  nextBefore: string | null;
}

// GET /api/patient-records/timeline?before=&take= (Administrador, Profissional)
export interface ClinicTimelineEvent {
  patientId: number;
  patientName: string;
  event: PatientTimelineEvent;
}

export interface ClinicTimeline {
  events: ClinicTimelineEvent[];
  nextBefore: string | null;
}
