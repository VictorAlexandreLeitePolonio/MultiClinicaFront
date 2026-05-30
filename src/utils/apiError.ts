import axios from "axios";

// Extrai a mensagem de erro de qualquer resposta da API.
// A API sempre retorna { message: "..." } nos erros.
// Se o erro for de rede ou inesperado, retorna uma mensagem genérica.
export function getApiErrorMessage(error: unknown, fallback = "Ocorreu um erro inesperado."): string {
  if (axios.isAxiosError(error)) {
    // Erro 401 — sessão expirada
    if (error.response?.status === 401) {
      return "Sua sessão expirou. Faça login novamente.";
    }
    // Erro com corpo { message: "..." }
    const msg = error.response?.data?.message;
    if (typeof msg === "string" && msg.trim().length > 0) return msg;
  }
  return fallback;
}
