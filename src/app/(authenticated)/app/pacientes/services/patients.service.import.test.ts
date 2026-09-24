import { beforeEach, describe, expect, it, vi } from "vitest";

const { post } = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    post,
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("patients service import", () => {
  beforeEach(() => {
    post.mockReset();
    post.mockResolvedValue({ data: { importedCount: 1 } });
  });

  it("sends the original file as multipart with the idempotency key", async () => {
    const service = await import("./patients.service");
    const importPatients = Reflect.get(service, "importPatients") as
      | ((file: File, idempotencyKey: string) => Promise<unknown>)
      | undefined;
    expect(importPatients).toBeTypeOf("function");
    if (!importPatients) return;

    const file = new File(["Name\nMaria"], "patients.csv", { type: "text/csv" });
    await importPatients(file, "attempt-1");

    expect(post).toHaveBeenCalledWith(
      "/api/patients/import",
      expect.any(FormData),
      { headers: { "Idempotency-Key": "attempt-1" } },
    );
    const formData = post.mock.calls[0]?.[1] as FormData | undefined;
    expect(formData?.get("file")).toBe(file);
  });
});
