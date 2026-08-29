"use client";

import { MapPin } from "lucide-react";
import { ClinicAddress as ClinicAddressType } from "@/types";

interface Props {
  address: ClinicAddressType;
  latitude: number | null;
  longitude: number | null;
}

export function ClinicAddress({ address, latitude, longitude }: Props) {
  const line1 = [address.rua, address.numero].filter(Boolean).join(", ");
  const line2 = [address.bairro, address.cidade].filter(Boolean).join(" - ");
  const line3 = [address.estado, address.cep].filter(Boolean).join(" · ");
  const hasAddress = line1 || line2 || line3;
  const hasCoords = latitude != null && longitude != null;

  if (!hasAddress && !hasCoords) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Endereço</h2>
      <div className="flex items-start gap-2 rounded-2xl border border-[#d7f3ea] bg-white p-4 text-sm text-[#475569] shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <MapPin size={16} className="mt-0.5 shrink-0 text-[#0f766e]" />
        <div>
          {line1 && <p>{line1}</p>}
          {line2 && <p>{line2}</p>}
          {line3 && <p>{line3}</p>}
        </div>
      </div>
    </section>
  );
}
