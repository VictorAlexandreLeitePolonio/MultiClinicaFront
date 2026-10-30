/** Só aceita um caminho interno do app da clínica; evita open redirect. */
export function resolvePostLoginPath(defaultPath: string, next: string | null): string {
  if (defaultPath !== "/app" || !next) return defaultPath;
  if (next !== "/app" && !next.startsWith("/app/") && !next.startsWith("/app?")) return defaultPath;
  return next;
}
