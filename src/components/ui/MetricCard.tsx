import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
}

export function MetricCard({ label, value, description, icon: Icon }: MetricCardProps) {
  return (
    <article className="rounded-sm border-2 border-[#e2ebe6] bg-white p-5 shadow-[2px_2px_0_0_#e2ebe6] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[2px_2px_0_0_#334155]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#4a6354] dark:text-slate-300">{label}</p>
          <strong className="mt-2 block text-2xl text-[#1a2a4a] dark:text-slate-50">
            {value}
          </strong>
        </div>
        {Icon && (
          <div className="rounded-sm bg-[#e8f4f3] p-2 text-[#1a4a3a] dark:bg-slate-800 dark:text-[#7bbfb8]">
            <Icon size={20} />
          </div>
        )}
      </div>
      {description && <p className="mt-3 text-xs text-[#6b7280] dark:text-slate-400">{description}</p>}
    </article>
  );
}
