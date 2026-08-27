"use client";

import { MarketplaceCategory, MarketplaceClinicFilters } from "../types/marketplace.types";

interface Props {
  filters: MarketplaceClinicFilters;
  search: string;
  categories: MarketplaceCategory[];
  onSearchChange: (value: string) => void;
  onChange: (patch: Partial<MarketplaceClinicFilters>) => void;
}

const inputClass =
  "rounded-xl border border-[#d7f3ea] bg-white px-3 py-2 text-sm text-[#0f172a] focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/40 dark:border-slate-800 dark:bg-slate-900 dark:text-white";

export function MarketplaceFilters({ filters, search, categories, onSearchChange, onChange }: Props) {
  const selectedCategories = filters.categoryIds ?? [];

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
          value={filters.city ?? ""}
          onChange={(event) => onChange({ city: event.target.value || undefined })}
          className={inputClass}
        />
        <input
          aria-label="UF"
          placeholder="UF"
          maxLength={2}
          value={filters.state ?? ""}
          onChange={(event) => onChange({ state: event.target.value.toUpperCase() || undefined })}
          className={inputClass}
        />
      </div>

      {categories.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-[#0f172a] dark:text-white">Categorias</legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-[#d7f3ea] px-3 py-1.5 text-xs text-[#475569] dark:border-slate-700 dark:text-slate-300"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                />
                {category.name}
              </label>
            ))}
          </div>
        </fieldset>
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
