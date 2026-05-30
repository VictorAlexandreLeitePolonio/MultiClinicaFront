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

  it("allows skipping first administrator with an explicit warning", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ClinicCreateWizard onCancel={vi.fn()} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/Nome da clínica/i), "Clínica Centro");
    await user.click(screen.getByRole("button", { name: "Próximo" }));
    await user.click(screen.getByRole("button", { name: "Próximo" }));
    await user.click(screen.getByRole("button", { name: "Próximo" }));
    await user.click(screen.getByLabelText(/Criar primeiro administrador/i));

    expect(screen.getByText(/A clínica será criada sem usuário administrador/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Próximo" }));
    await user.click(screen.getByRole("button", { name: "Criar clínica" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Clínica Centro",
        createFirstAdmin: false,
      }),
      expect.anything()
    );
  });
});
