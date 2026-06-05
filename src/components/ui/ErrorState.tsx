import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Não foi possível carregar os dados", message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm dark:border-red-900 dark:bg-red-950/40">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-600 ring-1 ring-red-100 dark:bg-red-950/60 dark:text-red-300 dark:ring-red-900">
        <AlertTriangle size={26} />
      </div>
      <h2 className="text-base font-semibold text-red-800 dark:text-red-200">{title}</h2>
      <p className="mt-2 text-sm text-red-700 dark:text-red-300">{message}</p>
      {onRetry && (
        <div className="mx-auto mt-4 max-w-48">
          <Button type="button" variant="danger" onClick={onRetry}>
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  );
}
