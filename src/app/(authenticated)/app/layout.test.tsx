import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "@/types";
import ClinicAppLayout from "./layout";

const replace = vi.fn();
let mockedUser: User | null = null;

vi.mock("next/navigation", () => ({
  usePathname: () => "/app",
  useRouter: () => ({ replace }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: mockedUser }),
}));

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

describe("ClinicAppLayout", () => {
  beforeEach(() => {
    replace.mockReset();
    mockedUser = {
      id: 1,
      name: "Recepção",
      email: "recepcao@multi.test",
      role: "Recepcao",
      clinicName: "Clínica Centro",
    };
  });

  it("renders the clinic shell for clinic users", () => {
    render(
      <ClinicAppLayout>
        <span>Conteúdo clinic</span>
      </ClinicAppLayout>
    );

    expect(screen.getByTestId("app-shell")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo clinic")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects SuperAdmin away from the clinic app", async () => {
    mockedUser = {
      id: 2,
      name: "Global",
      email: "global@multi.test",
      role: "SuperAdmin",
    };

    render(
      <ClinicAppLayout>
        <span>Conteúdo clinic</span>
      </ClinicAppLayout>
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/access-denied"));
    expect(screen.queryByText("Conteúdo clinic")).not.toBeInTheDocument();
  });
});
