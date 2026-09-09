'use client'

import { useEffect, useRef, useState } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'

interface Props {
  latitude: number | null
  longitude: number | null
  displayName: string
  address: string
}

export function ClinicMap({
  latitude,
  longitude,
  displayName,
  address,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  const styleUrl = process.env.NEXT_PUBLIC_MAP_STYLE_URL

  useEffect(() => {
    if (
      latitude === null ||
      longitude === null ||
      !styleUrl ||
      !containerRef.current
    )
      return

    let disposed = false
    let map: import('maplibre-gl').Map | undefined

    void import('maplibre-gl')
      .then((maplibregl) => {
        if (disposed || !containerRef.current) return
        maplibregl.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')
        const createdMap = new maplibregl.Map({
          container: containerRef.current,
          style: styleUrl,
          center: [longitude, latitude],
          zoom: 14,
          scrollZoom: false,
        })
        map = createdMap
        createdMap.addControl(new maplibregl.NavigationControl(), 'top-right')
        new maplibregl.Marker()
          .setLngLat([longitude, latitude])
          .setPopup(
            new maplibregl.Popup({ offset: 18 }).setText(
              address || displayName,
            ),
          )
          .addTo(createdMap)
        createdMap.on('error', () => setFailed(true))
      })
      .catch(() => setFailed(true))

    return () => {
      disposed = true
      map?.remove()
    }
  }, [address, displayName, latitude, longitude, styleUrl])

  if (latitude === null || longitude === null || !styleUrl || failed) {
    return (
      <p className="rounded-2xl border border-[#d7f3ea] bg-white p-4 text-sm text-[#64748b] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Localização no mapa indisponível
      </p>
    )
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`Mapa de ${displayName}`}
      className="h-72 overflow-hidden rounded-2xl border border-[#d7f3ea] dark:border-slate-800"
    />
  )
}
