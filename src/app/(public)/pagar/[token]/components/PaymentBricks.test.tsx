import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { initMercadoPago } from "@mercadopago/sdk-react";
import PaymentBricks from "./PaymentBricks";

const onSubmit = vi.fn();

vi.mock("@mercadopago/sdk-react", async () => {
  const React = await import("react");

  type PaymentProps = {
    customization: { paymentMethods: Record<string, unknown> };
    onSubmit: (param: {
      formData: {
        token: string;
        payment_method_id: string;
        issuer_id: string;
        installments: number;
        payer: { email: string; identification: { type: string; number: string } };
      };
    }) => Promise<unknown>;
  };

  return {
    initMercadoPago: vi.fn(),
    Payment: (props: PaymentProps) =>
      React.createElement(
        "div",
        {
          "data-testid": "payment-brick",
          "data-max-installments": String(props.customization.paymentMethods.maxInstallments ?? ""),
          "data-bank-transfer": JSON.stringify(props.customization.paymentMethods.bankTransfer ?? null),
          "data-credit-card": String(props.customization.paymentMethods.creditCard ?? ""),
          "data-debit-card": String(props.customization.paymentMethods.debitCard ?? ""),
        },
        React.createElement(
          "button",
          {
            type: "button",
            onClick: () => {
              void props.onSubmit({
                formData: {
                  token: "card-token",
                  payment_method_id: "master",
                  issuer_id: "123",
                  installments: 3,
                  payer: {
                    email: "ana@example.com",
                    identification: { type: "CPF", number: "12345678900" },
                  },
                },
              });
            },
          },
          "Pagar",
        ),
      ),
    StatusScreen: (props: { initialization: { paymentId: string } }) =>
      React.createElement("div", { "data-testid": "status-screen" }, props.initialization.paymentId),
  };
});

function renderBricks(overrides: Partial<ComponentProps<typeof PaymentBricks>> = {}) {
  return render(
    <PaymentBricks
      publicKey="pub-key"
      amount={250}
      acceptPix
      acceptCredit
      acceptDebit
      maxInstallments={6}
      paymentId={null}
      onSubmit={onSubmit}
      {...overrides}
    />,
  );
}

describe("PaymentBricks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inicializa o Mercado Pago e monta o Brick com as formas aceitas", () => {
    renderBricks({ publicKey: "pub-key-initial" });

    expect(initMercadoPago).toHaveBeenCalledWith("pub-key-initial", { locale: "pt-BR" });
    const brick = screen.getByTestId("payment-brick");
    expect(brick).toHaveAttribute("data-max-installments", "6");
    expect(brick).toHaveAttribute("data-bank-transfer", '["pix"]');
    expect(brick).toHaveAttribute("data-credit-card", "all");
    expect(brick).toHaveAttribute("data-debit-card", "all");
  });

  it("omite das configurações as formas que a clínica não aceita", () => {
    renderBricks({
      publicKey: "pub-key-no-pix",
      acceptPix: false,
      acceptCredit: false,
      acceptDebit: true,
    });

    const brick = screen.getByTestId("payment-brick");
    expect(brick).toHaveAttribute("data-bank-transfer", "null");
    expect(brick).toHaveAttribute("data-credit-card", "");
    expect(brick).toHaveAttribute("data-debit-card", "all");
  });

  it("repassa o formData do Brick para o pagamento", async () => {
    renderBricks({ publicKey: "pub-key-submit" });

    await userEvent.click(screen.getByRole("button", { name: "Pagar" }));

    expect(onSubmit).toHaveBeenCalledWith({
      token: "card-token",
      payment_method_id: "master",
      issuer_id: "123",
      installments: 3,
      payer: {
        email: "ana@example.com",
        identification: { type: "CPF", number: "12345678900" },
      },
    });
  });

  it("mostra o Status Screen quando há um pagamento em andamento", () => {
    renderBricks({ publicKey: "pub-key-status", paymentId: "987654" });

    expect(screen.getByTestId("status-screen")).toHaveTextContent("987654");
    expect(screen.queryByTestId("payment-brick")).not.toBeInTheDocument();
  });
});
