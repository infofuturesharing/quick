"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import GoogleMap from "@/components/google-map"
import { useLanguage } from "@/lib/language-context"
import { PinVisibilityProvider } from "@/lib/pin-visibility-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Review {
  author_name: string
  rating: number
  text: string
  time: number
}

interface Business {
  place_id: string
  name: string
  formatted_address: string
  formatted_phone_number?: string
  international_phone_number?: string
  website?: string
  rating?: number
  user_ratings_total?: number
  reviews?: Review[]
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

export default function MapPage() {
  const { t } = useLanguage()
  const params = useSearchParams()
  const location = params.get("location") || ""
  const keyword = params.get("keyword") || ""
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!location.trim() || !keyword.trim()) {
        setError(t.errorBothFields)
        return
      }
      setLoading(true)
      setError("")
      try {
        const defaultRadiusMeters = 3000
        const response = await fetch(
          `/api/places?location=${encodeURIComponent(location)}&keyword=${encodeURIComponent(keyword)}&radius=${defaultRadiusMeters}`,
        )
        const data = await response.json()
        if (!response.ok) {
          setError(typeof data?.error === "string" ? data.error : t.errorMessage)
          return
        }
        setBusinesses(Array.isArray(data.results) ? data.results : [])
      } catch (e) {
        setError(t.errorMessage)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, keyword])

  const sorted = useMemo(() => {
    const arr = [...businesses]
    arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    return arr
  }, [businesses])

  return (
    <PinVisibilityProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-cyan-500/10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/search" className="text-cyan-300 hover:text-cyan-200">
                ← Aramaya dön
              </Link>
              <div className="text-cyan-100/70 text-sm">
                {location} • {keyword}
              </div>
            </div>
            <div className="text-cyan-100/60 text-xs">Harita yeni sekmede görüntüleniyor</div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 mb-4">{error}</div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[500px] lg:h-[calc(100vh-220px)]">
              <GoogleMap
                businesses={sorted}
                selectedPlaceId={selectedPlaceId}
                onMarkerClick={(placeId) => setSelectedPlaceId(placeId)}
              />
            </div>
            <div className="lg:col-span-1 space-y-3 lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-2 scrollbar-thin scrollbar-thumb-cyan-500/20">
              <Card className="bg-white/[0.03] border border-cyan-500/15 p-3">
                <div className="text-sm text-cyan-100/70 mb-2">Numaraya göre mekan isimleri</div>
                <div className="space-y-1">
                  {sorted.map((b, idx) => (
                    <div
                      key={b.place_id}
                      className={`w-full text-left px-2 py-2 rounded-md ${
                        selectedPlaceId === b.place_id ? "bg-cyan-500/10 border border-cyan-400/40" : ""
                      }`}
                      title={b.name}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-cyan-50 text-sm truncate">{b.name}</span>
                      </span>
                    </div>
                  ))}
                  {sorted.length === 0 && !loading && (
                    <div className="text-xs text-cyan-100/60">Sonuç yok</div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {!loading && sorted.length === 0 && (
            <div className="text-center py-10 text-cyan-100/60 text-sm">
              Konum ve anahtar kelime ile arama yapın.
            </div>
          )}
        </div>
      </div>
    </PinVisibilityProvider>
  )
}