import { beforeEach, describe, expect, it, vi } from "vitest";
import { decideHubApproval, fetchHubApprovals } from "./hub-approvals.service";

const get = vi.fn();
const post = vi.fn();

vi.mock("@/lib/api", () => ({
  default: {
    get: (...args: unknown[]) => get(...args),
    post: (...args: unknown[]) => post(...args),
  },
}));

describe("hub approvals service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the pending approvals", async () => {
    const pending = [
      {
        clinicaId: 7,
        name: "Clínica Alfa",
        publicSlug: "clinica-alfa",
        city: "Itapetininga",
        updatedAt: "2026-10-30T12:00:00Z",
      },
    ];
    get.mockResolvedValue({ data: pending });

    await expect(fetchHubApprovals()).resolves.toEqual(pending);
    expect(get).toHaveBeenCalledWith("/api/superadmin/hub-approvals");
  });

  it("approves a profile", async () => {
    post.mockResolvedValue({ data: undefined });

    await decideHubApproval(7, true);

    expect(post).toHaveBeenCalledWith("/api/superadmin/clinicas/7/hub-approval", {
      approved: true,
      reason: undefined,
    });
  });

  it("rejects a profile with a reason", async () => {
    post.mockResolvedValue({ data: undefined });

    await decideHubApproval(7, false, "Perfil incompleto");

    expect(post).toHaveBeenCalledWith("/api/superadmin/clinicas/7/hub-approval", {
      approved: false,
      reason: "Perfil incompleto",
    });
  });
});
