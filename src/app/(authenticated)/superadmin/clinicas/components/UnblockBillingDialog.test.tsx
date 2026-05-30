import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UnblockBillingDialog } from "./UnblockBillingDialog";

describe("UnblockBillingDialog", () => {
  it("requires a reason before submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <UnblockBillingDialog
        open
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    await user.click(screen.getByRole("button", { name: "Desbloquear" }));

    expect(await screen.findByText("Informe um motivo para desbloquear a cobrança")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits when the reason is valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <UnblockBillingDialog
        open
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    await user.type(screen.getByLabelText("Motivo"), "Acordo comercial aprovado");
    await user.click(screen.getByRole("button", { name: "Desbloquear" }));

    expect(onSubmit).toHaveBeenCalledWith(
      { reason: "Acordo comercial aprovado" },
      expect.anything()
    );
  });
});
