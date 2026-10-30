import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setClinicPlan } from "@/lib/plans";
import { ClinicPlanForm } from "./ClinicPlanForm";

vi.mock("@/lib/plans", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/plans")>();
  return { ...actual, setClinicPlan: vi.fn() };
});

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ClinicPlanForm clinicId={5} plan="Free" isFounder={false} />
    </QueryClientProvider>,
  );
}

describe("ClinicPlanForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(setClinicPlan).mockResolvedValue(undefined);
  });

  it("salva o plano e o selo de fundadora", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.selectOptions(screen.getByLabelText("Plano"), "Pro");
    await user.click(screen.getByLabelText("Fundadora"));
    await user.click(screen.getByRole("button", { name: "Salvar plano" }));

    await waitFor(() => expect(setClinicPlan).toHaveBeenCalledWith(5, "Pro", true));
  });
});
