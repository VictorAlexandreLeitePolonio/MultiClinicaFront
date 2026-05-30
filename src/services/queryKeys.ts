export const queryKeys = {
  patients: {
    all: ["patients"] as const,
    list: (params: unknown) => ["patients", "list", params] as const,
    detail: (patientId: number) => ["patients", "detail", patientId] as const,
    profile: (patientId: number) => ["patients", "profile", patientId] as const,
  },
  appointments: {
    all: ["appointments"] as const,
    list: (params: unknown) => ["appointments", "list", params] as const,
    detail: (appointmentId: number) => ["appointments", "detail", appointmentId] as const,
    calendar: (params: unknown) => ["appointments", "calendar", params] as const,
  },
  medicalRecords: {
    all: ["medical-records"] as const,
    list: (params: unknown) => ["medical-records", "list", params] as const,
    detail: (recordId: number) => ["medical-records", "detail", recordId] as const,
  },
  payments: {
    all: ["payments"] as const,
    list: (params: unknown) => ["payments", "list", params] as const,
    detail: (paymentId: number) => ["payments", "detail", paymentId] as const,
  },
  financial: {
    balance: (month: string) => ["financial", "balance", month] as const,
    history: (params: unknown) => ["financial", "history", params] as const,
    expenses: (params: unknown) => ["financial", "expenses", params] as const,
    expenseDetail: (expenseId: number) => ["financial", "expenses", expenseId] as const,
  },
  plans: {
    all: ["plans"] as const,
    list: (params: unknown) => ["plans", "list", params] as const,
    detail: (planId: number) => ["plans", "detail", planId] as const,
  },
  users: {
    all: ["users"] as const,
    list: (params: unknown) => ["users", "list", params] as const,
    detail: (userId: number) => ["users", "detail", userId] as const,
  },
  superAdmin: {
    dashboard: ["superadmin", "dashboard"] as const,
    clinics: (params: unknown) => ["superadmin", "clinics", params] as const,
    clinicDetail: (clinicId: number) => ["superadmin", "clinics", clinicId] as const,
    billing: (clinicId: number, params: unknown) => ["superadmin", "billing", clinicId, params] as const,
    history: (clinicId: number, params: unknown) => ["superadmin", "history", clinicId, params] as const,
    clinicUsers: (clinicId: number, params: unknown) => ["superadmin", "users", clinicId, params] as const,
  },
};
