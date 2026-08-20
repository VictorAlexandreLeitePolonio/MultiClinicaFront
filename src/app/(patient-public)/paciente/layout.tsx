import { ReactNode } from "react";
import { PatientAuthProvider } from "@/contexts/PatientAuthContext";

export default function PatientPublicLayout({ children }: { children: ReactNode }) {
  return <PatientAuthProvider>{children}</PatientAuthProvider>;
}
