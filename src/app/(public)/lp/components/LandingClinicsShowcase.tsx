import Link from "next/link";
import { Building2, CalendarCheck2, Heart, MapPin } from "lucide-react";

interface ShowcaseClinic {
  id: number;
  slug: string | null;
  displayName: string | null;
  logoUrl: string | null;
  city: string | null;
  state: string | null;
  categories: { id: number; name: string; slug: string }[];
  likeCount: number;
  acceptsAppointmentRequests: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5045";

async function fetchShowcase(): Promise<ShowcaseClinic[]> {
  try {
    const response = await fetch(`${API_BASE}/api/public/clinics?limit=9`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    return (await response.json()) as ShowcaseClinic[];
  } catch {
    // API fora do ar não pode derrubar a landing — a seção simplesmente não aparece.
    return [];
  }
}

export async function LandingClinicsShowcase() {
  const clinics = await fetchShowcase();
  if (clinics.length === 0) return null;

  return (
    <section id="clinicas" data-landing-reveal className="border-y border-slate-200 bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-[88rem] px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Clínicas que já estão aqui
          </h2>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            Conheça as clínicas com perfil público no MultiClinica — e, se você é paciente,
            solicite sua consulta pelo portal.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clinics.map((clinic) => {
            const location = [clinic.city, clinic.state].filter(Boolean).join(" - ");
            return (
              <Link
                key={clinic.id}
                href={`/clinicas/${clinic.slug}`}
                className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
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
              </Link>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          É paciente de uma delas?{" "}
          <Link href="/paciente/login" className="font-semibold text-teal-700 hover:text-teal-600">
            Acesse o portal do paciente
          </Link>
        </p>
      </div>
    </section>
  );
}
