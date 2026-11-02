import { fireEvent, render, screen } from "@testing-library/react";
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

  it("switches from light to dark theme without a blocking status overlay", async () => {
    const user = userEvent.setup();

    render(<ThemeToggle />);

    const toggle = await screen.findByRole("button", { name: "Ativar tema escuro" });

    expect(toggle).not.toBeDisabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await user.click(toggle);

    expect(setTheme).toHaveBeenCalledWith("dark");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("changes the theme immediately when the View Transitions API is unavailable", () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: "Ativar tema escuro" }));

    expect(document.startViewTransition).toBeUndefined();
    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});
