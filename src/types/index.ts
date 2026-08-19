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

export interface AuthTenant {
  id: number;
  name: string;
  displayName: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
}

export interface AuthResponse {
  user: User;
  tenant: AuthTenant | null;
  permissions: string[];
}

export interface ClinicSettings {
  clinicId: number;
  name: string;
  displayName: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
}

export interface UpdateClinicSettingsRequest {
  displayName?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
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

/** Estado de ativação da identidade global (PatientAccount) do paciente. */
export type PatientAccountStatus = "PendingActivation" | "Active" | "Inactive";

/** Resultado da resolução de identidade + vínculo do paciente com a clínica. */
export type PatientPortalLinkResult =
  | "CreatedAccount"
  | "LinkedExistingAccount"
  | "AlreadyLinked";

/**
 * Resposta de POST /api/patients, /portal-access e /resend-invite: expõe a
 * identidade global resolvida e o resultado do vínculo com a clínica.
 */
export interface PatientCreatedResponse {
  id: number;
  patientId: number;
  patientAccountId: number;
  patientAccountStatus: PatientAccountStatus;
  linkResult: PatientPortalLinkResult;
  invitationSent: boolean;
}

/** Sessão do paciente no portal (retorno de /api/patient-auth login/me/activate). */
export interface PatientSession {
  id: number;
  name: string | null;
  email: string | null;
  status: PatientAccountStatus;
}

/** Perfil do paciente no portal (GET /api/patient/me). */
export interface PatientMe {
  id: number;
  name: string | null;
  email: string | null;
  cpf: string | null;
  phone: string | null;
  status: PatientAccountStatus;
}

/** MVP: paciente só altera nome e telefone. */
export interface UpdatePatientMePayload {
  name: string | null;
  phone: string | null;
}

/** Consulta exposta ao paciente — sem prontuário/evolução/pagamentos. */
export interface PatientAppointment {
  appointmentId: number;
  clinicId: number;
  clinicName: string | null;
  clinicSlug: string | null;
  professionalName: string | null;
  appointmentDate: string;
  status: "Scheduled" | "Completed" | "Cancelled";
}

/** Resumo público de uma clínica vinculada ("Minhas Clínicas"). */
export interface PatientClinic {
  id: number;
  slug: string | null;
  displayName: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  categories: string[];
  city: string | null;
  state: string | null;
  likeCount: number;
  likedByMe: boolean;
  /** Gate do CTA "Solicitar consulta". */
  acceptsAppointmentRequests: boolean;
}

export type AppointmentRequestStatus = "Pending" | "Accepted" | "Rejected" | "Cancelled";
export type CancellationOrigin = "Patient" | "Clinic";

/** Solicitação de consulta (mesmo contrato para o paciente e para a clínica). */
export interface PatientAppointmentRequest {
  id: number;
  patientAccountId: number;
  clinicId: number;
  clinicName: string | null;
  patientName: string | null;
  requestedDate: string;
  reason: string | null;
  status: AppointmentRequestStatus;
  responseReason: string | null;
  cancelledBy: CancellationOrigin | null;
  respondedAt: string | null;
  appointmentId: number | null;
  createdAt: string;
}

/** Alias usado no lado da clínica (Agenda) — mesmo shape do DTO do backend. */
export type AppointmentRequest = PatientAppointmentRequest;

/** Payload de criação de solicitação pelo paciente. */
export interface CreateAppointmentRequestPayload {
  clinicId: number;
  requestedDate: string;
  reason: string | null;
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
  /** null quando o paciente não possui acesso ao portal ("Sem acesso"). */
  portalAccessStatus?: PatientAccountStatus | null;
}

export interface Appointment {
  id: number;
  professionalId: number;
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
  attachments: ClinicalAttachment[];
}

export type ClinicalAttachmentType = "Contract" | "Exam" | "Other";

export interface ClinicalAttachment {
  id: number;
  patientId: number;
  medicalRecordId: number | null;
  type: ClinicalAttachmentType;
  originalFileName: string;
  objectKey: string;
  contentType: string;
  size: number;
  uploadedByUserId: number;
  uploadedAt: string;
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
  /** null quando o paciente não possui acesso ao portal ("Sem acesso"). */
  portalAccessStatus?: PatientAccountStatus | null;
  appointments: PatientProfileAppointment[];
  medicalRecords: PatientProfileMedicalRecord[];
  payments: PatientProfilePayment[];
}

export * from "./evolution";

export interface BalancePeriod {
  startDate: string;
  endDate: string;
}

export interface BalanceMoneySummary {
  appointmentIncome: number;
  productSalesIncome: number;
  totalIncome: number;
  productPurchaseCost: number;
  productOutputCost: number;
  productLossCost: number;
  productInternalUseCost: number;
  manualExpenseCost: number;
  totalOutcome: number;
  estimatedProfit: number;
  paidAppointmentCount: number;
  productSaleCount: number;
  stockCostMovementCount: number;
  manualExpenseCount: number;
}

export interface BalanceAppointmentsSummary {
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
  total: number;
}

export interface BalancePatientsSummary {
  active: number;
  newInPeriod: number;
  total: number;
}

export interface BalanceLowStockProduct {
  productId: number;
  name: string;
  currentQuantity: number;
  minimumQuantity: number;
}

export interface BalanceStockSummary {
  totalProducts: number;
  productsBelowMinimum: number;
  stockEntriesInPeriod: number;
  stockOutputsInPeriod: number;
  productSalesInPeriod: number;
  productPurchasesInPeriod: number;
  productLossesInPeriod: number;
  productInternalUseInPeriod: number;
  lowStockProducts: BalanceLowStockProduct[];
}

export interface BalanceEvolutionSummary {
  evolutionsInPeriod: number;
  treatmentsInProgress: number;
  completedTreatments: number;
}

export type BalanceRecentMovementSource = "Payment" | "Stock" | "ManualExpense";

export type BalanceRecentMovementType =
  | "AppointmentPayment"
  | "ProductSale"
  | "ProductPurchase"
  | "ProductOutput"
  | "ProductLoss"
  | "InternalUse"
  | "ClinicExpense";

export interface BalanceRecentMovement {
  id: number;
  source: BalanceRecentMovementSource;
  type: BalanceRecentMovementType;
  description: string;
  amount: number | null;
  quantity: number | null;
  date: string;
}

export interface ClinicExpense {
  id: number;
  title: string;
  amount: number;
  date: string;
  description: string | null;
  createdAt: string;
}

export interface FinancialBalance {
  period: BalancePeriod;
  money: BalanceMoneySummary;
  appointments: BalanceAppointmentsSummary;
  patients: BalancePatientsSummary;
  stock: BalanceStockSummary;
  evolutions: BalanceEvolutionSummary;
  recentMovements: BalanceRecentMovement[];
}
