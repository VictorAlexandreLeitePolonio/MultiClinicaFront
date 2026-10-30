import { LucideIcon } from "lucide-react";

type Tone = "success" | "neutral" | "error";

const TONE_CLASSES: Record<Tone, { icon: string; ring: string }> = {
  success: {
    icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    ring: "border-emerald-200 dark:border-emerald-900",
  },
  neutral: {
    icon: "bg-[#ecfdf5] text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]",
    ring: "border-[#d7f3ea] dark:border-slate-800",
  },
  error: {
    icon: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    ring: "border-red-200 dark:border-red-900",
  },
};

interface PaymentStateCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  tone?: Tone;
}

/** Mensagem central das telas de pagamento (pago, indisponível, link inválido). */
export function PaymentStateCard({
  icon: Icon,
  title,
  description,
  tone = "neutral",
}: PaymentStateCardProps) {
  const classes = TONE_CLASSES[tone];

  return (
    <div className={`rounded-2xl border bg-white p-8 text-center shadow-sm dark:bg-slate-900 ${classes.ring}`}>
      <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${classes.icon}`}>
        <Icon size={28} />
      </div>
      <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">{title}</h2>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm text-[#64748b] dark:text-slate-300">{description}</p>
      )}
    </div>
  );
}
