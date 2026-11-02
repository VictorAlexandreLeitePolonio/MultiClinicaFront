"use client";

import PacienteFocusForm from "./PacienteFocusForm";

interface Props {
  open: boolean;
  patientId: number | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function PacienteDetails({ open, patientId, onClose, onSaved }: Props) {
  return (
    <PacienteFocusForm
      mode="edit"
      open={open}
      patientId={patientId}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}
