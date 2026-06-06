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
export type TreatmentStatus = "Active" | "Paused" | "Completed" | "Canceled";
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

export interface PatientTreatment {
  id: number;
  patientId: number;
  professionalId: number | null;
  templateId: number;
  title: string;
  description: string | null;
  startedAt: string;
  endedAt: string | null;
  status: TreatmentStatus;
  createdAt: string;
}

export interface PatientTreatmentPayload {
  templateId: number;
  professionalId?: number | null;
  title: string;
  description?: string | null;
  startedAt?: string | null;
}

export interface PatientTreatmentUpdatePayload {
  professionalId?: number | null;
  title?: string;
  description?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  status?: TreatmentStatus;
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
  treatmentId: number;
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

export interface TreatmentProgressResponse {
  treatment: {
    id: number;
    title: string;
  };
  summary: {
    totalEvolutions: number;
    overallProgress: number | null;
    improvingFields: number;
    worseningFields: number;
    stableFields: number;
    lastEvolutionDate: string | null;
  };
  charts: TreatmentProgressChart[];
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
  activeTreatments: number;
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
