"use client";

import { easeCss } from "@/lib/motion";

interface ButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  /** id do <form> que este botão envia quando está fora dele (ex.: barra do FocusForm). */
  form?: string;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  /** Ocupa 100% da largura (padrão). Use false em headers/linhas de tabela. */
  fullWidth?: boolean;
}

export function Button({
  children,
  loading,
  type = "button",
  form,
  disabled,
  onClick,
  variant = "primary",
  fullWidth = true,
}: ButtonProps) {
  const baseStyles = `${fullWidth ? "w-full" : "w-auto"} inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition-[transform,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100`;

  const variants = {
    primary:
      "border border-[var(--color-primary-dark)] bg-[var(--color-primary-dark)] text-[var(--color-white)] shadow-[var(--shadow-teal-sm)] hover:brightness-110 hover:shadow-[var(--shadow-teal-md)]",
    secondary:
      "border border-[var(--color-secondary)] bg-[var(--color-secondary)] text-[var(--color-background)] shadow-[var(--shadow-md)] hover:bg-[var(--color-secondary-dark)]",
    outline:
      "border border-[var(--color-primary-light)] bg-[var(--color-card)] text-[var(--color-primary-dark)] shadow-[var(--shadow-sm)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] dark:border-[var(--color-gray-200)] dark:text-[var(--color-primary-light)]",
    danger:
      "border border-red-600 bg-red-600 text-white shadow-[var(--shadow-md)] hover:bg-red-700",
  };

  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        transitionDuration: "160ms",
        transitionTimingFunction: easeCss.out,
      }}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="h-5 w-5 animate-spin text-current motion-reduce:animate-none"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Carregando...</span>
        </span>
      ) : (
        // svg é display:block no preflight do Tailwind; sem flex aqui o ícone quebra a linha acima do texto.
        <span className="inline-flex items-center justify-center gap-1.5">{children}</span>
      )}
    </button>
  );
}
