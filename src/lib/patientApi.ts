import axios from "axios";
import { toast } from "sonner";

/**
 * Cliente HTTP dedicado ao portal do paciente. Mantém a sessão do paciente
 * totalmente separada do backoffice: envia/recebe o cookie `patient_auth_token`
 * e, em caso de 401, redireciona para o login do paciente — nunca para o login
 * da clínica.
 */
const patientApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5045",
  withCredentials: true,
});

let isRedirectingToLogin = false;

patientApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url ?? "");
    // O bootstrap (/me) trata o 401 silenciosamente: significa "sem sessão".
    const isAuthBootstrapRequest = requestUrl.includes("/api/patient-auth/me");

    if (
      error.response?.status === 401 &&
      !isAuthBootstrapRequest &&
      !isRedirectingToLogin
    ) {
      isRedirectingToLogin = true;
      toast.error("Sua sessão expirou. Faça login novamente.");
      setTimeout(() => {
        isRedirectingToLogin = false;
        window.location.href = "/paciente/login";
      }, 1500);
    }
    return Promise.reject(error);
  }
);

export default patientApi;
