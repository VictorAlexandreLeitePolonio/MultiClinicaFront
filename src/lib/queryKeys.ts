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
    professionals: ["appointments", "professionals"] as const,
    day: (professionalId: number, date: string) => ["appointments", "day", professionalId, date] as const,
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
    summary: (params: unknown) => ["payments", "summary", params] as const,
  },
  financial: {
    balance: (params?: unknown) => params === undefined ? ["financial", "balance"] as const : ["financial", "balance", params] as const,
    expenses: (params?: unknown) => params === undefined ? ["financial", "expenses"] as const : ["financial", "expenses", params] as const,
  },
  plans: {
    all: ["plans"] as const,
    list: (params: unknown) => ["plans", "list", params] as const,
    detail: (planId: number) => ["plans", "detail", planId] as const,
    public: ["plans", "public"] as const,
  },
  billing: {
    status: ["billing", "status"] as const,
    usage: ["billing", "usage"] as const,
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
    dashboardSummary: ["evolution", "dashboard-summary"] as const,
  },
  superAdmin: {
    dashboard: ["superadmin", "dashboard"] as const,
    clinics: (params: unknown) => ["superadmin", "clinics", params] as const,
    clinicDetail: (clinicId: number) => ["superadmin", "clinics", clinicId] as const,
    billing: (clinicId: number, params: unknown) => ["superadmin", "billing", clinicId, params] as const,
    history: (clinicId: number, params: unknown) => ["superadmin", "history", clinicId, params] as const,
    clinicUsers: (clinicId: number, params: unknown) => ["superadmin", "users", clinicId, params] as const,
    hubApprovals: ["superadmin", "hub-approvals"] as const,
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

export const availabilityKeys = {
  all: ["clinic-availability"] as const,
  settings: ["clinic-availability", "settings"] as const,
  professionals: ["clinic-availability", "professionals"] as const,
  professional: (professionalId: number) =>
    ["clinic-availability", "professionals", professionalId] as const,
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

export const marketplaceKeys = {
  all: ["patient-marketplace"] as const,
  categories: ["patient-marketplace", "categories"] as const,
  clinics: (filters: unknown) => ["patient-marketplace", "clinics", filters] as const,
  detail: (clinicId: number) => ["patient-marketplace", "clinics", clinicId] as const,
  availability: (clinicId: number, date: string) =>
    ["patient-marketplace", "clinics", clinicId, "availability", date] as const,
};

export const superAdminClinicSettingsKeys = {
  all: ["superadmin-clinic-settings"] as const,
  detail: (clinicId: number) => ["superadmin-clinic-settings", clinicId] as const,
};

export const whatsAppLinkKeys = {
  status: ["whatsapp-link", "status"] as const,
};

export const mercadoPagoKeys = {
  status: ["mercadopago", "status"] as const,
};

export const publicPaymentKeys = {
  detail: (token: string) => ["public-payment", token] as const,
};

export const patientChargeKeys = {
  all: ["patient-charges"] as const,
};

export const consultationKeys = {
  detail: (appointmentId: number) => ["consultation", appointmentId] as const,
  chargeSuggestion: (appointmentId: number) => ["consultation", appointmentId, "charge-suggestion"] as const,
  byPatient: (patientId: number) => ["consultation", "patient", patientId] as const,
};

// Prontuário do paciente: evoluções sem acompanhamento, medições e linha do tempo.
export const patientRecordKeys = {
  all: (patientId: number) => ["patient-record", patientId] as const,
  evolutions: (patientId: number, params: unknown) => ["patient-record", patientId, "evolutions", params] as const,
  evolution: (patientId: number, evolutionId: number) => ["patient-record", patientId, "evolution", evolutionId] as const,
  measurements: (patientId: number) => ["patient-record", patientId, "measurements"] as const,
  timeline: (patientId: number) => ["patient-record", patientId, "timeline"] as const,
};
