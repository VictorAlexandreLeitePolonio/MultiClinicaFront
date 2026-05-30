import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Não foi possível carregar os dados", message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-sm border-2 border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/40">
      <AlertTriangle size={28} className="mx-auto mb-3 text-red-600 dark:text-red-300" />
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
