import { ReactNode } from "react";
import { PatientAuthProvider } from "@/contexts/PatientAuthContext";
import { PatientGuard } from "./components/PatientGuard";
import { PatientShell } from "./components/PatientShell";

export default function PatientAuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <PatientAuthProvider>
      <PatientGuard>
        <PatientShell>{children}</PatientShell>
      </PatientGuard>
    </PatientAuthProvider>
  );
}
