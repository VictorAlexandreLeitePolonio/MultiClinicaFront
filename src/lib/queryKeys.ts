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
  appointmentRequests: {
    all: ["appointment-requests"] as const,
    list: () => ["appointment-requests", "list"] as const,
    detail: (requestId: number) => ["appointment-requests", "detail", requestId] as const,
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
    balance: (params?: unknown) => params === undefined ? ["financial", "balance"] as const : ["financial", "balance", params] as const,
    expenses: (params?: unknown) => params === undefined ? ["financial", "expenses"] as const : ["financial", "expenses", params] as const,
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
  evolution: {
    templates: {
      all: ["evolution", "templates"] as const,
      list: (params: unknown) => ["evolution", "templates", "list", params] as const,
      detail: (templateId: number) => ["evolution", "templates", templateId] as const,
      fields: (templateId: number) => ["evolution", "templates", templateId, "fields"] as const,
    },
    patientTreatments: (patientId: number) => ["evolution", "patients", patientId, "treatments"] as const,
    patientTreatment: (patientId: number, treatmentId: number) =>
      ["evolution", "patients", patientId, "treatments", treatmentId] as const,
    patientEvolutions: (patientId: number, treatmentId: number, params: unknown) =>
      ["evolution", "patients", patientId, "treatments", treatmentId, "evolutions", params] as const,
    patientEvolution: (patientId: number, treatmentId: number, evolutionId: number) =>
      ["evolution", "patients", patientId, "treatments", treatmentId, "evolutions", evolutionId] as const,
    treatmentProgress: (patientId: number, treatmentId: number) =>
      ["evolution", "patients", patientId, "treatments", treatmentId, "progress"] as const,
    dashboardSummary: ["evolution", "dashboard-summary"] as const,
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

export const clinicSettingsKeys = {
  all: ["clinic-settings"] as const,
  detail: () => ["clinic-settings", "detail"] as const,
};

export const clinicProfileKeys = {
  categoryCatalog: ["clinic-profile", "categories", "catalog"] as const,
  categories: ["clinic-profile", "categories"] as const,
  businessHours: ["clinic-profile", "business-hours"] as const,
  media: ["clinic-profile", "media"] as const,
};

export const publicClinicKeys = {
  detail: (slug: string) => ["public-clinic", slug] as const,
};

export const patientPortalKeys = {
  all: ["patient-portal"] as const,
  me: ["patient-portal", "me"] as const,
  appointments: (scope: "upcoming" | "history") =>
    ["patient-portal", "appointments", scope] as const,
  clinics: ["patient-portal", "clinics"] as const,
  requests: ["patient-portal", "requests"] as const,
};

export const superAdminClinicSettingsKeys = {
  all: ["superadmin-clinic-settings"] as const,
  detail: (clinicId: number) => ["superadmin-clinic-settings", clinicId] as const,
};
