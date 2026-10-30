import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import {
  BillingLimitError,
  FEATURE_LABELS,
  PLAN_REQUIRED_EVENT,
} from "@/lib/plans";
import { PlanRequiredModal } from "./PlanRequiredModal";

function dispatchPlanError(detail: BillingLimitError) {
  window.dispatchEvent(new CustomEvent(PLAN_REQUIRED_EVENT, { detail }));
}

describe("PlanRequiredModal", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("mostra a feature e o plano que libera o recurso", async () => {
    render(<PlanRequiredModal />);

    dispatchPlanError({
      code: "PLAN_REQUIRED",
      feature: "OwnerCopilot",
      requiredPlan: "Pro",
      message: "Recurso do plano Pro.",
    });

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Recurso do plano Pro")).toBeInTheDocument();
    expect(screen.getByText("Recurso do plano Pro")).toHaveFocus();
    expect(screen.getByText(new RegExp(FEATURE_LABELS.OwnerCopilot))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver planos" })).toHaveAttribute(
      "href",
      "/app/configuracoes/plano",
    );
  });

  it("mostra o limite de profissionais e os atalhos de compra", async () => {
    render(<PlanRequiredModal />);

    dispatchPlanError({
      code: "PROFESSIONAL_LIMIT",
      limit: 1,
      message: "Limite atingido.",
    });

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Limite de 1 profissional(is) atingido")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Comprar vaga" })).toHaveAttribute(
      "href",
      "/app/configuracoes/plano",
    );
    expect(screen.getByRole("link", { name: "Ver planos" })).toHaveAttribute(
      "href",
      "/app/configuracoes/plano",
    );
  });

  it("fecha com Esc", async () => {
    render(<PlanRequiredModal />);

    dispatchPlanError({
      code: "PLAN_REQUIRED",
      feature: "Transcription",
      requiredPlan: "Premium",
      message: "Recurso do plano Premium.",
    });

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
