import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MotivoDialog } from "./MotivoDialog";

describe("MotivoDialog", () => {
  it("does not render when closed", () => {
    render(
      <MotivoDialog
        open={false}
        title="Cancelar conta"
        description="Tem certeza?"
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.queryByText("Cancelar conta")).not.toBeInTheDocument();
  });

  it("disables confirm until a motivo is typed", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <MotivoDialog
        open
        title="Cancelar conta"
        description="Tem certeza?"
        onCancel={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    const confirmButton = screen.getByRole("button", { name: /confirmar/i });
    expect(confirmButton).toBeDisabled();

    await user.type(screen.getByLabelText(/motivo/i), "Lançamento duplicado");
    expect(confirmButton).not.toBeDisabled();

    await user.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledWith("Lançamento duplicado");
  });

  it("calls onCancel when the cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <MotivoDialog
        open
        title="Cancelar conta"
        description="Tem certeza?"
        onCancel={onCancel}
        onConfirm={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
