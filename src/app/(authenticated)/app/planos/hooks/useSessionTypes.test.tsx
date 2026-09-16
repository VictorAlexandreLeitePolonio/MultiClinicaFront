import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSessionTypes } from "./useSessionTypes";

const getSessionTypes = vi.fn().mockResolvedValue([]);
let tenantId = 2;

vi.mock("../services/session-types.service", () => ({
  getSessionTypes: (...args: unknown[]) => getSessionTypes(...args),
  createSessionType: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ tenant: { id: tenantId } }),
}));

describe("useSessionTypes", () => {
  it("separa o cache por clínica", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { rerender } = renderHook(() => useSessionTypes(""), { wrapper });
    await waitFor(() => expect(getSessionTypes).toHaveBeenCalledTimes(1));

    tenantId = 3;
    rerender();

    await waitFor(() => expect(getSessionTypes).toHaveBeenCalledTimes(2));
  });
});
