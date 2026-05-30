import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClinicCreateWizard } from "./ClinicCreateWizard";

describe("ClinicCreateWizard", () => {
  it("validates required clinic data before moving to the next step", async () => {
    const user = userEvent.setup();

    render(<ClinicCreateWizard onCancel={vi.fn()} onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Próximo" }));

    expect(await screen.findByText("Nome da clínica é obrigatório")).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome da clínica/i)).toBeInTheDocument();
  });

  it("submits with the first administrator required by the API", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ClinicCreateWizard onCancel={vi.fn()} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/Nome da clínica/i), "Clínica Centro");
    await user.click(screen.getByRole("button", { name: "Próximo" }));
    await user.click(screen.getByRole("button", { name: "Próximo" }));
    await user.click(screen.getByRole("button", { name: "Próximo" }));
    await user.type(screen.getByLabelText(/^Nome/i), "Admin Centro");
    await user.type(screen.getByLabelText(/E-mail/i), "admin@clinica.test");
    await user.type(screen.getByLabelText(/Senha/i), "123456");

    await user.click(screen.getByRole("button", { name: "Próximo" }));
    await user.click(screen.getByRole("button", { name: "Criar clínica" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Clínica Centro",
        createFirstAdmin: true,
        adminName: "Admin Centro",
        adminEmail: "admin@clinica.test",
      }),
      expect.anything()
    );
  });
});
