import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "@/types";
import SuperAdminLayout from "./layout";

const replace = vi.fn();
let mockedUser: User | null = null;

vi.mock("next/navigation", () => ({
  usePathname: () => "/superadmin",
  useRouter: () => ({ replace }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: mockedUser }),
}));

vi.mock("@/components/layout/SuperAdminShell", () => ({
  SuperAdminShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="superadmin-shell">{children}</div>
  ),
}));

describe("SuperAdminLayout", () => {
  beforeEach(() => {
    replace.mockReset();
    mockedUser = {
      id: 1,
      name: "Global",
      email: "global@multi.test",
      role: "SuperAdmin",
    };
  });

  it("renders the SuperAdmin shell for SuperAdmin users", () => {
    render(
      <SuperAdminLayout>
        <span>Conteúdo global</span>
      </SuperAdminLayout>
    );

    expect(screen.getByTestId("superadmin-shell")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo global")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects clinic users away from SuperAdmin routes", async () => {
    mockedUser = {
      id: 2,
      name: "Gestor Clínica",
      email: "admin@multi.test",
      role: "Administrador",
      clinicName: "Clínica Centro",
    };

    render(
      <SuperAdminLayout>
        <span>Conteúdo global</span>
      </SuperAdminLayout>
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/access-denied"));
    expect(screen.queryByText("Conteúdo global")).not.toBeInTheDocument();
  });
});
