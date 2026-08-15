import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MascotAssistant } from "./MascotAssistant";
import { TutorialProvider } from "@/components/tutorial/TutorialProvider";

let mockPathname = "/app/agenda";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

let reducedMotionValue = false;
vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return { ...actual, useReducedMotion: () => reducedMotionValue };
});

const hasSeenTutorialInvite = vi.fn();
const isTutorialCompleted = vi.fn();
const markTutorialInviteSeen = vi.fn();
const markTutorialCompleted = vi.fn();
vi.mock("@/lib/tutorials/tutorial.storage", () => ({
  hasSeenTutorialInvite: (...args: unknown[]) => hasSeenTutorialInvite(...args),
  isTutorialCompleted: (...args: unknown[]) => isTutorialCompleted(...args),
  markTutorialInviteSeen: (...args: unknown[]) => markTutorialInviteSeen(...args),
  markTutorialCompleted: (...args: unknown[]) => markTutorialCompleted(...args),
}));

function renderAssistant() {
  return render(
    <TutorialProvider>
      <MascotAssistant />
    </TutorialProvider>,
  );
}

describe("MascotAssistant", () => {
  beforeEach(() => {
    mockPathname = "/app/agenda";
    reducedMotionValue = false;
    hasSeenTutorialInvite.mockReset().mockReturnValue(false);
    isTutorialCompleted.mockReset().mockReturnValue(false);
    markTutorialInviteSeen.mockReset();
    markTutorialCompleted.mockReset();
  });

  it("primeiro acesso mostra o convite e marca invitesSeen", async () => {
    renderAssistant();

    await waitFor(() => expect(screen.getByText("Quer conhecer a Agenda?")).toBeInTheDocument(), {
      timeout: 1500,
    });
    expect(markTutorialInviteSeen).toHaveBeenCalledWith("agenda");
  });

  it('"Agora não" fecha o convite sem iniciar o tour', async () => {
    const user = userEvent.setup();
    renderAssistant();

    await screen.findByText("Quer conhecer a Agenda?", undefined, { timeout: 1500 });
    await user.click(screen.getByText("Agora não"));

    await waitFor(() =>
      expect(screen.queryByText("Quer conhecer a Agenda?")).not.toBeInTheDocument(),
    );
  });

  it("convite já visto não reaparece, mas o menu contextual continua disponível", async () => {
    hasSeenTutorialInvite.mockReturnValue(true);
    const user = userEvent.setup();
    renderAssistant();

    await new Promise((resolve) => setTimeout(resolve, 800));
    expect(screen.queryByText("Quer conhecer a Agenda?")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("Assistente virtual"));
    await waitFor(() => expect(screen.getByText("Conhecer Agenda")).toBeInTheDocument(), {
      timeout: 1000,
    });
  });

  it("tutorial concluído mostra opção Rever no menu", async () => {
    hasSeenTutorialInvite.mockReturnValue(true);
    isTutorialCompleted.mockReturnValue(true);
    const user = userEvent.setup();
    renderAssistant();

    await user.click(screen.getByLabelText("Assistente virtual"));
    await waitFor(
      () => expect(screen.getByText("Rever tutorial da Agenda")).toBeInTheDocument(),
      { timeout: 1000 },
    );
  });

  it("rota sem tutorial mantém o mascote disponível sem oferta contextual", async () => {
    mockPathname = "/app/pacientes";
    const user = userEvent.setup();
    renderAssistant();

    await user.click(screen.getByLabelText("Assistente virtual"));
    await waitFor(() => expect(screen.getByText("Ver todos os tutoriais")).toBeInTheDocument(), {
      timeout: 1000,
    });
    expect(screen.queryByText(/Conhecer/)).not.toBeInTheDocument();
  });

  it("reduced motion abre o menu imediatamente, sem esperar o mortal", async () => {
    hasSeenTutorialInvite.mockReturnValue(true);
    reducedMotionValue = true;
    const user = userEvent.setup();
    renderAssistant();

    await user.click(screen.getByLabelText("Assistente virtual"));
    expect(await screen.findByText("Conhecer Agenda")).toBeInTheDocument();
  });
});
