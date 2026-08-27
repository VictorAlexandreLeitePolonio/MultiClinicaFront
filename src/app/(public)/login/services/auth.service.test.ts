import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser, login, logout } from "./auth.service";

const get = vi.fn();
const post = vi.fn();

vi.mock("@/lib/api", () => ({
  default: {
    get: (...args: unknown[]) => get(...args),
    post: (...args: unknown[]) => post(...args),
  },
}));

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user, tenant and permissions from login", async () => {
    const auth = {
      user: { id: 1, name: "Ana", email: "ana@test.com", role: "Administrador" },
      tenant: {
        id: 3,
        name: "Clínica Centro Ltda.",
        displayName: "Clínica Centro",
        logoUrl: null,
        primaryColor: "#2563EB",
        secondaryColor: null,
        accentColor: null,
        contactEmail: null,
        contactPhone: null,
      },
      permissions: ["clinic.settings.view"],
    };
    post.mockResolvedValue({ data: auth });

    await expect(login({ email: "ana@test.com", password: "secret" })).resolves.toEqual(auth);
    expect(post).toHaveBeenCalledWith("/api/auth/login", {
      email: "ana@test.com",
      password: "secret",
    });
  });

  it("restores a SuperAdmin session with a null tenant", async () => {
    const auth = {
      user: { id: 2, name: "Global", email: "global@test.com", role: "SuperAdmin" },
      tenant: null,
      permissions: [],
    };
    get.mockResolvedValue({ data: auth });

    await expect(getCurrentUser()).resolves.toEqual(auth);
    expect(get).toHaveBeenCalledWith("/api/auth/me");
  });

  it("logs out through the backend cookie endpoint", async () => {
    post.mockResolvedValue({ data: { message: "Sessão encerrada." } });

    await expect(logout()).resolves.toBeUndefined();

    expect(post).toHaveBeenCalledWith("/api/auth/logout");
  });
});
