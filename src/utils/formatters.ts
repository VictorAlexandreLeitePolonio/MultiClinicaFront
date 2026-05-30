// Formatadores para documentos brasileiros

/**
 * Formata CPF progressivamente durante digitação: 111 → 111, 11122 → 111.22, 11122233344 → 111.222.333-44
 */
export function formatCPF(cpf: string): string {
  if (!cpf) return "";
  const digits = cpf.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/**
 * Remove formatação do CPF: 111.222.333-44 → 11122233344
 */
export function unformatCPF(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

/**
 * Formata RG progressivamente durante digitação: 12 → 12, 12345 → 12.345, 123456789 → 12.345.678-9
 */
export function formatRG(rg: string): string {
  if (!rg) return "";
  const digits = rg.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-${digits.slice(8)}`;
}

/**
 * Remove formatação do RG
 */
export function unformatRG(rg: string): string {
  return rg.replace(/\D/g, "");
}

/**
 * Formata CEP: 01001000 → 01001-000
 */
export function formatCEP(cep: string): string {
  if (!cep) return "";
  const digits = cep.replace(/\D/g, "").slice(0, 8);
  return digits.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}

/**
 * Remove formatação do CEP
 */
export function unformatCEP(cep: string): string {
  return cep.replace(/\D/g, "");
}

/**
 * Formata telefone/celular: 11912345678 → (11) 91234-5678
 * ou telefone fixo: 1134567890 → (11) 3456-7890
 */
export function formatPhone(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "").slice(0, 11);
  
  if (digits.length === 11) {
    // Celular: (11) 91234-5678
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{4})$/, "$1-$2");
  } else if (digits.length === 10) {
    // Fixo: (11) 3456-7890
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{4})$/, "$1-$2");
  } else {
    return digits.replace(/(\d{2})(\d)/, "($1) $2");
  }
}

/**
 * Remove formatação do telefone
 */
export function unformatPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Formata valor monetário: 1234.56 → R$ 1.234,56
 */
export function formatCurrency(value: number | string): string {
  if (value === null || value === undefined || value === "") return "";
  
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return "";
  
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}

/**
 * Remove formatação monetária: R$ 1.234,56 → 1234.56
 */
export function unformatCurrency(value: string): string {
  if (!value) return "";
  return value
    .replace(/R\$\s?/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".");
}

/**
 * Formata data ISO para brasileira: 2024-03-22 → 22/03/2024
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "";
  
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) return "";
  
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formata data ISO para brasileira com hora: 2024-03-22T10:30:00 → 22/03/2024 10:30
 */
export function formatDateTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return "";
  
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) return "";
  
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }) + " " + date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Converte data brasileira para ISO: 22/03/2024 → 2024-03-22
 */
export function unformatDate(dateString: string): string {
  if (!dateString) return "";
  const parts = dateString.split("/");
  if (parts.length !== 3) return "";
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

/**
 * Formata mês de referência: 2024-03 → 03/2024
 */
export function formatReferenceMonth(monthString: string): string {
  if (!monthString) return "";
  const parts = monthString.split("-");
  if (parts.length !== 2) return monthString;
  return `${parts[1]}/${parts[0]}`;
}

/**
 * Converte mês de referência para ISO: 03/2024 → 2024-03
 */
export function unformatReferenceMonth(monthString: string): string {
  if (!monthString) return "";
  const parts = monthString.split("/");
  if (parts.length !== 2) return monthString;
  return `${parts[1]}-${parts[0]}`;
}

/**
 * Verifica se CPF é válido (algoritmo de validação)
 */
export function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return false;
  if (/^(\d)\1+$/.test(clean)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(clean.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(clean.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(10, 11))) return false;

  return true;
}

/**
 * Verifica se CEP é válido (8 dígitos)
 */
export function isValidCEP(cep: string): boolean {
  const clean = cep.replace(/\D/g, "");
  return clean.length === 8;
}
