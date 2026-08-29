"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, CalendarCheck2, Heart, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePublicClinics } from "@/components/clinic/usePublicClinics";
import { ClinicDetailModal, ClinicDetailSource } from "@/components/clinic/ClinicDetailModal";

export function LandingClinicsShowcase() {
  const { data: clinics, isLoading, isError } = usePublicClinics(9);
  const [selected, setSelected] = useState<ClinicDetailSource | null>(null);

  return (
    <section id="clinicas" data-landing-reveal className="border-y border-slate-200 bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-[88rem] px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Clínicas que já estão aqui
          </h2>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            Conheça as clínicas com perfil público no Cliniq — e, se você é paciente,
            solicite sua consulta pelo portal.
          </p>
        </div>

        {isLoading && (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-40 rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && (isError || !clinics || clinics.length === 0) && (
          <p className="mx-auto mt-12 max-w-md rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            {isError
              ? "Não foi possível carregar as clínicas agora. Tente novamente em instantes."
              : "Ainda não há clínicas com perfil público. Em breve novas clínicas por aqui."}
          </p>
        )}

        {!isLoading && !isError && clinics && clinics.length > 0 && (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clinics.map((clinic) => {
              const location = [clinic.city, clinic.state].filter(Boolean).join(" - ");
              return (
                <button
                  key={clinic.id}
                  type="button"
                  onClick={() => clinic.slug && setSelected({ mode: "public", slug: clinic.slug })}
                  className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-100"
                >
                  <div className="flex items-center gap-3">
                    {clinic.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={clinic.logoUrl}
                        alt=""
                        className="h-11 w-11 rounded-xl border border-slate-100 object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                        <Building2 size={20} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-950 transition-colors group-hover:text-teal-700">
                        {clinic.displayName}
                      </p>
                      {location && (
                        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={11} />
                          {location}
                        </p>
                      )}
                    </div>
                  </div>

                  {clinic.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {clinic.categories.slice(0, 3).map((category) => (
                        <span
                          key={category.id}
                          className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex items-center gap-4 text-xs font-semibold text-slate-500">
                    {clinic.likeCount > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Heart size={12} className="text-rose-500" />
                        {clinic.likeCount}
                      </span>
                    )}
                    {clinic.acceptsAppointmentRequests && (
                      <span className="inline-flex items-center gap-1 text-teal-700">
                        <CalendarCheck2 size={12} />
                        Agenda online
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-slate-500">
          É paciente de uma delas?{" "}
          <Link href="/paciente/login" className="font-semibold text-teal-700 hover:text-teal-600">
            Acesse o portal do paciente
          </Link>
        </p>
      </div>

      <ClinicDetailModal source={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
