import patientApi from "@/lib/patientApi";
import { PatientCharge } from "@/types/mercadoPago";

/** Cobranças pendentes e pagas do paciente autenticado. */
export async function getMyCharges(): Promise<PatientCharge[]> {
  const response = await patientApi.get<PatientCharge[]>("/api/patient/payments");
  return response.data;
}
