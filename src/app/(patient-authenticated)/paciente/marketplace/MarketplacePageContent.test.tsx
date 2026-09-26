import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MarketplacePageContent } from "./MarketplacePageContent";

const { useClinics } = vi.hoisted(() => ({ useClinics: vi.fn() }));

vi.mock("./hooks/useMarketplace", () => ({
  useMarketplaceCategories: () => ({
    data: [
      { id: 1, name: "Psicologia", slug: "psicologia" },
      { id: 2, name: "Fisioterapia", slug: "fisioterapia" },
    ],
  }),
  useMarketplaceClinics: useClinics,
}));
vi.mock("@/components/clinic/ClinicDetailModal", () => ({ ClinicDetailModal: () => null }));
vi.mock("./components/MarketplaceClinicCard", () => ({ MarketplaceClinicCard: () => null }));

afterEach(() => vi.useRealTimers());

describe("Marketplace filters", () => {
  it("applies text after 500ms, preserves accents and punctuation, and keeps category selection", () => {
    vi.useFakeTimers();
    useClinics.mockReturnValue({ data: { data: [], totalCount: 0 }, isLoading: false, isError: false });
    const { unmount } = render(<MarketplacePageContent />);
    const city = screen.getByRole("textbox", { name: "Cidade" });

    fireEvent.change(city, { target: { value: "São" } });
    act(() => vi.advanceTimersByTime(300));
    fireEvent.change(city, { target: { value: "São João d'Aliança" } });
    fireEvent.change(screen.getByRole("textbox", { name: "UF" }), { target: { value: "go" } });
    expect(city).toHaveValue("São João d'Aliança");
    expect(screen.getByRole("textbox", { name: "UF" })).toHaveValue("GO");
    act(() => vi.advanceTimersByTime(499));
    expect(useClinics.mock.lastCall?.[0].city).toBeUndefined();
    act(() => vi.advanceTimersByTime(1));
    expect(useClinics.mock.lastCall?.[0]).toMatchObject({ city: "São João d'Aliança", state: "GO", page: 1 });

    fireEvent.click(screen.getByRole("button", { name: "Todas as categorias" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Psicologia" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Buscar categoria" }), { target: { value: "fisio" } });
    expect(screen.queryByRole("checkbox", { name: "Psicologia" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Fisioterapia" }));
    expect(useClinics.mock.lastCall?.[0].categoryIds).toEqual([1, 2]);
    fireEvent.change(screen.getByRole("searchbox", { name: "Buscar categoria" }), { target: { value: "inexistente" } });
    expect(screen.getByRole("status")).toHaveTextContent("Nenhuma categoria encontrada");
    fireEvent.click(screen.getByRole("button", { name: "Limpar seleção" }));
    expect(useClinics.mock.lastCall?.[0].categoryIds).toEqual([]);

    fireEvent.change(city, { target: { value: "" } });
    act(() => vi.advanceTimersByTime(500));
    expect(useClinics.mock.lastCall?.[0].city).toBeUndefined();
    fireEvent.change(city, { target: { value: "Pendente" } });
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
