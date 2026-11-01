import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { ConsultationMiniPlayer } from "./ConsultationMiniPlayer";

const active = { patientName: "Ana Souza" };

test("mostra paciente, cronômetro e status gravando com aria-live", () => {
  render(
    <ConsultationMiniPlayer
      active={active}
      paused={false}
      elapsedSeconds={65}
      sending={false}
      onPause={vi.fn()}
      onResume={vi.fn()}
      onFinish={vi.fn()}
    />,
  );

  expect(screen.getByText("Ana Souza")).toBeInTheDocument();
  expect(screen.getByText("01:05")).toBeInTheDocument();
  const status = screen.getByText("Gravando");
  expect(status).toHaveAttribute("aria-live", "polite");
});

test("formata horas quando a consulta passa de uma hora", () => {
  render(
    <ConsultationMiniPlayer
      active={active}
      paused={false}
      elapsedSeconds={3_661}
      sending={false}
      onPause={vi.fn()}
      onResume={vi.fn()}
      onFinish={vi.fn()}
    />,
  );

  expect(screen.getByText("1:01:01")).toBeInTheDocument();
});

test("pausa, retoma e encerra", async () => {
  const onPause = vi.fn();
  const onResume = vi.fn();
  const onFinish = vi.fn();

  const { rerender } = render(
    <ConsultationMiniPlayer
      active={active}
      paused={false}
      elapsedSeconds={5}
      sending={false}
      onPause={onPause}
      onResume={onResume}
      onFinish={onFinish}
    />,
  );

  await userEvent.click(screen.getByRole("button", { name: "Pausar" }));
  expect(onPause).toHaveBeenCalledTimes(1);

  rerender(
    <ConsultationMiniPlayer
      active={active}
      paused
      elapsedSeconds={5}
      sending={false}
      onPause={onPause}
      onResume={onResume}
      onFinish={onFinish}
    />,
  );

  expect(screen.getByText("Pausado")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Retomar" }));
  expect(onResume).toHaveBeenCalledTimes(1);

  await userEvent.click(screen.getByRole("button", { name: "Encerrar" }));
  expect(onFinish).toHaveBeenCalledTimes(1);
});

test("mostra o envio do áudio e desabilita as ações", () => {
  render(
    <ConsultationMiniPlayer
      active={active}
      paused={false}
      elapsedSeconds={10}
      sending
      onPause={vi.fn()}
      onResume={vi.fn()}
      onFinish={vi.fn()}
    />,
  );

  expect(screen.getByText("Enviando áudio…")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Pausar" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Encerrar" })).toBeDisabled();
});

test("não renderiza sem consulta ativa", () => {
  const { container } = render(
    <ConsultationMiniPlayer
      active={null}
      paused={false}
      elapsedSeconds={0}
      sending={false}
      onPause={vi.fn()}
      onResume={vi.fn()}
      onFinish={vi.fn()}
    />,
  );

  expect(container).toBeEmptyDOMElement();
});
