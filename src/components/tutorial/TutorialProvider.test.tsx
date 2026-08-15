import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TutorialProvider } from "./TutorialProvider";
import { useTutorial } from "@/hooks/tutorial/useTutorial";
import type { ModuleTutorial, TaskTutorial } from "@/lib/tutorials/tutorial.types";

const markTutorialCompleted = vi.fn();
const markTaskCompleted = vi.fn();
vi.mock("@/lib/tutorials/tutorial.storage", () => ({
  markTutorialCompleted: (...args: unknown[]) => markTutorialCompleted(...args),
  markTaskCompleted: (...args: unknown[]) => markTaskCompleted(...args),
}));

const routerPush = vi.fn();
let mockPathname = "/app/agenda";
let mockSearchParamsString = "";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(mockSearchParamsString),
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
    markTaskCompleted.mockReset();
    routerPush.mockReset();
    mockRole = "Administrador";
    mockPathname = "/app/agenda";
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

  const targetClickTask: TaskTutorial = {
    id: "create-thing",
    moduleId: "agenda",
    title: "Criar coisa",
    pathname: "/app/agenda",
    steps: [
      {
        id: "start",
        target: '[data-tutorial="click-me"]',
        title: "Clique aqui",
        description: "Primeiro passo.",
        advanceOn: "target-click",
      },
      {
        id: "next",
        target: '[data-tutorial="agenda-list"]',
        title: "Segundo passo",
        description: "Chegou.",
      },
    ],
  };

  function TargetClickConsumer() {
    const { startTutorial } = useTutorial();
    return (
      <div>
        <button onClick={() => startTutorial(targetClickTask)}>Iniciar target-click</button>
        <button data-tutorial="click-me">Botão real</button>
        <div data-tutorial="agenda-list">Lista</div>
      </div>
    );
  }

  it("target-click avança ao clicar no elemento real destacado, sem botão Próximo", async () => {
    const user = userEvent.setup();
    render(
      <TutorialProvider>
        <TargetClickConsumer />
      </TutorialProvider>,
    );

    await user.click(screen.getByText("Iniciar target-click"));
    await screen.findByText("Clique aqui");
    expect(document.querySelector(".driver-popover-next-btn")).not.toBeVisible();
    await waitForDriverTransition();

    await user.click(screen.getByText("Botão real"));

    expect(await screen.findByText("Segundo passo")).toBeInTheDocument();
  });

  it("clique fora do elemento destacado não avança o step", async () => {
    const user = userEvent.setup();
    render(
      <TutorialProvider>
        <TargetClickConsumer />
      </TutorialProvider>,
    );

    await user.click(screen.getByText("Iniciar target-click"));
    await screen.findByText("Clique aqui");

    // driver.js bloqueia pointer-events em tudo fora do elemento ativo, então
    // clicar em outro alvo (a lista) não deveria conseguir nem alcançá-lo —
    // o step permanece o mesmo de qualquer forma.
    expect(screen.getByText("Clique aqui")).toBeInTheDocument();
    expect(screen.queryByText("Segundo passo")).not.toBeInTheDocument();
  });

  it("completeTaskTutorial marca a task concluída e fecha o tour", async () => {
    const user = userEvent.setup();

    function CompleterConsumer() {
      const { isRunning, startTutorial, completeTaskTutorial } = useTutorial();
      return (
        <div>
          <span>{isRunning ? "rodando" : "parado"}</span>
          <button onClick={() => startTutorial(targetClickTask)}>Iniciar</button>
          <button onClick={() => completeTaskTutorial("agenda", "create-thing")}>
            Simular sucesso real
          </button>
          <div data-tutorial="click-me">Botão real</div>
          <div data-tutorial="agenda-list">Lista</div>
        </div>
      );
    }

    render(
      <TutorialProvider>
        <CompleterConsumer />
      </TutorialProvider>,
    );

    await user.click(screen.getByText("Iniciar"));
    await screen.findByText("rodando");
    await waitForDriverTransition();

    await user.click(screen.getByText("Simular sucesso real"));

    expect(markTaskCompleted).toHaveBeenCalledWith("agenda", "create-thing");
    expect(await screen.findByText("parado")).toBeInTheDocument();
  });

  it('em uma task, clicar em "Concluir" fecha o tour sem marcar completed sozinho', async () => {
    const user = userEvent.setup();
    const manualTask: TaskTutorial = {
      id: "manual-task",
      moduleId: "agenda",
      title: "Task manual",
      pathname: "/app/agenda",
      steps: [
        {
          id: "list",
          target: '[data-tutorial="agenda-list"]',
          title: "Gerencie sua agenda",
          description: "Passo único.",
        },
      ],
    };

    function ManualTaskConsumer() {
      const { startTutorial } = useTutorial();
      return (
        <div>
          <button onClick={() => startTutorial(manualTask)}>Iniciar</button>
          <div data-tutorial="agenda-list">Lista</div>
        </div>
      );
    }

    render(
      <TutorialProvider>
        <ManualTaskConsumer />
      </TutorialProvider>,
    );

    await user.click(screen.getByText("Iniciar"));
    await screen.findByText("Gerencie sua agenda");
    await waitForDriverTransition();

    const doneButton = document.querySelector<HTMLButtonElement>(".driver-popover-next-btn");
    expect(doneButton?.textContent).toBe("Concluir");
    await user.click(doneButton!);

    expect(markTaskCompleted).not.toHaveBeenCalled();
    expect(markTutorialCompleted).not.toHaveBeenCalled();
  });

  it("route-change avança quando pathname passa a bater com expectedPathname", async () => {
    const user = userEvent.setup();
    const routeChangeTask: TaskTutorial = {
      id: "cross-nav",
      moduleId: "agenda",
      title: "Navegação",
      pathname: "/app/agenda",
      steps: [
        {
          id: "start",
          target: '[data-tutorial="agenda-list"]',
          title: "Aguardando navegação",
          description: "Primeiro passo.",
          advanceOn: "route-change",
          expectedPathname: "/app/pacientes",
        },
        {
          id: "arrived",
          target: '[data-tutorial="patients-marker"]',
          title: "Chegou em pacientes",
          description: "Segundo passo.",
        },
      ],
    };

    function RouteChangeConsumer() {
      const { startTutorial } = useTutorial();
      return (
        <div>
          <button onClick={() => startTutorial(routeChangeTask)}>Iniciar</button>
          <div data-tutorial="agenda-list">Lista</div>
          <div data-tutorial="patients-marker">Pacientes</div>
        </div>
      );
    }

    const { rerender } = render(
      <TutorialProvider>
        <RouteChangeConsumer />
      </TutorialProvider>,
    );

    await user.click(screen.getByText("Iniciar"));
    await screen.findByText("Aguardando navegação");
    expect(document.querySelector(".driver-popover-next-btn")).not.toBeVisible();

    mockPathname = "/app/pacientes";
    rerender(
      <TutorialProvider>
        <RouteChangeConsumer />
      </TutorialProvider>,
    );

    expect(await screen.findByText("Chegou em pacientes")).toBeInTheDocument();
  });
});
