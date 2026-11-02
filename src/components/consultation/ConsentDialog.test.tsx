import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { ConsentDialog } from "./ConsentDialog";

test("só habilita o confirmar depois de marcar o consentimento", async () => {
  const onConfirm = vi.fn();
  render(
    <ConsentDialog open onCancel={vi.fn()} onConfirm={onConfirm} />,
  );

  const confirmar = screen.getByRole("button", { name: "Confirmar" });
  expect(confirmar).toBeDisabled();
  expect(onConfirm).not.toHaveBeenCalled();

  await userEvent.click(
    screen.getByRole("checkbox", {
      name: "O paciente autorizou a gravação desta consulta",
    }),
  );

  expect(confirmar).toBeEnabled();
  await userEvent.click(confirmar);
  expect(onConfirm).toHaveBeenCalledTimes(1);
});

test("cancelar sem consentimento não inicia a consulta", async () => {
  const onCancel = vi.fn();
  const onConfirm = vi.fn();
  render(<ConsentDialog open onCancel={onCancel} onConfirm={onConfirm} />);

  await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(onConfirm).not.toHaveBeenCalled();
});
