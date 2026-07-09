import api from "@/lib/api";
import { Recebimento } from "@/types";
import { RegistrarRecebimentoFormData } from "@/app/(authenticated)/app/financeiro/contas-a-receber/schemas/contaReceber.schema";

export async function getRecebimentosPorConta(contaReceberId: number): Promise<Recebimento[]> {
  const response = await api.get<Recebimento[]>(`/api/contas-receber/${contaReceberId}/recebimentos`);

  return response.data;
}

export async function registrarRecebimento(
  contaReceberId: number,
  payload: RegistrarRecebimentoFormData
): Promise<Recebimento> {
  const response = await api.post<Recebimento>("/api/recebimentos", {
    ...payload,
    contaReceberId,
  });

  return response.data;
}

export async function estornarRecebimento(id: number, motivo: string): Promise<Recebimento> {
  const response = await api.post<Recebimento>(`/api/recebimentos/${id}/estornar`, { motivo });

  return response.data;
}
