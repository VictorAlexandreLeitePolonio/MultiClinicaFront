import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";
import type { AuthTenant, User } from "@/types";

const mockedUser: User = {
  id: 1,
  name: "Usuário",
  email: "usuario@multi.test",
  role: "Administrador",
  clinicName: "Clínica Centro",
};

const mockedTenant: AuthTenant = {
  id: 1,
  name: "clinica-centro",
  displayName: "Clínica Centro",
  logoUrl: null,
  primaryColor: "#123456",
  secondaryColor: "#654321",
  accentColor: "#abcdef",
  contactEmail: null,
  contactPhone: null,
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mockedUser,
    tenant: mockedTenant,
    setUser: vi.fn(),
    can: () => true,
  }),
}));

vi.mock("@/app/(public)/login/services/auth.service", () => ({
  logout: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/app/agenda",
  useSearchParams: () => ({ toString: () => "" }),
}));

describe("AppShell", () => {
  it("renders children, the mascot assistant and applies the tenant theme", () => {
    render(
      <AppShell>
        <p>Conteúdo da página</p>
      </AppShell>,
    );

    expect(screen.getByText("Conteúdo da página")).toBeInTheDocument();
    expect(screen.getByLabelText("Assistente virtual")).toBeInTheDocument();

    const shellRoot = screen.getByText("Conteúdo da página").closest("[style]");
    expect(shellRoot).toHaveStyle({ "--tenant-primary-color": "#123456" });
  });
});
