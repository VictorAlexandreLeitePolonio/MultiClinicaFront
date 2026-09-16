import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SessionTypeField } from "./SessionTypeField";

const createSessionType = vi.fn().mockResolvedValue({ id: 3, name: "Acupuntura" });

vi.mock("../hooks/useSessionTypes", () => ({
  useSessionTypes: (search: string) => ({
    data: [{ id: 1, name: "Consulta" }, { id: 2, name: "Retorno" }].filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    ),
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useCreateSessionType: () => ({ createSessionType, isPending: false }),
}));

describe("SessionTypeField", () => {
  it("pesquisa, seleciona e cadastra um tipo sem desmontar o campo", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SessionTypeField value={0} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: /Tipo de sessão/ }));
    await user.type(screen.getByPlaceholderText("Buscar tipo de sessão..."), "ret");
    await user.click(screen.getByRole("option", { name: "Retorno" }));
    expect(onChange).toHaveBeenCalledWith(2);

    await user.click(screen.getByRole("button", { name: "Cadastrar tipo de sessão" }));
    await user.type(screen.getByLabelText("Nome do tipo de sessão"), "Acupuntura");
    await user.click(screen.getByRole("button", { name: "Cadastrar" }));

    expect(createSessionType).toHaveBeenCalledWith("Acupuntura");
    expect(onChange).toHaveBeenLastCalledWith(3);
    expect(screen.getByRole("button", { name: /Tipo de sessão/ })).toBeInTheDocument();
  });
});
