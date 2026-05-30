import api from "@/lib/api";
import {
  PagedResult,
  SuperAdminClinic,
  SuperAdminClinicDetail,
  SuperAdminClinicUser,
  UserRole,
} from "@/types";

export interface GetSuperAdminClinicsParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  billingStatus?: string;
}

export async function getSuperAdminClinics(
  params: GetSuperAdminClinicsParams
): Promise<PagedResult<SuperAdminClinic>> {
  const response = await api.get<PagedResult<SuperAdminClinic>>("/api/superadmin/clinics", {
    params,
  });

  return response.data;
}

export async function getSuperAdminClinicDetail(
  clinicId: number
): Promise<SuperAdminClinicDetail> {
  const response = await api.get<SuperAdminClinicDetail>(`/api/superadmin/clinics/${clinicId}`);

  return response.data;
}

export interface CreateSuperAdminClinicPayload {
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address: {
    rua?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  billing: {
    enabled: boolean;
    monthlyFee: number;
  };
  status: "Active" | "Inactive";
  internalNotes?: string;
  firstAdministrator?: {
    name: string;
    email: string;
    password: string;
  };
}

export async function createSuperAdminClinic(
  payload: CreateSuperAdminClinicPayload
): Promise<SuperAdminClinic> {
  const response = await api.post<SuperAdminClinic>("/api/superadmin/clinics", payload);

  return response.data;
}

export interface ConfigureClinicBillingPayload {
  enabled: boolean;
  monthlyFee: number;
}

export async function configureClinicBilling(
  clinicId: number,
  payload: ConfigureClinicBillingPayload
): Promise<SuperAdminClinicDetail> {
  const response = await api.put<SuperAdminClinicDetail>(
    `/api/superadmin/clinics/${clinicId}/billing`,
    payload
  );

  return response.data;
}

export interface RegisterClinicPaymentPayload {
  referenceMonth: string;
  amount: number;
  paidAt: string;
  notes?: string;
}

export async function registerClinicPayment(
  clinicId: number,
  payload: RegisterClinicPaymentPayload
): Promise<void> {
  await api.post(`/api/superadmin/clinics/${clinicId}/payments`, payload);
}

export interface UnblockClinicBillingPayload {
  reason: string;
}

export async function unblockClinicBilling(
  clinicId: number,
  payload: UnblockClinicBillingPayload
): Promise<SuperAdminClinicDetail> {
  const response = await api.post<SuperAdminClinicDetail>(
    `/api/superadmin/clinics/${clinicId}/billing/unblock`,
    payload
  );

  return response.data;
}

export interface CreateSuperAdminClinicUserPayload {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, "SuperAdmin">;
}

export async function createSuperAdminClinicUser(
  clinicId: number,
  payload: CreateSuperAdminClinicUserPayload
): Promise<SuperAdminClinicUser> {
  const response = await api.post<SuperAdminClinicUser>(
    `/api/superadmin/clinics/${clinicId}/users`,
    payload
  );

  return response.data;
}
