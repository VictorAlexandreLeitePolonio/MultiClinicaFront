import { ReactNode } from "react";
import { PatientAuthProvider } from "@/contexts/PatientAuthContext";

// Provider do paciente para o CTA de solicitação saber se há sessão ativa.
export default function PublicClinicLayout({ children }: { children: ReactNode }) {
  return <PatientAuthProvider>{children}</PatientAuthProvider>;
}
