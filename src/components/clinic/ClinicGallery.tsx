"use client";

import Image from "next/image";

export function ClinicGallery({ images }: { images: string[] }) {
  if (images.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Galeria</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative h-32 overflow-hidden rounded-xl border border-[#d7f3ea] dark:border-slate-700 sm:h-40"
          >
            <Image src={url} alt={`Imagem ${index + 1}`} fill className="object-cover" unoptimized />
          </div>
        ))}
      </div>
    </section>
  );
}
