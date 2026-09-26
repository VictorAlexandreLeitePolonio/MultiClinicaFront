import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import AcceptInvitationPage from "./page";

const { accept } = vi.hoisted(() => ({ accept: vi.fn() }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams("token=one-use") }));
vi.mock("@/components/auth/AuthLayout", () => ({ AuthLayout: ({ children }: { children: ReactNode }) => children }));
vi.mock("@/app/(authenticated)/app/usuarios/services/users.service", () => ({ acceptUserInvitation: accept }));

test("mantém erro visível e permite tentar novamente antes de mostrar acesso ao login", async () => {
  accept.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(undefined);
  render(<AcceptInvitationPage />);
  fireEvent.change(screen.getByLabelText("Senha", { exact: true }), { target: { value: "secret123" } });
  fireEvent.change(screen.getByLabelText("Confirmar senha"), { target: { value: "secret123" } });
  fireEvent.click(screen.getByRole("button", { name: "Definir senha e aceitar convite" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível aceitar");
  expect(screen.queryByRole("link", { name: "Entrar no Cliniq" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Definir senha e aceitar convite" }));
  await waitFor(() => expect(screen.getByRole("link", { name: "Entrar no Cliniq" })).toHaveAttribute("href", "/login"));
  expect(accept).toHaveBeenLastCalledWith({ token: "one-use", password: "secret123" });
});
