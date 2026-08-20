"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/utils/apiError";
import { useCategoryCatalog, useClinicCategories, useSetClinicCategories } from "../hooks/useClinicProfile";

interface Props {
  canEdit: boolean;
}

export function ClinicCategoriesSection({ canEdit }: Props) {
  const catalog = useCategoryCatalog();
  const current = useClinicCategories();
  const save = useSetClinicCategories();
  // draft null = ainda sincronizado com o servidor; array = seleção editada localmente.
  const [draft, setDraft] = useState<number[] | null>(null);
  const selected = draft ?? current.data?.map((c) => c.id) ?? [];

  const toggle = (id: number) => {
    if (!canEdit) return;
    setDraft(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  const handleSave = async () => {
    try {
      await save.mutateAsync(selected);
      setDraft(null); // volta a refletir o estado canônico do servidor
      toast.success("Categorias atualizadas.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Não foi possível salvar as categorias."));
    }
  };

  return (
    <section className="space-y-5 rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Categorias</h2>
        <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
          Selecione as especialidades da clínica (catálogo controlado).
        </p>
      </div>

      {catalog.isLoading ? (
        <p className="text-sm text-[#64748b] dark:text-slate-400">Carregando...</p>
      ) : (catalog.data?.length ?? 0) === 0 ? (
        <p className="text-sm text-[#64748b] dark:text-slate-400">Nenhuma categoria disponível no catálogo.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {catalog.data!.map((category) => {
            const active = selected.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                disabled={!canEdit}
                onClick={() => toggle(category.id)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-[#14b8a6] bg-[#14b8a6] text-white"
                    : "border-[#d7f3ea] bg-white text-[#475569] hover:border-[#a7f3d0] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                } ${!canEdit ? "cursor-not-allowed opacity-70" : ""}`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      )}

      {canEdit && (
        <div className="flex justify-end">
          <div className="w-full sm:w-48">
            <Button type="button" loading={save.isPending} onClick={handleSave}>
              Salvar categorias
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
