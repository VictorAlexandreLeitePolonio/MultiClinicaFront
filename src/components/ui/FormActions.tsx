import { Button } from "./Button";

interface FormActionsProps {
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export function FormActions({
  onCancel,
  submitLabel = "Salvar",
  cancelLabel = "Cancelar",
  loading,
}: FormActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      {onCancel && (
        <div className="sm:w-40">
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      )}
      <div className="sm:w-40">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
