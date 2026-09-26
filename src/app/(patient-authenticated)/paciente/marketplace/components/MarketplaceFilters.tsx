"use client";

import { useState } from "react";
import { Popover } from "radix-ui";
import { ChevronDown } from "lucide-react";
import { MarketplaceCategory, MarketplaceClinicFilters } from "../types/marketplace.types";

interface Props {
  filters: MarketplaceClinicFilters;
  search: string;
  city: string;
  state: string;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  categories: MarketplaceCategory[];
  onSearchChange: (value: string) => void;
  onChange: (patch: Partial<MarketplaceClinicFilters>) => void;
}

const inputClass =
  "rounded-xl border border-[#d7f3ea] bg-white px-3 py-2 text-sm text-[#0f172a] focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/40 dark:border-slate-800 dark:bg-slate-900 dark:text-white";

export function MarketplaceFilters({ filters, search, city, state, categories, onSearchChange, onCityChange, onStateChange, onChange }: Props) {
  const selectedCategories = filters.categoryIds ?? [];
  const [categorySearch, setCategorySearch] = useState("");
  const visibleCategories = categories.filter((category) =>
    `${category.name} ${category.slug}`
      .toLocaleLowerCase()
      .includes(categorySearch.trim().toLocaleLowerCase()),
  );

  const toggleCategory = (categoryId: number) => {
    onChange({
      categoryIds: selectedCategories.includes(categoryId)
        ? selectedCategories.filter((id) => id !== categoryId)
        : [...selectedCategories, categoryId],
    });
  };

  return (
    <section className="space-y-4 rounded-2xl border border-[#d7f3ea] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          aria-label="Buscar clínicas"
          placeholder="Buscar clínica"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className={`${inputClass} sm:col-span-2`}
        />
        <input
          aria-label="Cidade"
          placeholder="Cidade"
          value={city}
          onChange={(event) => onCityChange(event.target.value)}
          className={inputClass}
        />
        <input
          aria-label="UF"
          placeholder="UF"
          maxLength={2}
          value={state}
          onChange={(event) => onStateChange(event.target.value.toUpperCase())}
          className={inputClass}
        />
      </div>

      {categories.length > 0 && (
        <Popover.Root onOpenChange={() => setCategorySearch("")}>
          <Popover.Trigger asChild>
            <button type="button" className={`${inputClass} flex w-full items-center justify-between gap-3 sm:w-72`}>
              {selectedCategories.length > 0 ? `Categorias (${selectedCategories.length} selecionadas)` : "Todas as categorias"}
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              aria-label="Categorias"
              align="start"
              sideOffset={6}
              className="z-50 w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] rounded-xl border border-[#d7f3ea] bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <input
                type="search"
                aria-label="Buscar categoria"
                placeholder="Buscar categoria"
                value={categorySearch}
                onChange={(event) => setCategorySearch(event.target.value)}
                className={`${inputClass} mb-2 w-full`}
              />
              <fieldset className="max-h-60 overflow-y-auto overscroll-contain">
                <legend className="sr-only">Selecione as categorias</legend>
                {visibleCategories.map((category) => (
                  <label key={category.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-[#475569] hover:bg-[#ecfdf5] dark:text-slate-300 dark:hover:bg-slate-800">
                    <input type="checkbox" checked={selectedCategories.includes(category.id)} onChange={() => toggleCategory(category.id)} />
                    {category.name}
                  </label>
                ))}
                {visibleCategories.length === 0 && <p role="status" className="px-2 py-3 text-sm text-[#475569] dark:text-slate-300">Nenhuma categoria encontrada.</p>}
              </fieldset>
              {selectedCategories.length > 0 && (
                <button type="button" onClick={() => onChange({ categoryIds: [] })} className={`${inputClass} mt-2 w-full`}>
                  Limpar seleção
                </button>
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-[#475569] dark:text-slate-300">
          <input
            type="checkbox"
            checked={filters.acceptsAppointmentRequests === true}
            onChange={(event) => onChange({ acceptsAppointmentRequests: event.target.checked || undefined })}
          />
          Aceita solicitações online
        </label>
        <label className="flex items-center gap-2 text-sm text-[#475569] dark:text-slate-300">
          <input
            type="checkbox"
            checked={filters.likedOnly === true}
            onChange={(event) => onChange({ likedOnly: event.target.checked || undefined })}
          />
          Somente curtidas
        </label>
        <select
          aria-label="Ordenação"
          value={filters.sort ?? "MostLiked"}
          onChange={(event) =>
            onChange({ sort: event.target.value as MarketplaceClinicFilters["sort"] })
          }
          className={`${inputClass} ml-auto`}
        >
          <option value="MostLiked">Mais curtidas</option>
          <option value="NameAsc">Nome A-Z</option>
          <option value="NameDesc">Nome Z-A</option>
        </select>
      </div>
    </section>
  );
}
