export interface PagedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export type UserRole = "SuperAdmin" | "Administrador" | "Profissional" | "Recepcao";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  clinicId?: number | null;
  clinicName?: string | null;
  createdAt?: string;
}

export type BillingStatus = "Enabled" | "Blocked" | "Disabled";

export interface SuperAdminDashboardMetrics {
  totalClinics: number;
  activeClinics: number;
  inactiveClinics: number;
  billingBlocked: number;
  billingEnabled: number;
  overdueCharges: number;
  monthlyReceived: number;
  monthlyPending: number;
  latestActivities: SuperAdminCommercialHistoryItem[];
}

export interface SuperAdminClinic {
  id: number;
  nome: string;
  nomeFantasia: string;
  nomeResponsavel: string;
  cnpj: string;
  email: string;
  telefone: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  isActive: boolean;
  isBlockedByBilling: boolean;
  valorMensalidade: number;
  diaVencimento: number;
  cobrancaAtiva: boolean;
  dataInicioCobranca: string | null;
  createdAt: string;
}

export interface SuperAdminClinicUser {
  id: number;
  name: string;
  email: string;
  role: Exclude<UserRole, "SuperAdmin">;
  isActive: boolean;
}

export type SuperAdminClinicDetail = SuperAdminClinic;

export interface SuperAdminBillingCharge {
  id: number;
  clinicaId: number;
  referenceMonth: string;
  amount: number;
  status: "Pending" | "Paid" | "Cancelled";
  dueDate: string;
  paidAt: string | null;
  paymentMethod: string;
  notes: string;
}

export interface SuperAdminCommercialHistoryItem {
  id: number;
  clinicaId: number;
  type: string;
  description: string;
  metadataJson: string | null;
  createdAt: string;
}

export type TipoPlano = "Mensal" | "Avulso";
export type TipoSessao = "Fisioterapia" | "Pilates" | "Massagem" | "Hidrolipo" | "Lipedema" | "Linfedema";

export interface Plan {
  id: number;
  name: string;
  valor: number;
  tipoPlano: TipoPlano;
  tipoSessao: TipoSessao;
  createdAt: string;
}

export type PaymentStatus = "Pending" | "Paid" | "Cancelled";

export interface Payment {
  id: number;
  userId: number;
  patientId: number;
  patientName: string;
  planId: number;
  planName: string;
  planAmount: number;
  referenceMonth: string;
  paymentMethod: string;
  status: PaymentStatus;
  paidAt: string | null;
  paymentDate: string | null;
  createdAt: string;
}

export interface CreatePaymentDto {
  patientId: number;
  planId: number;
  referenceMonth: string;
  paymentMethod: string;
  status: PaymentStatus;
  paidAt?: string;
  paymentDate?: string | null;
}

export interface Patient {
  id: number;
  name: string | null;
  email: string | null;
  cpf: string | null;
  rg: string | null;
  phone: string | null;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  isActive: boolean;
  createdAt?: string;
  appointmentStatus?: "Scheduled" | "Completed" | "Cancelled";
  paymentStatus?: "Pending" | "Paid" | "Cancelled";
}

export interface Appointment {
  id: number;
  userId: number;
  patientId: number;
  patientName: string;
  appointmentDate: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  createdAt: string;
}

export interface MedicalRecord {
  id: number;
  userId: number;
  userName: string;
  patientId: number;
  patientName: string;
  patologia: string;
  queixaPrincipal: string;
  examesImagem: string;
  doencaAntiga: string;
  doencaAtual: string;
  habitos: string;
  examesFisicos: string;
  sinaisVitais: string;
  medicamentos: string;
  cirurgias: string;
  outrasDoencas: string;
  sessao: string;
  titulo: string;
  contrato: string;
  orientacaoDomiciliar: string;
  createdAt: string;
}

// ─── Perfil do Paciente (360°) ─────────────────────────────────────────────

export interface PatientProfileAppointment {
  id: number;
  appointmentDate: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  userName: string;
  createdAt: string;
}

export interface PatientProfileMedicalRecord {
  id: number;
  titulo: string;
  sessao: string;
  patologia: string;
  userName: string;
  createdAt: string;
}

export interface PatientProfilePayment {
  id: number;
  referenceMonth: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  status: "Pending" | "Paid" | "Cancelled";
  paymentDate: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface PatientProfile {
  id: number;
  name: string | null;
  email: string | null;
  cpf: string | null;
  rg: string | null;
  phone: string | null;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  isActive: boolean;
  createdAt: string;
  appointments: PatientProfileAppointment[];
  medicalRecords: PatientProfileMedicalRecord[];
  payments: PatientProfilePayment[];
}

// ─── Módulo Financeiro ─────────────────────────────────────────────────────

export interface Expense {
  id: number;
  title: string;
  value: number;
  paymentDate: string;       // ISO string — ex: "2026-03-10T00:00:00Z"
  description: string;
  referenceMonth: string;    // formato "YYYY-MM" — ex: "2026-03"
  createdAt: string;
}

export interface FinancialBalance {
  referenceMonth: string;    // "YYYY-MM"
  totalExpenses: number;     // soma dos gastos do mês
  totalIncome: number;       // soma dos payments com status "Paid"
  netBalance: number;        // totalIncome - totalExpenses
}

export interface CreateExpenseDto {
  title: string;
  value: number;
  paymentDate: string;       // ISO string
  description: string;
  referenceMonth: string;    // "YYYY-MM"
}
