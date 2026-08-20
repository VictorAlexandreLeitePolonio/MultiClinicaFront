import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClinicLikeButton } from "./ClinicLikeButton";

const likeClinic = vi.fn();
const unlikeClinic = vi.fn();
const push = vi.fn();
const toastError = vi.fn();

vi.mock("@/app/(patient-authenticated)/paciente/services/patient-portal.service", () => ({
  likeClinic: (id: number) => likeClinic(id),
  unlikeClinic: (id: number) => unlikeClinic(id),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("sonner", () => ({ toast: { error: (m: string) => toastError(m) } }));

describe("ClinicLikeButton", () => {
  beforeEach(() => {
    likeClinic.mockReset();
    unlikeClinic.mockReset();
    push.mockReset();
    toastError.mockReset();
  });

  it("renderiza o contador público", () => {
    render(<ClinicLikeButton clinicId={1} likeCount={187} canLike={false} />);
    expect(screen.getByRole("button")).toHaveTextContent("187");
  });

  it("visitante não autenticado é direcionado ao login e não chama a API", async () => {
    render(<ClinicLikeButton clinicId={1} likeCount={187} canLike={false} />);
    await userEvent.click(screen.getByRole("button"));
    expect(push).toHaveBeenCalledWith("/paciente/login");
    expect(likeClinic).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toHaveTextContent("187");
  });

  it("like incrementa otimisticamente e confirma pela resposta", async () => {
    likeClinic.mockResolvedValue({ clinicId: 1, likeCount: 188, likedByMe: true });
    render(<ClinicLikeButton clinicId={1} likeCount={187} likedByMe={false} canLike />);
    const button = screen.getByRole("button");

    await userEvent.click(button);
    expect(likeClinic).toHaveBeenCalledWith(1);
    await waitFor(() => expect(button).toHaveTextContent("188"));
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("erro no like faz rollback e mostra toast", async () => {
    likeClinic.mockRejectedValue(new Error("falha"));
    render(<ClinicLikeButton clinicId={1} likeCount={187} likedByMe={false} canLike />);
    const button = screen.getByRole("button");

    await userEvent.click(button);
    await waitFor(() => expect(toastError).toHaveBeenCalled());
    expect(button).toHaveTextContent("187");
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("unlike não deixa o contador negativo", async () => {
    unlikeClinic.mockResolvedValue({ clinicId: 1, likeCount: 0, likedByMe: false });
    render(<ClinicLikeButton clinicId={1} likeCount={0} likedByMe canLike />);
    const button = screen.getByRole("button");

    await userEvent.click(button);
    await waitFor(() => expect(unlikeClinic).toHaveBeenCalled());
    expect(button).toHaveTextContent("0");
    expect(button).not.toHaveTextContent("-1");
  });
});
