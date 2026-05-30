import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5045",
  withCredentials: true,
});

// Flag para evitar múltiplos redirects quando várias requisições retornam 401
let isRedirectingToLogin = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirectingToLogin) {
      isRedirectingToLogin = true;
      toast.error("Sua sessão expirou. Faça login novamente.");
      setTimeout(() => {
        isRedirectingToLogin = false;
        window.location.href = "/login";
      }, 1500);
    }
    return Promise.reject(error);
  }
);

export default api;
