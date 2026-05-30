import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateClinicUserDialog } from "./CreateClinicUserDialog";

describe("CreateClinicUserDialog", () => {
  it("validates required user fields before submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<CreateClinicUserDialog open onClose={vi.fn()} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Criar usuário" }));

    expect(await screen.findByText("Informe o nome")).toBeInTheDocument();
    expect(screen.getByText("Informe um e-mail válido")).toBeInTheDocument();
    expect(screen.getByText("Senha deve ter pelo menos 6 caracteres")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits a valid clinic user payload", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<CreateClinicUserDialog open onClose={vi.fn()} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Nome"), "Maria Silva");
    await user.type(screen.getByLabelText("E-mail"), "maria@clinica.com");
    await user.type(screen.getByLabelText("Senha"), "123456");
    await user.selectOptions(screen.getByLabelText("Perfil"), "Profissional");
    await user.click(screen.getByRole("button", { name: "Criar usuário" }));

    expect(onSubmit).toHaveBeenCalledWith(
      {
        name: "Maria Silva",
        email: "maria@clinica.com",
        password: "123456",
        role: "Profissional",
      },
      expect.anything()
    );
  });
});
