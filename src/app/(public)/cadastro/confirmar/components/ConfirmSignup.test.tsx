import { StrictMode } from "react";
import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmSignup, resendSignupEmail } from "@/lib/plans";
import { ConfirmSignup } from "./ConfirmSignup";

const { searchParamsMock } = vi.hoisted(() => ({ searchParamsMock: vi.fn() }));

vi.mock("next/navigation", () => ({ useSearchParams: searchParamsMock }));
vi.mock("@/components/auth/AuthLayout", () => ({
  AuthLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/lib/plans", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/plans")>();
  return { ...actual, confirmSignup: vi.fn(), resendSignupEmail: vi.fn() };
});

describe("ConfirmSignup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    searchParamsMock.mockReturnValue(new URLSearchParams("token=one-use"));
  });

  it("confirma uma única vez e monta o login com o próximo destino do plano", async () => {
    vi.mocked(confirmSignup).mockResolvedValue({ email: "ana@clinica.test" });
    sessionStorage.setItem(
      "cliniq:signup-plan",
      JSON.stringify({ plan: "Premium", cycle: "Annual" }),
    );

    render(
      <StrictMode>
        <ConfirmSignup />
      </StrictMode>,
    );

    expect(await screen.findByText("E-mail confirmado")).toBeInTheDocument();
    expect(confirmSignup).toHaveBeenCalledTimes(1);

    const next = "/app/configuracoes/plano?assinar=Premium&ciclo=Annual";
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      `/login?email=${encodeURIComponent("ana@clinica.test")}&next=${encodeURIComponent(next)}`,
    );
  });

  it("mostra link inválido e permite reenviar o e-mail", async () => {
    vi.mocked(confirmSignup).mockRejectedValue({ response: { data: { code: "INVALID_TOKEN" } } });
    vi.mocked(resendSignupEmail).mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<ConfirmSignup />);

    expect(await screen.findByText("Link inválido ou expirado")).toBeInTheDocument();

    await user.type(screen.getByLabelText("E-mail"), "ana@clinica.test");
    await user.click(screen.getByRole("button", { name: "Reenviar e-mail" }));

    await waitFor(() => expect(resendSignupEmail).toHaveBeenCalledWith("ana@clinica.test"));
  });
});
