"use client";

import Image from "next/image";
import { Building2, MapPin } from "lucide-react";
import { ClinicLikeButton } from "@/components/ClinicLikeButton";
import { MarketplaceClinicCard as MarketplaceClinicCardType } from "../types/marketplace.types";

interface Props {
  clinic: MarketplaceClinicCardType;
  onSelect: (id: number) => void;
}

export function MarketplaceClinicCard({ clinic, onSelect }: Props) {
  const location = [clinic.city, clinic.state].filter(Boolean).join(" / ");

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#d7f3ea] bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#14b8a6] hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <button
        type="button"
        onClick={() => onSelect(clinic.id)}
        aria-label={`Ver detalhes de ${clinic.displayName}`}
        className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#99f6e4]/70"
      />
      <div className="relative h-32 bg-[#ecfdf5] dark:bg-slate-800">
        {clinic.coverUrl ? (
          <Image src={clinic.coverUrl} alt="" fill unoptimized className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[#0f766e] dark:text-[#67e8f9]">
            <Building2 size={34} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-bold text-[#0f172a] group-hover:text-[#0f766e] dark:text-white">
            {clinic.displayName}
          </h2>
          <div className="relative z-20">
            <ClinicLikeButton
              clinicId={clinic.id}
              likeCount={clinic.likeCount}
              likedByMe={clinic.likedByMe}
              canLike
            />
          </div>
        </div>
        {clinic.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {clinic.categories.map((category) => (
              <span
                key={category.id}
                className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-xs font-medium text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748b] dark:text-slate-400">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin size={13} />
              {location}
            </span>
          )}
          {clinic.acceptsAppointmentRequests && (
            <span className="rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              Aceita solicitações
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
