import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export function EmptyState({ title, description, icon: Icon }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[#a7f3d0] bg-white/80 p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
      {Icon && (
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ecfdf5] text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]">
          <Icon size={26} />
        </div>
      )}
      <h2 className="text-base font-semibold text-[#0f172a] dark:text-white">{title}</h2>
      {description && <p className="mt-2 text-sm text-[#64748b] dark:text-slate-300">{description}</p>}
    </div>
  );
}
