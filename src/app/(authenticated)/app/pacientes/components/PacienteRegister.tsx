"use client";

import PacienteFocusForm from "./PacienteFocusForm";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function PacienteRegister({ open, onClose, onSaved }: Props) {
  return (
    <PacienteFocusForm mode="create" open={open} onClose={onClose} onSaved={onSaved} />
  );
}
