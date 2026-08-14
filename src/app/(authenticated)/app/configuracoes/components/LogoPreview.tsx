"use client";

import { useState } from "react";
import { Building2, Info } from "lucide-react";

interface LogoPreviewProps {
  logoUrl: string;
  displayName: string;
}

export function LogoPreview({ logoUrl, displayName }: LogoPreviewProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [ratio, setRatio] = useState<number | null>(null);
  const hasError = failedUrl === logoUrl;
  // Proporção muito diferente de 1:1 fica pequena no cabeçalho quadrado da sidebar.
  const isOffRatio = ratio !== null && (ratio > 1.6 || ratio < 0.625);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-[#a7f3d0] bg-[#f8fffc] p-4 dark:border-slate-700 dark:bg-slate-900">
        {logoUrl && !hasError ? (
          <img
            src={logoUrl}
            alt={displayName || "Logo da clínica"}
            onError={() => setFailedUrl(logoUrl)}
            onLoad={(event) => {
              const img = event.currentTarget;
              if (img.naturalHeight > 0) setRatio(img.naturalWidth / img.naturalHeight);
            }}
            className="max-h-24 max-w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-sm text-[#64748b] dark:text-slate-400">
            <Building2 size={32} />
            <span>Logo padrão</span>
          </div>
        )}
      </div>

      {logoUrl && !hasError && isOffRatio ? (
        <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          <Info size={14} className="mt-0.5 shrink-0" />
          Este logo é bem retangular e vai aparecer pequeno no menu. Para melhor
          encaixe, use uma imagem em proporção próxima de 1:1 (quadrada).
        </p>
      ) : (
        <p className="text-xs text-[#64748b] dark:text-slate-400">
          Ideal: PNG ou SVG com fundo transparente, proporção ~1:1.
        </p>
      )}
    </div>
  );
}
