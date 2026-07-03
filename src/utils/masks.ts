import { formatCPF, formatRG, formatPhone, formatCEP, formatMonthReference } from "./formatters";

export function maskCPF(value: string): string {
  return formatCPF(value);
}

export function maskRG(value: string): string {
  return formatRG(value);
}

export function maskPhone(value: string): string {
  return formatPhone(value);
}

export function maskCEP(value: string): string {
  return formatCEP(value);
}

export function maskMonthReference(value: string): string {
  return formatMonthReference(value);
}
