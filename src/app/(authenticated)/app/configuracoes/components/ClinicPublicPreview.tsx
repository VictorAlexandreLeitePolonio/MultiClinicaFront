"use client";

import { Building2, Globe, Lock } from "lucide-react";

interface Props {
  displayName: string;
  description: string;
  logoUrl: string;
  primaryColor: string;
  isPublic: boolean;
  city: string;
  state: string;
}

/** Prévia compacta do perfil público (não substitui a página pública real /clinicas/[slug]). */
export function ClinicPublicPreview({
  displayName,
  description,
  logoUrl,
  primaryColor,
  isPublic,
  city,
  state,
}: Props) {
  const accent = /^#([A-Fa-f0-9]{6})$/.test(primaryColor) ? primaryColor : "#14b8a6";
  const location = [city, state].filter(Boolean).join(" / ");

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d7f3ea] dark:border-slate-700">
      <div className="h-16" style={{ backgroundColor: accent }} />
      <div className="space-y-3 p-4">
        <div className="-mt-10 flex items-end gap-3">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-[#d7f3ea] bg-white dark:border-slate-700 dark:bg-slate-900">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Building2 size={24} className="text-[#0f766e]" />
            )}
          </div>
          <span
            className={`mb-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              isPublic ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            {isPublic ? <Globe size={12} /> : <Lock size={12} />}
            {isPublic ? "Público" : "Privado"}
          </span>
        </div>
        <div>
          <p className="font-bold text-[#0f172a] dark:text-white">{displayName || "Nome da clínica"}</p>
          {location && <p className="text-sm text-[#64748b] dark:text-slate-400">{location}</p>}
        </div>
        <p className="line-clamp-3 text-sm text-[#475569] dark:text-slate-300">
          {description || "A descrição da clínica aparecerá aqui."}
        </p>
      </div>
    </div>
  );
}
