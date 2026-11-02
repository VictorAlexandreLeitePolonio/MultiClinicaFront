/** Só aceita caminho interno; URLs externas ou protocol-relative caem no portal do paciente. */
export function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
    ? next
    : "/paciente";
}
