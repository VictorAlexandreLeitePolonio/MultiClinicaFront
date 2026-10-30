import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmSignup, resendSignupEmail, signup } from "./signup.service";

const post = vi.fn();

vi.mock("@/lib/publicApi", () => ({
  default: { post: (...args: unknown[]) => post(...args) },
}));

describe("signup service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates the account", async () => {
    post.mockResolvedValue({ data: undefined });
    const payload = {
      clinicName: "Clínica Vida",
      ownerName: "Ana Souza",
      email: "ana@clinica.test",
      phone: "11999999999",
      password: "secret123",
    };

    await signup(payload);

    expect(post).toHaveBeenCalledWith("/api/public/signup", payload);
  });

  it("resends the confirmation e-mail", async () => {
    post.mockResolvedValue({ data: undefined });

    await resendSignupEmail("ana@clinica.test");

    expect(post).toHaveBeenCalledWith("/api/public/signup/resend", {
      email: "ana@clinica.test",
    });
  });

  it("confirms the signup token", async () => {
    post.mockResolvedValue({ data: { email: "ana@clinica.test" } });

    await expect(confirmSignup("one-use")).resolves.toEqual({ email: "ana@clinica.test" });
    expect(post).toHaveBeenCalledWith("/api/public/signup/confirm", { token: "one-use" });
  });
});
