import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useForm } from "react-hook-form";
import { ClinicVisibilitySection } from "./ClinicVisibilitySection";
import { ClinicSettingsFormValues } from "../schemas/clinic-settings.schema";

function Harness({ isPublic }: { isPublic: boolean }) {
  const { control } = useForm<ClinicSettingsFormValues>({
    defaultValues: { isPublic, acceptsAppointmentRequests: true } as ClinicSettingsFormValues,
  });
  return <ClinicVisibilitySection control={control} />;
}

describe("ClinicVisibilitySection", () => {
  it("mantém 'Aceitar solicitações' habilitado mesmo sem perfil público (pacientes vinculados)", () => {
    render(<Harness isPublic={false} />);
    const accepts = screen.getByRole("switch", { name: "Aceitar solicitações online" });
    expect(accepts).not.toBeDisabled();
    expect(accepts).toHaveAttribute("aria-checked", "true");
  });

  it("permite alternar 'Aceitar solicitações' independentemente do perfil público", async () => {
    render(<Harness isPublic />);
    const accepts = screen.getByRole("switch", { name: "Aceitar solicitações online" });
    expect(accepts).not.toBeDisabled();
    expect(accepts).toHaveAttribute("aria-checked", "true");
    await userEvent.click(accepts);
    expect(accepts).toHaveAttribute("aria-checked", "false");
  });
});
