"use client";

import Image from "next/image";
import { Building2, MapPin } from "lucide-react";
import { PublicClinic } from "@/types";
import { ClinicLikeButton } from "@/components/ClinicLikeButton";
import { usePatientAuth } from "@/contexts/PatientAuthContext";

function location(clinic: PublicClinic) {
  return [clinic.address.cidade, clinic.address.estado].filter(Boolean).join(" / ");
}

export function ClinicPublicHeader({ clinic }: { clinic: PublicClinic }) {
  const { isAuthenticated } = usePatientAuth();

  return (
    <header className="overflow-hidden rounded-2xl border border-[#d7f3ea] bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="relative h-40 bg-[#ecfdf5] dark:bg-slate-800 sm:h-56">
        {clinic.coverUrl && <Image src={clinic.coverUrl} alt="" fill className="object-cover" unoptimized />}
      </div>

      <div className="px-5 pb-5">
        <div className="-mt-10 flex items-end gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-[#d7f3ea] bg-white dark:border-slate-700 dark:bg-slate-900">
            {clinic.logoUrl ? (
              <Image src={clinic.logoUrl} alt="" width={80} height={80} className="object-cover" unoptimized />
            ) : (
              <Building2 size={34} className="text-[#0f766e] dark:text-[#67e8f9]" />
            )}
          </div>
          <div className="mb-1">
            <ClinicLikeButton
              clinicId={clinic.id}
              likeCount={clinic.likeCount}
              canLike={isAuthenticated}
              size={18}
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <h1 className="text-2xl font-bold text-[#0f172a] dark:text-white">
            {clinic.displayName ?? "Clínica"}
          </h1>
          {location(clinic) && (
            <p className="flex items-center gap-1.5 text-sm text-[#64748b] dark:text-slate-300">
              <MapPin size={15} />
              {location(clinic)}
            </p>
          )}
          {clinic.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {clinic.categories.map((category) => (
                <span
                  key={category.id}
                  className="rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-xs font-medium text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
