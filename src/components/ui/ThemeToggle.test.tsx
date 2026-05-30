import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./ThemeToggle";

const setTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "light",
    setTheme,
  }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    setTheme.mockClear();
  });

  it("switches from light to dark theme", async () => {
    const user = userEvent.setup();

    render(<ThemeToggle />);

    await user.click(await screen.findByRole("button", { name: "Ativar tema escuro" }));

    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});
