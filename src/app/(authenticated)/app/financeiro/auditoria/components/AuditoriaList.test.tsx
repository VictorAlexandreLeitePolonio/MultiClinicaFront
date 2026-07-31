import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuditoriaList } from "./AuditoriaList";

const can = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ can }) }));
vi.mock("../hooks/useAuditoria", () => ({ useAuditoria: () => ({ data: { data: [{ id: 1, usuarioId: 2, modulo: "ContasPagar", acao: "Editar", entidade: "ContaPagar", entidadeId: 4, dadosAntes: '{"valor":1}', dadosDepois: '{"valor":2}', motivo: null, dataAcao: "2026-07-26T10:00:00Z", ip: null, userAgent: null }], totalPages: 1 }, isLoading: false, isError: false, error: null, refetch: vi.fn() }) }));
describe("AuditoriaList", () => { beforeEach(() => { vi.clearAllMocks(); can.mockReturnValue(true); }); it("não renderiza para quem não tem permissão", () => { can.mockReturnValue(false); const { container } = render(<AuditoriaList />); expect(container).toBeEmptyDOMElement(); }); it("abre detalhes do registro", () => { render(<AuditoriaList />); fireEvent.click(screen.getByRole("button", { name: /detalhes/i })); expect(screen.getByText("Detalhes da auditoria #1")).toBeInTheDocument(); expect(screen.getByText(/\"valor\": 1/)).toBeInTheDocument(); }); });
