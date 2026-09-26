"use client";

import { useState } from "react";
import Link from "next/link";
import { Patient } from "@/types";
import { FormField } from "@/components/ui/FormField";
import { useAppointmentPatients } from "../hooks/useAppointmentPatients";

interface Props {
  value: number;
  onChange: (id: number) => void;
  error?: string;
}

export function AppointmentPatientSelect({ value, onChange, error }: Props) {
  const { query, search, setSearch, page, setPage } = useAppointmentPatients();
  const [selected, setSelected] = useState<Pick<Patient, "id" | "name"> | null>(null);
  const patients = query.data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((query.data?.totalCount ?? 0) / 10));

  return (
    <div data-tutorial="agenda-form-patient" className="space-y-3">
      <FormField id="appointment-patient-search" label="Buscar paciente" type="search"
        placeholder="Digite o nome do paciente" value={search} onChange={(event) => setSearch(event.target.value)} />
      <label htmlFor="appointment-patient" className="block text-sm font-semibold text-secondary dark:text-white">Paciente *</label>
      <select id="appointment-patient" value={value || 0}
        onChange={(event) => {
          const id = Number(event.target.value);
          setSelected(patients.find((patient) => patient.id === id) ?? null);
          onChange(id);
        }}
        aria-invalid={!!error}
        aria-describedby={error ? "appointment-patient-error" : undefined}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
        <option value={0}>{query.isPending ? "Carregando pacientes..." : "Selecione um paciente"}</option>
        {selected && !patients.some((patient) => patient.id === selected.id) && <option value={selected.id}>{selected.name}</option>}
        {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}
      </select>
      {error && <p id="appointment-patient-error" role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
      {query.isError ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          Não foi possível carregar os pacientes.{" "}
          <button type="button" onClick={() => void query.refetch()} className="font-semibold underline">Tentar novamente</button>
        </p>
      ) : query.isSuccess && patients.length === 0 ? (
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p role="status">{search.trim() ? "Nenhum paciente encontrado. Tente outro nome." : "Nenhum paciente ativo cadastrado."}</p>
          <Link href="/app/pacientes?mode=create" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-dark underline">Cadastrar paciente em outra aba</Link>
        </div>
      ) : null}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 text-sm">
          <button type="button" disabled={page <= 1 || query.isFetching} onClick={() => setPage(page - 1)} className="rounded-lg px-3 py-2 underline disabled:opacity-40">Pacientes anteriores</button>
          <span>Página {page} de {totalPages}</span>
          <button type="button" disabled={page >= totalPages || query.isFetching} onClick={() => setPage(page + 1)} className="rounded-lg px-3 py-2 underline disabled:opacity-40">Próximos pacientes</button>
        </div>
      )}
    </div>
  );
}
