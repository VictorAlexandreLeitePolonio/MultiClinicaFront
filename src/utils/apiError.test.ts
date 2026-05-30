import axios from "axios";
import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "./apiError";

function axiosError(status: number, data?: unknown) {
  return new axios.AxiosError(
    "Request failed",
    undefined,
    undefined,
    undefined,
    {
      status,
      statusText: "Error",
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
      data,
    }
  );
}

describe("getApiErrorMessage", () => {
  it("maps backend auth and billing error codes", () => {
    expect(
      getApiErrorMessage(axiosError(401, { errorCode: "USER_INACTIVE" }))
    ).toBe("Seu usuário está inativo. Entre em contato com o administrador.");
    expect(
      getApiErrorMessage(axiosError(403, { errorCode: "BILLING_BLOCKED" }))
    ).toBe("A clínica está bloqueada por pendência financeira.");
  });

  it("maps standard HTTP authorization and not found states", () => {
    expect(getApiErrorMessage(axiosError(401))).toBe(
      "Sua sessão expirou. Faça login novamente."
    );
    expect(getApiErrorMessage(axiosError(403))).toBe(
      "Você não tem permissão para executar esta ação."
    );
    expect(getApiErrorMessage(axiosError(404))).toBe("Registro não encontrado.");
  });
});
