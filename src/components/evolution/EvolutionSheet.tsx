"use client";

// Stub da Fundação; a implementação (painel lateral com texto + várias fichas de medição) é da Trilha F2.
export interface EvolutionSheetProps {
  patientId: number;
  /** Evolução existente para editar; ausente = nova. */
  evolutionId?: number | null;
  /** Consulta de origem para uma evolução nova. */
  appointmentId?: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Chamado depois de salvar ou concluir. */
  onSaved?: (evolutionId: number) => void;
}

export function EvolutionSheet(_props: EvolutionSheetProps) {
  return null;
}
