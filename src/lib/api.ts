import axios, { type AxiosError } from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL,
  withCredentials: true,
})

// Flag para evitar múltiplos redirects quando várias requisições retornam 401
let isRedirectingToLogin = false

// Disparado em window pelo interceptor de 402; detail: BillingLimitError.
export const PLAN_REQUIRED_EVENT = "cliniq:plan-required";

export function handleResponseError(error: AxiosError) {
  const requestUrl = String(error.config?.url ?? '')
  const isAuthBootstrapRequest = requestUrl.includes('/api/auth/me')

  if (
    error.response?.status === 401 &&
    !isAuthBootstrapRequest &&
    !isRedirectingToLogin
  ) {
    isRedirectingToLogin = true
    toast.error('Sua sessão expirou. Faça login novamente.')
    setTimeout(() => {
      isRedirectingToLogin = false
      window.location.href = '/login'
    }, 1500)
  }

  if (error.response?.status === 402 && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PLAN_REQUIRED_EVENT, { detail: error.response.data }))
  }

  return Promise.reject(error)
}

api.interceptors.response.use(
  (response) => response,
  handleResponseError,
)

export default api
