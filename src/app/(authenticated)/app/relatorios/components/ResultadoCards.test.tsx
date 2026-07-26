import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResultadoCards } from "./ResultadoCards";

describe("ResultadoCards", () => { it("exibe faturamento, despesas e resultado formatados", () => { render(<ResultadoCards data={{ faturamento: 1000, despesas: 250, resultado: 750 }} />); expect(screen.getByText("Faturamento")).toBeInTheDocument(); expect(screen.getByText(/R\$\s?1\.000,00/)).toBeInTheDocument(); expect(screen.getByText(/R\$\s?750,00/)).toBeInTheDocument(); }); it("exibe estado vazio", () => { render(<ResultadoCards />); expect(screen.getByText("Nenhum resultado disponível.")).toBeInTheDocument(); }); });
