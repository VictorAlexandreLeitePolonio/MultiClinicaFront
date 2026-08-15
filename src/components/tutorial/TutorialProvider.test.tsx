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

const routerPush = vi.fn();
let mockSearchParamsString = "";
vi.mock("next/navigation", () => ({
  usePathname: () => "/app/agenda",
  useSearchParams: () => ({ toString: () => mockSearchParamsString }),
  useRouter: () => ({ push: routerPush }),
}));

let mockRole: "Administrador" | "Recepcao" = "Administrador";
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { role: mockRole },
    can: () => true,
  }),
}));

// driver.js's own highlight transition (animate:true, duration:200) only
// finalizes __activeElement after ~200ms of real time — irrelevant for a
// human clicking, but our synthetic click needs to wait for it too.
const waitForDriverTransition = () => new Promise((resolve) => setTimeout(resolve, 250));

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
    routerPush.mockReset();
    mockRole = "Administrador";
    mockSearchParamsString = "";
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
    await waitForDriverTransition();

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
    await waitForDriverTransition();

    const skipButton = await screen.findByText("Pular tutorial");
    await user.click(skipButton);

    expect(markTutorialCompleted).not.toHaveBeenCalled();
    expect(await screen.findByText("parado")).toBeInTheDocument();
  });

  it("navega até a página do tutorial quando iniciado de outra rota", async () => {
    const user = userEvent.setup();
    const otherRouteTutorial: ModuleTutorial = {
      ...oneStepTutorial,
      pathname: "/app/pacientes",
    };

    function OtherRouteConsumer() {
      const { startTutorial } = useTutorial();
      return <button onClick={() => startTutorial(otherRouteTutorial)}>Iniciar em outra rota</button>;
    }

    render(
      <TutorialProvider>
        <OtherRouteConsumer />
      </TutorialProvider>,
    );

    await user.click(screen.getByText("Iniciar em outra rota"));

    expect(routerPush).toHaveBeenCalledWith("/app/pacientes");
  });

  it("navega para a rota base quando a página atual tem query string (ex.: ?mode=create)", async () => {
    // regressão: iniciar o tour numa subview (criação/edição) da mesma
    // pathname da lista travava a página inteira — driver.js nunca achava
    // os alvos (que só existem na lista) e ficava tentando por steps × 3s
    // com a tela inteira sem pointer-events.
    mockSearchParamsString = "mode=create";
    const user = userEvent.setup();
    render(
      <TutorialProvider>
        <TestConsumer />
      </TutorialProvider>,
    );

    await user.click(screen.getByText("Iniciar"));

    expect(routerPush).toHaveBeenCalledWith("/app/agenda");
  });

  it("pula steps restritos por role para quem não tem a role exigida", async () => {
    mockRole = "Recepcao";
    const user = userEvent.setup();
    const gatedTutorial: ModuleTutorial = {
      id: "agenda",
      title: "Agenda",
      pathname: "/app/agenda",
      steps: [
        {
          id: "admin-only",
          target: '[data-tutorial="admin-only"]',
          title: "Só admin",
          description: "Não deveria aparecer para Recepcao.",
          roles: ["Administrador"],
        },
        {
          id: "list",
          target: '[data-tutorial="agenda-list"]',
          title: "Gerencie sua agenda",
          description: "Visível para todos.",
        },
      ],
    };

    function GatedConsumer() {
      const { startTutorial } = useTutorial();
      return (
        <div>
          <button onClick={() => startTutorial(gatedTutorial)}>Iniciar restrito</button>
          <div data-tutorial="admin-only">Só admin</div>
          <div data-tutorial="agenda-list">Lista</div>
        </div>
      );
    }

    render(
      <TutorialProvider>
        <GatedConsumer />
      </TutorialProvider>,
    );

    await user.click(screen.getByText("Iniciar restrito"));

    const title = await screen.findByText("Gerencie sua agenda");
    expect(title).toBeInTheDocument();
    expect(screen.queryByText("Só admin", { selector: ".driver-popover-title" })).not.toBeInTheDocument();
  });
});
