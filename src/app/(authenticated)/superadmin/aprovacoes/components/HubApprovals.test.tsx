import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { decideHubApproval, fetchHubApprovals } from "@/lib/plans";
import { HubApprovals } from "./HubApprovals";

vi.mock("@/lib/plans", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/plans")>();
  return { ...actual, fetchHubApprovals: vi.fn(), decideHubApproval: vi.fn() };
});

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function renderApprovals() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <HubApprovals />
    </QueryClientProvider>,
  );
}

const pending = [
  {
    clinicaId: 7,
    name: "Clínica Alfa",
    publicSlug: "clinica-alfa",
    city: "Itapetininga",
    updatedAt: "2026-10-30T12:00:00Z",
  },
];

describe("HubApprovals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchHubApprovals).mockResolvedValue(pending);
    vi.mocked(decideHubApproval).mockResolvedValue(undefined);
  });

  it("aprova o perfil pendente", async () => {
    const user = userEvent.setup();
    renderApprovals();

    expect(await screen.findByText("Clínica Alfa")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Aprovar" }));

    await waitFor(() => expect(decideHubApproval).toHaveBeenCalledWith(7, true));
  });

  it("só reprova depois de informar o motivo", async () => {
    const user = userEvent.setup();
    renderApprovals();

    await screen.findByText("Clínica Alfa");
    await user.click(screen.getByRole("button", { name: "Reprovar" }));

    const confirm = screen.getByRole("button", { name: "Confirmar reprovação" });
    expect(confirm).toBeDisabled();
    await user.click(confirm);
    expect(decideHubApproval).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Motivo da reprovação"), "Perfil incompleto");
    await user.click(confirm);

    await waitFor(() =>
      expect(decideHubApproval).toHaveBeenCalledWith(7, false, "Perfil incompleto"),
    );
  });
});
