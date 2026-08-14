'use client'

import { Building2 } from 'lucide-react'
import { DEFAULT_TENANT_THEME, isValidHexColor } from '@/utils/tenant'

interface ClinicThemePreviewProps {
  displayName: string
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

export function ClinicThemePreview({
  displayName,
  logoUrl,
  primaryColor,
  secondaryColor,
  accentColor,
}: ClinicThemePreviewProps) {
  const primary = isValidHexColor(primaryColor)
    ? primaryColor
    : DEFAULT_TENANT_THEME.primaryColor
  const secondary = isValidHexColor(secondaryColor)
    ? secondaryColor
    : DEFAULT_TENANT_THEME.secondaryColor
  const accent = isValidHexColor(accentColor)
    ? accentColor
    : DEFAULT_TENANT_THEME.accentColor

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d7f3ea] bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div
        className="flex items-center gap-3 p-4 text-white"
        style={{ backgroundColor: secondary }}
      >
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white/15">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="h-full w-full object-contain"
            />
          ) : (
            <Building2 size={20} />
          )}
        </div>
        <span className="truncate font-semibold">
          {displayName || 'Nome da clínica'}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div
          className="h-2 rounded-full"
          style={{ backgroundColor: primary }}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-[#0f172a] dark:text-white">
            Exemplo de destaque
          </span>
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: accent }}
          >
            Ativo
          </span>
        </div>
      </div>
    </div>
  )
}
