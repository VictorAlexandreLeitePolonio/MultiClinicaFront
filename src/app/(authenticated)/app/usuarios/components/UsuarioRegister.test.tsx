import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import UsuarioRegister from "./UsuarioRegister";

const { insertUsuario, warning } = vi.hoisted(() => ({ insertUsuario: vi.fn(), warning: vi.fn() }));
vi.mock("../hooks/insert", () => ({ useUsuarioInsert: () => ({ insertUsuario, isPending: false }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), warning } }));

test("convida sem solicitar senha e informa como recuperar falha no envio", async () => {
  insertUsuario.mockResolvedValue({ userId: 7, emailSent: false });
  const onSave = vi.fn();
  render(<UsuarioRegister onBack={vi.fn()} onSave={onSave} />);
  expect(screen.queryByLabelText(/Senha/)).not.toBeInTheDocument();
  await userEvent.type(screen.getByLabelText("Nome *"), "Ana");
  await userEvent.type(screen.getByLabelText("E-mail *"), "ana@test.local");
  await userEvent.click(screen.getByRole("button", { name: "Enviar convite" }));
  await waitFor(() => expect(insertUsuario).toHaveBeenCalledWith({ name: "Ana", email: "ana@test.local", role: "Profissional" }));
  expect(warning).toHaveBeenCalledWith(expect.stringContaining("Reenviar convite"));
  expect(onSave).toHaveBeenCalled();
});
