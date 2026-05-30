import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export function EmptyState({ title, description, icon: Icon }: EmptyStateProps) {
  return (
    <div className="rounded-sm border-2 border-dashed border-[#d8d2c8] bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      {Icon && (
        <Icon size={32} className="mx-auto mb-3 text-[#5a9c94] dark:text-[#7bbfb8]" />
      )}
      <h2 className="text-base font-semibold text-[#1a2a4a] dark:text-slate-50">{title}</h2>
      {description && <p className="mt-2 text-sm text-[#4a6354] dark:text-slate-300">{description}</p>}
    </div>
  );
}
