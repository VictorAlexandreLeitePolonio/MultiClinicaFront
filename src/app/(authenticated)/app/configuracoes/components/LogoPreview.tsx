"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";

interface LogoPreviewProps {
  logoUrl: string;
  displayName: string;
}

export function LogoPreview({ logoUrl, displayName }: LogoPreviewProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const hasError = failedUrl === logoUrl;

  return (
    <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-[#a7f3d0] bg-[#f8fffc] p-4 dark:border-slate-700 dark:bg-slate-900">
      {logoUrl && !hasError ? (
        <img
          src={logoUrl}
          alt={displayName || "Logo da clínica"}
          onError={() => setFailedUrl(logoUrl)}
          className="max-h-24 max-w-full object-contain"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-sm text-[#64748b] dark:text-slate-400">
          <Building2 size={32} />
          <span>Logo padrão</span>
        </div>
      )}
    </div>
  );
}
