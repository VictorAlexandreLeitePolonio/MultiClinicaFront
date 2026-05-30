interface StatusMapping {
  label: string;
  className: string;
}

interface StatusBadgeProps {
  status?: string | null;
  mapping: Record<string, StatusMapping>;
}

/**
 * Badge de status reutilizável.
 *
 * Uso:
 *   <StatusBadge
 *     status={row.appointmentStatus}
 *     mapping={{
 *       Scheduled: { label: "Agendado", className: "bg-blue-100 text-blue-700 border-blue-200" },
 *       Completed: { label: "Completo", className: "bg-green-100 text-green-700 border-green-200" },
 *       Cancelled: { label: "Cancelado", className: "bg-red-100 text-red-700 border-red-200" },
 *     }}
 *   />
 */
export function StatusBadge({ status, mapping }: StatusBadgeProps) {
  if (!status) return <span className="text-gray-400">-</span>;

  const config = mapping[status];
  const className = config?.className ?? "";
  const label = config?.label ?? status;

  return (
    <span className={`px-2 py-1 rounded-sm text-xs font-semibold border-2 ${className}`}>
      {label}
    </span>
  );
}
