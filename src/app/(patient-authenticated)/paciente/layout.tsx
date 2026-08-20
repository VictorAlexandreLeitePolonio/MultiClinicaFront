import { ReactNode } from "react";
import { PatientAuthProvider } from "@/contexts/PatientAuthContext";
import { PatientGuard } from "./components/PatientGuard";

export default function PatientAuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <PatientAuthProvider>
      <PatientGuard>{children}</PatientGuard>
    </PatientAuthProvider>
  );
}
