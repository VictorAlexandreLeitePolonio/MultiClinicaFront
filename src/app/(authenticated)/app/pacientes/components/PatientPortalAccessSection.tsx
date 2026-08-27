"use client";

import { motion } from "motion/react";
import { toast } from "sonner";
import { KeyRound, MailCheck, ShieldCheck, ShieldOff, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PatientAccountStatus, PatientCreatedResponse } from "@/types";
import { useProvisionPortalAccess, useResendPortalInvite } from "../hooks/portalAccess";

interface Props {
  patientId: number;
  /** null = sem identidade global vinculada ("Sem acesso"). undefined = ainda carregando. */
  status: PatientAccountStatus | null | undefined;
  /** Recarrega o paciente após uma ação bem-sucedida. */
  onChanged: () => void | Promise<void>;
}

/** Feedback de sucesso ao criar acesso, considerando vínculo e envio do convite. */
function provisionMessage(res: PatientCreatedResponse): string {
  if (res.patientAccountStatus === "PendingActivation" && !res.invitationSent) {
    return res.linkResult === "CreatedAccount"
      ? "Acesso criado, mas não foi possível enviar o convite. Tente reenviá-lo."
      : "Acesso vinculado, mas não foi possível enviar o convite. Tente reenviá-lo.";
  }
  if (res.linkResult === "LinkedExistingAccount" || res.linkResult === "AlreadyLinked")
    return "Paciente vinculado a uma conta MultiClínica existente.";
  return "Acesso criado. Enviamos um convite para o paciente ativar a conta.";
}

const STATE_STYLES = {
  none: "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700",
  pending: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900",
  active: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900",
  inactive: "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700",
} as const;

export function PatientPortalAccessSection({ patientId, status, onChanged }: Props) {
  const { provisionPortalAccess, isPending: isProvisioning } = useProvisionPortalAccess();
  const { resendPortalInvite, isPending: isResending } = useResendPortalInvite();

  if (status === undefined) return null;

  const handleProvision = async () => {
    try {
      const res = await provisionPortalAccess(patientId);
      toast.success(provisionMessage(res));
      await onChanged();
    } catch {
      // erro já tratado no hook
    }
  };

  const handleResend = async () => {
    try {
      const res = await resendPortalInvite(patientId);
      if (res.invitationSent) {
        toast.success("Convite reenviado com sucesso.");
      } else {
        toast.error("Não foi possível reenviar o convite agora. Tente novamente.");
      }
      await onChanged();
    } catch {
      // erro já tratado no hook
    }
  };

  const config = (() => {
    switch (status) {
      case null:
        return {
          state: "none" as const,
          Icon: ShieldOff,
          iconClass: "text-gray-500 dark:text-slate-400",
          label: "Sem acesso",
          description: "Este paciente ainda não tem acesso ao portal MultiClínica.",
          action: (
            <Button fullWidth={false} onClick={handleProvision} loading={isProvisioning}>
              <KeyRound size={16} />
              Criar acesso
            </Button>
          ),
        };
      case "PendingActivation":
        return {
          state: "pending" as const,
          Icon: MailCheck,
          iconClass: "text-amber-600 dark:text-amber-400",
          label: "Convite pendente",
          description: "O paciente foi convidado, mas ainda não ativou a conta.",
          action: (
            <Button fullWidth={false} variant="outline" onClick={handleResend} loading={isResending}>
              <Send size={16} />
              Reenviar convite
            </Button>
          ),
        };
      case "Active":
        return {
          state: "active" as const,
          Icon: ShieldCheck,
          iconClass: "text-emerald-600 dark:text-emerald-400",
          label: "Conta ativa",
          description: "O paciente já ativou o acesso ao portal MultiClínica.",
          action: null,
        };
      case "Inactive":
        return {
          state: "inactive" as const,
          Icon: ShieldOff,
          iconClass: "text-gray-500 dark:text-slate-400",
          label: "Conta inativa",
          description: "O acesso ao portal deste paciente está inativo.",
          action: null,
        };
    }
  })();

  const { Icon } = config;

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label="Acesso ao portal"
      className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${STATE_STYLES[config.state]}`}
    >
      <div className="flex items-start gap-3">
        <Icon size={20} className={`mt-0.5 shrink-0 ${config.iconClass}`} />
        <div>
          <p className="text-sm font-semibold text-secondary dark:text-white">
            Acesso ao portal — {config.label}
          </p>
          <p className="text-sm text-gray-600 dark:text-slate-300">{config.description}</p>
        </div>
      </div>
      {config.action && <div className="shrink-0">{config.action}</div>}
    </motion.section>
  );
}
