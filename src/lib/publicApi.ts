import axios from "axios";

/**
 * Cliente HTTP para rotas públicas (anônimas), sem cookies nem o interceptor
 * de 401 do backoffice/portal. Usado pelo perfil público da clínica.
 */
const publicApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5045",
});

export default publicApi;
