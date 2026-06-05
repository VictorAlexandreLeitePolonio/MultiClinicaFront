import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
}

export function MetricCard({ label, value, description, icon: Icon }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-[#d7f3ea] bg-white p-5 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-0.5 hover:border-[#a7f3d0] hover:shadow-[0_22px_60px_-44px_rgba(20,184,166,0.55)] dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#64748b] dark:text-slate-300">{label}</p>
          <strong className="mt-2 block text-2xl font-bold text-[#0f172a] dark:text-white">
            {value}
          </strong>
        </div>
        {Icon && (
          <div className="rounded-xl bg-[#ecfdf5] p-2.5 text-[#0f766e] ring-1 ring-[#a7f3d0]/60 dark:bg-slate-800 dark:text-[#67e8f9] dark:ring-slate-700">
            <Icon size={20} />
          </div>
        )}
      </div>
      {description && <p className="mt-3 text-xs text-[#64748b] dark:text-slate-400">{description}</p>}
    </article>
  );
}
