"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Skeleton } from "@/components/ui/Skeleton";
import { queryKeys } from "@/lib/queryKeys";
import { getEvolutionTemplates } from "@/app/(authenticated)/app/modelos-evolucao/services/evolution.service";
import { EvolutionTemplate } from "@/types/evolution";

interface TemplatePickerProps {
  selectedTemplateIds: number[];
  onSelect: (template: EvolutionTemplate) => void | Promise<void>;
  disabled?: boolean;
}

export function TemplatePicker({
  selectedTemplateIds,
  onSelect,
  disabled,
}: TemplatePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [addingId, setAddingId] = useState<number | null>(null);

  const templatesQuery = useQuery({
    queryKey: queryKeys.evolution.templates.list({ page: 1, pageSize: 100 }),
    queryFn: () => getEvolutionTemplates({ page: 1, pageSize: 100 }),
  });

  const selectedIds = useMemo(() => new Set(selectedTemplateIds), [selectedTemplateIds]);
  const allTemplates = useMemo(
    () => templatesQuery.data?.data ?? [],
    [templatesQuery.data],
  );
  const available = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allTemplates.filter(
      (template) =>
        template.isActive &&
        !selectedIds.has(template.id) &&
        (!term ||
          template.name.toLowerCase().includes(term) ||
          (template.category ?? "").toLowerCase().includes(term)),
    );
  }, [allTemplates, search, selectedIds]);

  const emptyMessage = useMemo(() => {
    const hasActive = allTemplates.some((template) => template.isActive);
    const hasUnselectedActive = allTemplates.some(
      (template) => template.isActive && !selectedIds.has(template.id),
    );

    if (!hasActive) return "Nenhuma ficha de medição ativa disponível.";
    if (!hasUnselectedActive) return "Todas as fichas ativas já foram adicionadas.";
    return "Nenhuma ficha encontrada para a busca.";
  }, [allTemplates, selectedIds]);

  async function handleSelect(template: EvolutionTemplate) {
    setAddingId(template.id);
    try {
      await onSelect(template);
      setOpen(false);
      setSearch("");
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        fullWidth={false}
        disabled={disabled || addingId !== null}
        onClick={() => setOpen((current) => !current)}
      >
        <Plus size={16} />
        Adicionar ficha
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-[#d7f3ea] bg-white p-3 shadow-[0_18px_44px_-24px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:bg-slate-900">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar ficha de medição..."
          />

          <div className="mt-3 max-h-56 overflow-y-auto">
            {templatesQuery.isPending && (
              <div className="space-y-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            )}

            {templatesQuery.isError && (
              <div className="space-y-2 px-1 py-2 text-sm text-red-700 dark:text-red-300">
                <p>Não foi possível carregar as fichas de medição.</p>
                <button
                  type="button"
                  onClick={() => templatesQuery.refetch()}
                  className="font-semibold underline underline-offset-2"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!templatesQuery.isPending && !templatesQuery.isError && available.length === 0 && (
              <p className="px-1 py-2 text-sm text-[#475569] dark:text-slate-300">
                {emptyMessage}
              </p>
            )}

            {available.length > 0 && (
              <ul className="divide-y divide-[#e6fbf4] dark:divide-slate-800">
                {available.map((template) => (
                  <li key={template.id}>
                    <button
                      type="button"
                      onClick={() => void handleSelect(template)}
                      disabled={addingId !== null}
                      className="flex w-full flex-col items-start gap-0.5 rounded-lg px-2 py-2.5 text-left transition-all duration-150 hover:bg-[#ecfdf5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#99f6e4] active:scale-[0.97] disabled:cursor-wait disabled:opacity-60 dark:hover:bg-slate-800"
                    >
                      <span className="text-sm font-semibold text-[#0f172a] dark:text-white">
                        {template.name}
                      </span>
                      {template.category && (
                        <span className="text-xs text-[#475569] dark:text-slate-300">
                          {template.category}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
