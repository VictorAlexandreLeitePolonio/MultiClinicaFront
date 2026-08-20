"use client";

import Link from "next/link";
import Image from "next/image";
import { Building2, MapPin } from "lucide-react";
import { PatientClinic } from "@/types";
import { ClinicLikeButton } from "@/components/ClinicLikeButton";

function location(clinic: PatientClinic) {
  return [clinic.city, clinic.state].filter(Boolean).join(" / ");
}

/** Cartão de clínica vinculada — navega para o perfil público /clinicas/{slug}. */
export function ClinicCard({ clinic }: { clinic: PatientClinic }) {
  const content = (
    <article className="group h-full overflow-hidden rounded-2xl border border-[#d7f3ea] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#a7f3d0] hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="relative h-24 bg-[#ecfdf5] dark:bg-slate-800">
        {clinic.coverUrl && (
          <Image src={clinic.coverUrl} alt="" fill className="object-cover" unoptimized />
        )}
        <div className="absolute -bottom-6 left-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-[#d7f3ea] bg-white dark:border-slate-700 dark:bg-slate-900">
          {clinic.logoUrl ? (
            <Image src={clinic.logoUrl} alt="" width={48} height={48} className="object-cover" unoptimized />
          ) : (
            <Building2 size={22} className="text-[#0f766e] dark:text-[#67e8f9]" />
          )}
        </div>
      </div>

      <div className="space-y-2 p-4 pt-8">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[#0f172a] dark:text-white">
            {clinic.displayName ?? "Clínica"}
          </h3>
          <ClinicLikeButton
            clinicId={clinic.id}
            likeCount={clinic.likeCount}
            likedByMe={clinic.likedByMe}
            canLike
            size={14}
          />
        </div>

        {clinic.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {clinic.categories.map((category) => (
              <span
                key={category}
                className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-xs font-medium text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {location(clinic) && (
          <p className="flex items-center gap-1.5 text-sm text-[#64748b] dark:text-slate-300">
            <MapPin size={14} />
            {location(clinic)}
          </p>
        )}
      </div>
    </article>
  );

  if (!clinic.slug) return content;
  return (
    <Link href={`/clinicas/${clinic.slug}`} className="block h-full">
      {content}
    </Link>
  );
}
