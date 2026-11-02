"use client";

import { Button } from "./Button";

interface PageHeaderProps {
  title: string;
  description?: string;
  onBack?: () => void;
  /** Ações à direita (ex.: ViewSwitcher, botão Novo). */
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, onBack, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {onBack && (
          <Button variant="outline" fullWidth={false} onClick={onBack}>
            ← Voltar
          </Button>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-secondary)] [text-wrap:balance]">
            {title}
          </h1>
          {description && <p className="mt-1 text-sm text-[var(--color-gray-600)]">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
