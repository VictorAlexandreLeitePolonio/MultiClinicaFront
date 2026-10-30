import type { AxiosError } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleResponseError } from "./api";

const listeners: Array<() => void> = [];

function listenPlanRequired() {
  const listener = vi.fn();
  window.addEventListener("cliniq:plan-required", listener);
  listeners.push(() => window.removeEventListener("cliniq:plan-required", listener));
  return listener;
}

describe("api response interceptor", () => {
  afterEach(() => {
    listeners.splice(0).forEach((remove) => remove());
  });

  it("dispara o evento de plano exigido em respostas 402", async () => {
    const listener = listenPlanRequired();
    const error = {
      config: { url: "/api/billing/subscription/checkout" },
      response: {
        status: 402,
        data: {
          code: "PLAN_REQUIRED",
          feature: "OwnerCopilot",
          requiredPlan: "Pro",
          message: "Recurso do plano Pro.",
        },
      },
    } as AxiosError;

    await expect(handleResponseError(error)).rejects.toBe(error);

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toMatchObject({ code: "PLAN_REQUIRED", requiredPlan: "Pro" });
  });

  it("não dispara o evento em outros erros", async () => {
    const listener = listenPlanRequired();
    const error = {
      config: { url: "/api/pacientes" },
      response: { status: 500, data: {} },
    } as AxiosError;

    await expect(handleResponseError(error)).rejects.toBe(error);

    expect(listener).not.toHaveBeenCalled();
  });
});
