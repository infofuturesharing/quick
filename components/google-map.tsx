"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Globe } from "lucide-react"
import { usePinVisibility } from "@/lib/pin-visibility-context"
import { Skeleton } from "@/components/ui/skeleton"

interface Business {
  place_id: string
  name: string
  formatted_address?: string
  formatted_phone_number?: string
  international_phone_number?: string
  website?: string
  rating?: number
  user_ratings_total?: number
  types?: string[]
  opening_hours?: { weekday_text?: string[] }
  address_components?: { long_name: string; short_name: string; types: string[] }[]
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
}

interface GoogleMapProps {
  businesses: Business[]
  selectedPlaceId: string | null
  onMarkerClick: (placeId: string | null) => void
}

declare global {
  interface Window {
    google: any
    initGoogleMaps?: () => void
  }
}

export default function GoogleMap({ businesses, selectedPlaceId, onMarkerClick }: GoogleMapProps) {
  const { t } = useLanguage()
  const { activePlaceId, debouncedSelect, transitionDurationMs } = usePinVisibility()

  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scriptLoadedRef = useRef(false)
  const markersMapRef = useRef<Record<string, any>>({})
  const glowCircleRef = useRef<any | null>(null)
  const markerLibRef = useRef<{ AdvancedMarkerElement: any; PinElement: any } | null>(null)

  // Singleton promise to avoid loading Google Maps script multiple times
  const mapsApiPromiseRef = useRef<Promise<void> | null>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error("[v0] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set")
      setError("Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to environment variables.")
      return
    }

    // If already loaded, mark as loaded
    if (window.google && window.google.maps) {
      console.log("[v0] Google Maps already loaded")
      setIsLoaded(true)
      return
    }

    // Guard: if a script tag already exists, consider it loading/loaded
    const existingScript = document.querySelector(
      'script[src^="https://maps.googleapis.com/maps/api/js"]'
    ) as HTMLScriptElement | null
    if (existingScript) {
      console.log("[v0] Existing Google Maps script tag detected")
      // Assume it will load shortly
      scriptLoadedRef.current = true
      existingScript.addEventListener("load", () => setIsLoaded(true))
      return
    }

    if (scriptLoadedRef.current) {
      console.log("[v0] Google Maps script already loading")
      return
    }

    scriptLoadedRef.current = true
    console.log("[v0] Loading Google Maps script...")

    mapsApiPromiseRef.current = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`
      script.async = true
      script.defer = true

      script.onload = () => {
        console.log("[v0] Google Maps script loaded successfully!")
        setIsLoaded(true)
        setError(null)
        resolve()
      }

      script.onerror = (e) => {
        console.error("[v0] Failed to load Google Maps script:", e)
        setError("Failed to load Google Maps. Please check your API key and internet connection.")
        scriptLoadedRef.current = false
        reject(e)
      }

      document.head.appendChild(script)
    })

    return () => {
      // Do not remove the script; keeping it avoids multiple inclusions
    }
  }, [])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) {
      return
    }

    if (googleMapRef.current) {
      return // Already initialized
    }

    console.log("[v0] Initializing Google Map instance")

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: { lat: 41.0082, lng: 28.9784 },
        mapId: "DEMO_MAP_ID",
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#1a1a2e" }],
          },
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#8b9bb4" }],
          },
          {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#0a0a0f" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#0f1419" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#2a2a3e" }],
          },
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      })

      googleMapRef.current = map
      // Clear selection when clicking on the map background
      googleMapRef.current.addListener("click", () => {
        onMarkerClick(null)
      })
      console.log("[v0] Map initialized successfully!")
    } catch (err) {
      console.error("[v0] Error initializing map:", err)
      setError("Failed to initialize map")
    }
  }, [isLoaded])

  // Create markers when businesses change
  useEffect(() => {
    if (!googleMapRef.current || !window.google) {
      return
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      try {
        // Advanced marker hide
        marker.map = null
      } catch {
        try { marker.setMap(null) } catch {}
      }
    })
    markersRef.current = []
    markersMapRef.current = {}

    const bounds = new window.google.maps.LatLngBounds()

    // Import Advanced Marker library once per render cycle
    const createAll = async () => {
      const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker")
      markerLibRef.current = { AdvancedMarkerElement, PinElement }

      businesses.forEach((business, idx) => {
        const position = {
          lat: business.geometry.location.lat,
          lng: business.geometry.location.lng,
        }

        // Default pin shows list number on every marker
        const defaultPin = new PinElement({
          background: "#3b82f6",
          borderColor: "#ffffff",
          glyphColor: "#081b26",
          scale: 1.1,
          glyph: (idx + 1).toString(),
        })
        const marker = new AdvancedMarkerElement({
          position,
          title: business.name,
          map: googleMapRef.current,
          content: defaultPin.element,
        })

        // Prepare a readable overlay above the pin showing list number and ID; phone shown below
        const phone = business.formatted_phone_number?.trim()
        const idText = business.place_id || ""
        const numText = `#${idx + 1}`
        const content = `
          <div style="display:flex;flex-direction:column;gap:6px;max-width:260px;">
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:10px;background:rgba(6,182,212,0.15);color:#081b26;font-size:13px;font-weight:700;border:1px solid rgba(6,182,212,0.45);">
              ${numText} • ID: ${idText}
            </div>
            ${phone
              ? `<a href="tel:${phone}" style="display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:10px;background:rgba(255,255,255,0.08);color:#e6faff;font-size:12px;text-decoration:none;border:1px solid rgba(6,182,212,0.35);backdrop-filter:saturate(120%) blur(2px);">📞 ${phone}</a>`
              : `<span style="display:inline-flex;align-items:center;padding:4px 8px;border-radius:10px;background:rgba(255,255,255,0.06);color:#cfe8ff;font-size:12px;border:1px solid rgba(148,163,184,0.25);">Telefon yok</span>`}
          </div>
        `
        const info = new window.google.maps.InfoWindow({
          content,
          disableAutoPan: true,
          pixelOffset: new window.google.maps.Size(0, -30),
        })

        marker.addListener("click", () => {
          debouncedSelect(business.place_id)
          onMarkerClick(business.place_id)
        })
        marker.addListener("dblclick", () => {
          onMarkerClick(null)
        })
        // Touch devices support
        marker.addListener("touchend", () => {
          debouncedSelect(business.place_id)
          onMarkerClick(business.place_id)
        })

        markersRef.current.push(marker)
        markersMapRef.current[business.place_id] = { marker, index: idx, phone: business.formatted_phone_number || "", info, defaultPin }
        bounds.extend(position)
      })

      if (businesses.length === 1) {
        const b = businesses[0]
        googleMapRef.current.setCenter({ lat: b.geometry.location.lat, lng: b.geometry.location.lng })
        googleMapRef.current.setZoom(16)
      } else if (businesses.length > 0) {
        googleMapRef.current.fitBounds(bounds)
      }
    }

    createAll()
  }, [businesses, onMarkerClick])

  // Helper: show marker with a quick drop + fade, hide instantly
  const showMarker = (marker: any) => {
    try {
      marker.map = googleMapRef.current
    } catch {}
  }
  const hideMarker = (marker: any) => {
    try {
      marker.map = null
    } catch {}
  }

  // Update marker styles and visibility when selection changes
  useEffect(() => {
    if (!window.google) return

    const prevAndNext = Object.entries(markersMapRef.current)
    prevAndNext.forEach(([placeId, { marker, index, info, defaultPin }]) => {
      const isSelected = selectedPlaceId === placeId
      if (isSelected) {
        // Replace pin content with a highlighted pin showing row number
        try {
          const PinElement = markerLibRef.current?.PinElement
          if (PinElement) {
            const selectedPin = new PinElement({
              background: "#06b6d4",
              borderColor: "#ffffff",
              glyphColor: "#081b26",
              scale: 1.2,
              glyph: (index + 1).toString(),
            })
            marker.content = selectedPin.element
          }
        } catch {}
        showMarker(marker)
        try {
          info?.open(googleMapRef.current, marker)
        } catch {}
      } else {
        try { info?.close() } catch {}
        // Restore default pin with its number and keep marker visible
        try {
          if (defaultPin) {
            marker.content = defaultPin.element
          }
        } catch {}
        showMarker(marker)
      }
    })

    // Recentering on selection
    if (selectedPlaceId) {
      const selected = businesses.find((b) => b.place_id === selectedPlaceId)
      if (selected && googleMapRef.current) {
        googleMapRef.current.setCenter({
          lat: selected.geometry.location.lat,
          lng: selected.geometry.location.lng,
        })
        googleMapRef.current.setZoom(16)
        // Add/update glow circle around the selected marker
        try {
          if (glowCircleRef.current) {
            glowCircleRef.current.setMap(null)
            glowCircleRef.current = null
          }
          glowCircleRef.current = new window.google.maps.Circle({
            map: googleMapRef.current,
            center: { lat: selected.geometry.location.lat, lng: selected.geometry.location.lng },
            radius: 60,
            strokeColor: "#06b6d4",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#06b6d4",
            fillOpacity: 0.15,
          })
        } catch {}
      }
    } else {
      // Clear glow when nothing is selected
      try {
        if (glowCircleRef.current) {
          glowCircleRef.current.setMap(null)
          glowCircleRef.current = null
        }
      } catch {}
    }
  }, [selectedPlaceId, businesses, transitionDurationMs])

  if (error) {
    return (
      <div className="relative w-full h-full rounded-xl border border-red-500/30 shadow-lg overflow-hidden bg-[#0f0f1a]">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-red-400 text-sm mb-2">{t.mapError}</div>
          <div className="text-cyan-100/60 text-xs">{error}</div>
          <div className="text-cyan-100/40 text-xs mt-4">Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in the Vars section</div>
        </div>
      </div>
    )
  }

  const selectedBusiness = useMemo(() => {
    if (!selectedPlaceId) return null
    return businesses.find((b) => b.place_id === selectedPlaceId) || null
  }, [selectedPlaceId, businesses])

  return (
    <div
      className="relative w-full h-full rounded-xl border border-cyan-500/20 shadow-lg overflow-hidden bg-[#0f0f1a]"
      style={{ ["--pin-transition-duration" as any]: `${transitionDurationMs}ms` }}
    >
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f0f1a] z-10">
          <div className="w-[90%] max-w-[360px] space-y-3">
            <Skeleton className="h-6 w-2/3 bg-white/10" />
            <Skeleton className="h-10 w-full bg-white/10" />
            <Skeleton className="h-10 w-5/6 bg-white/10" />
          </div>
        </div>
      )}

      {selectedBusiness && (
        <div className="absolute bottom-3 left-3 right-3 lg:right-auto lg:w-[360px] z-20">
          <div className="bg-white/5 backdrop-blur-md border border-cyan-500/20 rounded-xl p-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm text-cyan-100/60">Seçili İşletme</div>
                <div className="text-cyan-50 font-bold text-lg">{selectedBusiness.name}</div>
                {selectedBusiness.types && (
                  <div className="text-xs text-cyan-100/70 mt-1">{selectedBusiness.types.slice(0,2).join(" • ")}</div>
                )}
                <div className="text-[12px] text-cyan-100/60 mt-1">
                  {selectedBusiness.formatted_address}
                  {(() => {
                    const comp = selectedBusiness.address_components?.find((c) => c.types.includes("postal_code"))
                    return comp ? `, ${comp.long_name}` : ""
                  })()}
                </div>
                <div className="text-xs text-cyan-100/70 mt-1">
                  {typeof selectedBusiness.rating === 'number' ? `Puan: ${selectedBusiness.rating}` : "Puan yok"}
                  {typeof selectedBusiness.user_ratings_total === 'number' ? ` • Yorum: ${selectedBusiness.user_ratings_total}` : ""}
                </div>
              </div>
              <button
                aria-label="Close"
                className="text-cyan-100/70 hover:text-cyan-300 transition-colors"
                onClick={() => onMarkerClick(null)}
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <Button
                className="w-full justify-start gap-2 px-4 py-3 rounded-xl border border-cyan-500/20 bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-400/40 text-cyan-50 min-h-[44px] shadow-sm"
                disabled={!selectedBusiness.formatted_phone_number?.trim()}
                onClick={() => {
                  if (selectedBusiness.formatted_phone_number) {
                    window.location.href = `tel:${selectedBusiness.formatted_phone_number}`
                  }
                }}
                aria-label="Ara"
                title="Ara"
              >
                <Phone className="w-4 h-4 text-cyan-300" />
                <span className="text-sm">
                  {selectedBusiness.formatted_phone_number || "Telefon yok"}
                </span>
              </Button>
              <Button
                className="w-full justify-start gap-2 px-4 py-3 rounded-xl border border-cyan-500/20 bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-400/40 text-cyan-50 min-h-[44px] shadow-sm"
                disabled={!selectedBusiness.formatted_address?.trim()}
                onClick={() => {
                  if (selectedBusiness.formatted_address) {
                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBusiness.formatted_address)}`
                    window.open(url, "_blank")
                  }
                }}
                aria-label="Haritada Aç"
                title="Haritada Aç"
              >
                <MapPin className="w-4 h-4 text-cyan-300" />
                <span className="text-sm">
                  {selectedBusiness.formatted_address || "Adres yok"}
                </span>
              </Button>
              <Button
                className="w-full justify-start gap-2 px-4 py-3 rounded-xl border border-cyan-500/20 bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-400/40 text-cyan-50 min-h-[44px] shadow-sm truncate"
                disabled={!selectedBusiness.website?.trim()}
                onClick={() => {
                  if (selectedBusiness.website) {
                    window.open(selectedBusiness.website, "_blank")
                  }
                }}
                aria-label="Web Sitesi"
                title="Web Sitesi"
              >
                <Globe className="w-4 h-4 text-cyan-300" />
                <span className="text-sm truncate">
                  {selectedBusiness.website || "Web sitesi yok"}
                </span>
              </Button>
              <div className="rounded-lg overflow-hidden border border-cyan-500/20">
                <iframe
                  title="Mini Harita"
                  width="100%"
                  height="140"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${selectedBusiness.geometry.location.lat},${selectedBusiness.geometry.location.lng}&z=16&output=embed`}
                />
              </div>
              {selectedBusiness.opening_hours?.weekday_text && (
                <div className="mt-2 p-2 rounded-md border border-cyan-500/20 bg-white/5 text-xs text-cyan-100/80">
                  {selectedBusiness.opening_hours.weekday_text.map((line: string, i: number) => (
                    <div key={`hours-${i}`}>{line}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
