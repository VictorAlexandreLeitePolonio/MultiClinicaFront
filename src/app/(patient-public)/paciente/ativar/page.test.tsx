import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import type { ReactNode } from "react";
import ActivateAccountPage from "./page";

const { activate, setPatient, replace } = vi.hoisted(() => ({ activate: vi.fn(), setPatient: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }), useSearchParams: () => new URLSearchParams("token=invite") }));
vi.mock("../services/patient-auth.service", () => ({ activate }));
vi.mock("@/contexts/PatientAuthContext", () => ({ usePatientAuth: () => ({ setPatient }) }));
vi.mock("../components/PatientAuthShell", () => ({ PatientAuthShell: ({ children }: { children: ReactNode }) => children }));

test("aproveita a sessão da ativação e abre o portal sem repetir login", async () => {
  const session = { id: 1, name: "Ana", email: "ana@test.local", status: "Active" };
  activate.mockResolvedValue(session);
  render(<ActivateAccountPage />);
  await userEvent.type(screen.getByLabelText("Nova senha"), "secret123");
  await userEvent.type(screen.getByLabelText("Confirmar senha"), "secret123");
  await userEvent.click(screen.getByRole("button", { name: "Ativar conta" }));
  await waitFor(() => expect(setPatient).toHaveBeenCalledWith(session));
  expect(replace).toHaveBeenCalledWith("/paciente");
  expect(activate).toHaveBeenCalledWith({ token: "invite", password: "secret123" });
});
