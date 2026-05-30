import axios from "axios";

const ERROR_CODE_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "E-mail ou senha inválidos.",
  USER_INACTIVE: "Seu usuário está inativo. Entre em contato com o administrador.",
  CLINIC_INACTIVE: "A clínica está inativa. Entre em contato com o suporte.",
  BILLING_BLOCKED: "A clínica está bloqueada por pendência financeira.",
  FORBIDDEN: "Você não tem permissão para executar esta ação.",
  NOT_FOUND: "Registro não encontrado.",
};

export function getApiErrorMessage(error: unknown, fallback = "Ocorreu um erro inesperado."): string {
  if (axios.isAxiosError(error)) {
    const errorCode = error.response?.data?.errorCode;
    if (typeof errorCode === "string" && ERROR_CODE_MESSAGES[errorCode]) {
      return ERROR_CODE_MESSAGES[errorCode];
    }

    const msg = error.response?.data?.message;
    if (typeof msg === "string" && msg.trim().length > 0) return msg;

    if (error.response?.status === 401) return "Sua sessão expirou. Faça login novamente.";
    if (error.response?.status === 403) return ERROR_CODE_MESSAGES.FORBIDDEN;
    if (error.response?.status === 404) return ERROR_CODE_MESSAGES.NOT_FOUND;
  }
  return fallback;
}
