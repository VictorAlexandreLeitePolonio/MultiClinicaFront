import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TutorialProvider } from "./TutorialProvider";
import { useTutorial } from "@/hooks/tutorial/useTutorial";
import type { ModuleTutorial } from "@/lib/tutorials/tutorial.types";

const markTutorialCompleted = vi.fn();
vi.mock("@/lib/tutorials/tutorial.storage", () => ({
  markTutorialCompleted: (...args: unknown[]) => markTutorialCompleted(...args),
}));

const oneStepTutorial: ModuleTutorial = {
  id: "agenda",
  title: "Agenda",
  pathname: "/app/agenda",
  steps: [
    {
      id: "list",
      target: '[data-tutorial="agenda-list"]',
      title: "Gerencie sua agenda",
      description: "Descrição do passo.",
      placement: "top",
    },
  ],
};

function TestConsumer() {
  const { isRunning, startTutorial } = useTutorial();
  return (
    <div>
      <span>{isRunning ? "rodando" : "parado"}</span>
      <button onClick={() => startTutorial(oneStepTutorial)}>Iniciar</button>
      <div data-tutorial="agenda-list">Lista</div>
    </div>
  );
}

describe("TutorialProvider", () => {
  beforeEach(() => {
    markTutorialCompleted.mockReset();
    document.body.innerHTML = "";
  });

  it("startTutorial ativa o driver e concluir grava completed", async () => {
    const user = userEvent.setup();
    render(
      <TutorialProvider>
        <TestConsumer />
      </TutorialProvider>,
    );

    await user.click(screen.getByText("Iniciar"));
    expect(await screen.findByText("rodando")).toBeInTheDocument();

    const doneButton = document.querySelector<HTMLButtonElement>(".driver-popover-next-btn");
    expect(doneButton?.textContent).toBe("Concluir");
    await user.click(doneButton!);

    expect(markTutorialCompleted).toHaveBeenCalledWith("agenda");
    expect(await screen.findByText("parado")).toBeInTheDocument();
  });

  it("pular tutorial fecha sem marcar completed", async () => {
    const user = userEvent.setup();
    render(
      <TutorialProvider>
        <TestConsumer />
      </TutorialProvider>,
    );

    await user.click(screen.getByText("Iniciar"));
    await screen.findByText("rodando");

    const skipButton = await screen.findByText("Pular tutorial");
    await user.click(skipButton);

    expect(markTutorialCompleted).not.toHaveBeenCalled();
    expect(await screen.findByText("parado")).toBeInTheDocument();
  });
});
