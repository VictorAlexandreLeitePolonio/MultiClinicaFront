"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, ChevronDown, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCreateSessionType, useSessionTypes } from "../hooks/useSessionTypes";

interface SessionTypeFieldProps {
  value: number;
  onChange: (id: number) => void;
  disabled?: boolean;
  error?: string;
}

export function SessionTypeField({ value, onChange, disabled, error }: SessionTypeFieldProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const allTypes = useSessionTypes("");
  const results = useSessionTypes(search);
  const { createSessionType, isPending } = useCreateSessionType();
  const selected = allTypes.data?.find((item) => item.id === value);

  const select = (id: number) => {
    onChange(id);
    setOpen(false);
    setSearch("");
  };

  const handleCreate = async () => {
    try {
      const created = await createSessionType(name);
      select(created.id);
      setName("");
      setDialogOpen(false);
    } catch {
      // O hook mantém o modal aberto e exibe a mensagem da API.
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label id="session-type-label" className={disabled ? "text-sm font-semibold text-slate-400" : "text-sm font-semibold text-[#0f172a] dark:text-white"}>
          Tipo de sessão <span className="ml-1 text-red-600">*</span>
        </label>
        {!disabled && (
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold text-[#0f766e] transition-colors hover:bg-[#ecfdf5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#99f6e4]/50 dark:text-[#67e8f9] dark:hover:bg-slate-800"
          >
            <Plus size={16} aria-hidden="true" />
            Cadastrar tipo de sessão
          </button>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          aria-labelledby="session-type-label"
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
          className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all focus-visible:outline-none focus-visible:ring-4 ${
            disabled
              ? "cursor-not-allowed border-[#d7f3ea] bg-[#f0fdf9] text-slate-400 dark:border-slate-800 dark:bg-slate-900"
              : error
                ? "border-red-500 bg-white text-[#0f172a] focus-visible:border-red-500 focus-visible:ring-red-100 dark:bg-slate-900 dark:text-white"
                : "border-[#d7f3ea] bg-white text-[#0f172a] hover:border-[#5eead4] focus-visible:border-[#14b8a6] focus-visible:ring-[#99f6e4]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:border-slate-600"
          }`}
        >
          <span className={selected ? "truncate font-medium" : "truncate text-slate-400"}>
            {selected?.name ?? (allTypes.isLoading ? "Carregando tipos..." : "Selecione um tipo de sessão")}
          </span>
          <ChevronDown size={18} aria-hidden="true" className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && !disabled && (
          <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-[#d7f3ea] bg-white shadow-[0_20px_45px_-24px_rgba(15,23,42,0.38)] dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-[#d7f3ea] p-3 dark:border-slate-800">
              <div className="flex items-center gap-2 rounded-xl border border-[#d7f3ea] bg-[#f8fffd] px-3 focus-within:border-[#14b8a6] focus-within:ring-4 focus-within:ring-[#99f6e4]/40 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:ring-[#134e4a]">
                <Search size={17} aria-hidden="true" className="shrink-0 text-[#0f766e] dark:text-[#67e8f9]" />
                <input
                  autoFocus
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar tipo de sessão..."
                  className="min-h-11 w-full bg-transparent text-sm text-[#0f172a] outline-none placeholder:text-slate-400 dark:text-white"
                />
              </div>
            </div>

            <div role="listbox" aria-labelledby="session-type-label" className="max-h-52 overflow-y-auto overscroll-contain p-1.5">
              {results.isLoading && <p className="px-3 py-5 text-center text-sm text-slate-500">Carregando tipos...</p>}
              {results.isError && (
                <div className="px-3 py-4 text-center">
                  <p className="text-sm font-medium text-red-600">Não foi possível carregar os tipos.</p>
                  <button type="button" className="mt-2 text-sm font-semibold text-[#0f766e] underline decoration-[#5eead4] underline-offset-4" onClick={() => void results.refetch()}>
                    Tentar novamente
                  </button>
                </div>
              )}
              {!results.isLoading && !results.isError && results.data?.length === 0 && (
                <div className="px-3 py-5 text-center">
                  <p className="text-sm font-medium text-[#0f172a] dark:text-white">Nenhum tipo encontrado</p>
                  <p className="mt-1 text-xs text-slate-500">Tente outro termo ou cadastre uma nova opção.</p>
                </div>
              )}
              {results.data?.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={item.id === value}
                  onClick={() => select(item.id)}
                  className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14b8a6] ${
                    item.id === value
                      ? "bg-[#ecfdf5] font-semibold text-[#0f766e] dark:bg-[#134e4a]/40 dark:text-[#99f6e4]"
                      : "text-[#334155] hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="truncate">{item.name}</span>
                  {item.id === value && <Check size={17} aria-hidden="true" className="shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && !disabled && <p className="text-xs font-medium text-red-600">{error}</p>}

      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.5)] dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="text-lg font-bold text-[#0f172a] dark:text-white">Novo tipo de sessão</Dialog.Title>
                <Dialog.Description className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  A nova opção ficará disponível nos planos desta clínica.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button type="button" aria-label="Fechar" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#99f6e4]/50 dark:hover:bg-slate-800 dark:hover:text-white">
                  <X size={18} aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>

            <div className="mt-5">
              <label htmlFor="session-type-name" className="text-sm font-semibold text-[#0f172a] dark:text-white">Nome do tipo de sessão</label>
              <input
                id="session-type-name"
                autoFocus
                value={name}
                maxLength={100}
                placeholder="Ex.: Acupuntura"
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && name.trim() && void handleCreate()}
                className="mt-2 min-h-12 w-full rounded-xl border border-[#d7f3ea] bg-white px-4 py-3 text-[#0f172a] outline-none placeholder:text-slate-400 focus:border-[#14b8a6] focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-[#134e4a]"
              />
              <p className="mt-2 text-xs text-slate-500">Até 100 caracteres. O nome não pode se repetir nesta clínica.</p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" fullWidth={false} disabled={isPending}>Cancelar</Button>
              </Dialog.Close>
              <Button type="button" fullWidth={false} loading={isPending} disabled={!name.trim()} onClick={handleCreate}>
                Cadastrar
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
