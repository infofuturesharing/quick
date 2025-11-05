"use client"

import type React from "react"

import { useEffect, useRef, useState, useMemo } from "react"
import { Search, MapPin, Phone, Globe, Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import GoogleMap from "@/components/google-map"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/lib/language-context"
import Link from "next/link"
import { PinVisibilityProvider } from "@/lib/pin-visibility-context"
import { useToast } from "@/hooks/use-toast"

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

export default function SearchPage() {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [location, setLocation] = useState("")
  const [keyword, setKeyword] = useState("")
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const listScrollRef = useRef<HTMLDivElement | null>(null)
  const [fadeIn, setFadeIn] = useState(false)
  const [sortBy, setSortBy] = useState<"rating_desc" | "name_asc" | "reviews_desc">("rating_desc")
  const [filterPhone, setFilterPhone] = useState(false)
  const [filterWebsite, setFilterWebsite] = useState(false)
  type RecentEntry = { location: string; keyword: string; ts: number }
  const [recentSearches, setRecentSearches] = useState<RecentEntry[]>([])

  const filteredSorted = useMemo(() => {
    let arr = [...businesses]
    if (filterPhone) arr = arr.filter((b) => !!b.formatted_phone_number)
    if (filterWebsite) arr = arr.filter((b) => !!b.website)
    switch (sortBy) {
      case "name_asc":
        arr.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "reviews_desc":
        arr.sort((a, b) => (b.reviews?.length ?? 0) - (a.reviews?.length ?? 0))
        break
      case "rating_desc":
      default:
        arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        break
    }
    return arr
  }, [businesses, sortBy, filterPhone, filterWebsite])

  const handleSearch = async () => {
    if (!location.trim() || !keyword.trim()) {
      setError(t.errorBothFields)
      return
    }

    setLoading(true)
    setError("")
    setBusinesses([])
    setSelectedPlaceId(null)

    // Persist recent search
    try {
      const entry: RecentEntry = { location: location.trim(), keyword: keyword.trim(), ts: Date.now() }
      setRecentSearches((prev) => {
        const deduped = [entry, ...prev.filter((e) => e.location !== entry.location || e.keyword !== entry.keyword)]
        const limited = deduped.slice(0, 5)
        localStorage.setItem("qc_recent_searches", JSON.stringify(limited))
        localStorage.setItem("qc_last_search", JSON.stringify(entry))
        return limited
      })

      const defaultRadiusMeters = 3000
      const response = await fetch(
        `/api/places?location=${encodeURIComponent(location)}&keyword=${encodeURIComponent(keyword)}&radius=${defaultRadiusMeters}`,
      )

      const data = await response.json().catch(() => ({ error: t.errorMessage, results: [] }))

      // Show server-provided error even if response status is 200
      if (!response.ok || typeof data?.error === 'string') {
        setError(typeof data?.error === 'string' ? data.error : t.errorMessage)
        setBusinesses([])
        return
      }

      setBusinesses(Array.isArray(data.results) ? data.results : [])

      // Warn if API indicates incomplete records were filtered out
      try {
        const incompleteCount = Number(data?.meta?.incomplete_count ?? 0)
        if (incompleteCount > 0) {
          toast({
            title: "Eksik veri tespit edildi",
            description: `${incompleteCount} kayıt detay/konum olmadan geldi; eşleşme sorunları olabilir.`,
          })
        }
      } catch (_) {
        // noop
      }

      if ((!data.results || data.results.length === 0) && !data.error) {
        setError(t.noResults)
      }
    } catch (err) {
      console.error(err)
      setError(t.errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleBusinessClick = (placeId: string) => {
    // Single-click always selects the clicked business (no toggle to null)
    setSelectedPlaceId(placeId)
    // Auto scroll disabled
  }

  useEffect(() => {
    // Fade in when businesses change
    setFadeIn(false)
    const id = window.requestAnimationFrame(() => setFadeIn(true))
    return () => window.cancelAnimationFrame(id)
  }, [businesses])

  // Load recent searches and last used query on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("qc_recent_searches")
      if (raw) {
        const parsed = JSON.parse(raw) as RecentEntry[]
        if (Array.isArray(parsed)) setRecentSearches(parsed)
      }
      const lastRaw = localStorage.getItem("qc_last_search")
      if (lastRaw) {
        const last = JSON.parse(lastRaw) as RecentEntry
        if (!location && !keyword) {
          setLocation(last.location || "")
          setKeyword(last.keyword || "")
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Automated data validation between map data and business cards
  useEffect(() => {
    if (!filteredSorted || filteredSorted.length === 0) return

    // Missing critical fields
    const missing = filteredSorted.filter(
      (b) => !b.place_id || !b.geometry || !b.geometry.location || typeof b.geometry.location.lat !== "number" || typeof b.geometry.location.lng !== "number",
    )

    if (missing.length > 0) {
      toast({
        title: "Eksik veri tespit edildi",
        description: `${missing.length} kayıt konum/ID bilgisi olmadan geldi. Eşleşme sorunları olabilir.`,
      })
    }

    // Duplicate place_ids
    const idCounts = new Map<string, number>()
    for (const b of filteredSorted) {
      if (!b.place_id) continue
      idCounts.set(b.place_id, (idCounts.get(b.place_id) ?? 0) + 1)
    }
    const duplicates = Array.from(idCounts.entries()).filter(([, c]) => c > 1)
    if (duplicates.length > 0) {
      toast({
        title: "Çakışan ID bulundu",
        description: `${duplicates.length} farklı place_id birden fazla kartta kullanılıyor.`,
      })
    }
  }, [filteredSorted, toast])

  return (
    <PinVisibilityProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
      {/* Header with Search */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-cyan-500/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    QuickContact
                  </h1>
                  <p className="text-cyan-100/60 text-xs">{t.subtitle}</p>
                </div>
              </Link>
              <LanguageSwitcher />
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative group">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60" />
                <Input
                  placeholder={t.locationPlaceholder}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-11 bg-white/5 border-cyan-500/20 text-cyan-50 placeholder:text-cyan-100/40 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300 group-hover:border-cyan-400/40"
                />
              </div>

              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60" />
                <Input
                  placeholder={t.keywordPlaceholder}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-11 bg-white/5 border-cyan-500/20 text-cyan-50 placeholder:text-cyan-100/40 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300 group-hover:border-cyan-400/40"
                />
              </div>

              <Button
                onClick={handleSearch}
                disabled={loading}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold px-8 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.searching}
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    {t.searchButton}
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                {error}
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-cyan-100/60">Son aramalar:</span>
                <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-cyan-500/20">
                  {recentSearches.map((r, i) => (
                    <div
                      key={`${r.location}-${r.keyword}-${r.ts ?? i}`}
                      className="group inline-flex items-center gap-2 text-xs pl-2 pr-1 py-1 rounded-full border border-cyan-500/20 bg-white/5 text-cyan-50 hover:bg-cyan-500/10 hover:border-cyan-400/40 whitespace-nowrap"
                    >
                      <button
                        className="inline-flex items-center gap-1"
                        onClick={() => {
                          setLocation(r.location)
                          setKeyword(r.keyword)
                          handleSearch()
                        }}
                        title={`${r.location} • ${r.keyword}`}
                      >
                        <span className="opacity-80">{r.location}</span>
                        <span className="opacity-60">•</span>
                        <span className="opacity-80">{r.keyword}</span>
                      </button>
                      <button
                        aria-label="Sil"
                        title="Sil"
                        className="rounded-full px-1.5 py-0.5 text-[10px] bg-white/10 hover:bg-white/20 text-cyan-50/80 border border-cyan-500/20"
                        onClick={() => {
                          setRecentSearches((prev) => {
                            const next = prev.filter((_, idx) => idx !== i)
                            localStorage.setItem("qc_recent_searches", JSON.stringify(next))
                            return next
                          })
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="text-[11px] px-2 py-1 rounded-md border border-cyan-500/20 bg-white/5 text-cyan-50 hover:bg-cyan-500/10 hover:border-cyan-400/40"
                  onClick={() => {
                    setRecentSearches([])
                    try { localStorage.removeItem("qc_recent_searches") } catch {}
                  }}
                >
                  Temizle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="container mx-auto px-4 py-8 transition-opacity duration-[400ms]" style={{ opacity: fadeIn ? 1 : 0 }}>
        {businesses.length > 0 && (
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
            {/* Business Cards */}
            <div ref={listScrollRef} className="order-2 lg:order-1 space-y-4 max-h-none lg:max-h-[calc(100vh-250px)] lg:overflow-y-auto lg:pr-2 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
              {/* Advanced Search & Sort */}
              <div className="flex flex-wrap items-center gap-2 bg-white/5 border border-cyan-500/10 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-8 px-3 inline-flex items-center rounded-md border border-cyan-500/20 text-xs text-cyan-100/70 bg-white/5">Sırala</span>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                    <SelectTrigger size="sm" className="w-[220px] bg-white/10 border-cyan-500/20 text-cyan-50 truncate">
                      <SelectValue placeholder="Sırala" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f0f1a] border border-cyan-500/20 text-cyan-50 shadow-lg">
                      <SelectItem value="rating_desc">Puan (yüksekten düşüğe)</SelectItem>
                      <SelectItem value="name_asc">İsim (A→Z)</SelectItem>
                      <SelectItem value="reviews_desc">Yorum sayısı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <label className="inline-flex items-center gap-2 h-8 px-3 rounded-md border border-cyan-500/20 text-xs text-cyan-100/80 bg-white/5">
                  <Checkbox checked={filterPhone} onCheckedChange={(v) => setFilterPhone(!!v)} />
                  Telefon var
                </label>
                <label className="inline-flex items-center gap-2 h-8 px-3 rounded-md border border-cyan-500/20 text-xs text-cyan-100/80 bg-white/5">
                  <Checkbox checked={filterWebsite} onCheckedChange={(v) => setFilterWebsite(!!v)} />
                  Web sitesi var
                </label>
              </div>
              {filteredSorted.map((business, index) => (
                <Card
                  key={business.place_id ?? `${business.name}-${business.geometry.location.lat}-${business.geometry.location.lng}-${index}`}
                  id={`business-${business.place_id}`}
                  className={`bg-white/[0.03] backdrop-blur-sm border border-cyan-500/15 hover:border-cyan-400/40 transition-all duration-300 p-6 ${
                    selectedPlaceId === business.place_id ? "ring-2 ring-cyan-400 border-cyan-400 shadow-[0_0_0_10px_rgba(6,182,212,0.12)]" : ""
                  }`}
                  ref={(el) => {
                    cardRefs.current[business.place_id] = el as HTMLDivElement
                  }}
                >
                  <div className="space-y-4">
                    {/* Business Name & Rating */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-bold text-sm shrink-0">
                          {index + 1}
                        </div>
                        <h3 className="text-xl font-semibold text-cyan-50 text-balance">{business.name}</h3>
                      </div>
                      {business.rating && (
                        <div className="flex items-center gap-1 bg-cyan-500/10 px-3 py-1 rounded-full shrink-0">
                          <Star className="w-4 h-4 fill-cyan-400 text-cyan-400" />
                          <span className="text-cyan-50 font-semibold">{business.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Contact Info (consistent layout) */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-cyan-100/80 min-h-[24px]">
                        <MapPin className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                        {business.formatted_address ? (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.formatted_address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm hover:text-cyan-400 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {business.formatted_address}
                          </a>
                        ) : (
                          <span className="text-sm text-cyan-100/50">Adres yok</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-cyan-100/80 min-h-[24px]">
                        <Phone className="w-5 h-5 text-cyan-400 shrink-0" />
                        {business.formatted_phone_number ? (
                          <a
                            href={`tel:${business.formatted_phone_number}`}
                            className="text-sm hover:text-cyan-400 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {business.formatted_phone_number}
                          </a>
                        ) : (
                          <span className="text-sm text-cyan-100/50">Telefon yok</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-cyan-100/80 min-h-[24px]">
                        <Globe className="w-5 h-5 text-cyan-400 shrink-0" />
                        {business.website ? (
                          <a
                            href={business.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm hover:text-cyan-400 transition-colors truncate"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {business.website}
                          </a>
                        ) : (
                          <span className="text-sm text-cyan-100/50">Web sitesi yok</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!business.formatted_phone_number?.trim()}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (business.formatted_phone_number) {
                            window.location.href = `tel:${business.formatted_phone_number}`
                          }
                        }}
                        className="gap-2 rounded-full border border-cyan-500/20 bg-white/5 text-cyan-50 hover:bg-cyan-500/10 hover:border-cyan-400/40 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Ara"
                        title="Ara"
                      >
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">Ara</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!business.formatted_address?.trim()}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (business.formatted_address) {
                            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.formatted_address)}`
                            window.open(url, "_blank")
                          }
                        }}
                        className="gap-2 rounded-full border border-cyan-500/20 bg-white/5 text-cyan-50 hover:bg-cyan-500/10 hover:border-cyan-400/40 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Haritada Aç"
                        title="Haritada Aç"
                      >
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">Haritada Aç</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!business.website?.trim()}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (business.website) {
                            window.open(business.website, "_blank")
                          }
                        }}
                        className="gap-2 rounded-full border border-cyan-500/20 bg-white/5 text-cyan-50 hover:bg-cyan-500/10 hover:border-cyan-400/40 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Web Sitesi"
                        title="Web Sitesi"
                      >
                        <Globe className="w-4 h-4" />
                        <span className="text-sm">Web Sitesi</span>
                      </Button>
                    </div>

                    {/* Reviews */}
                    {business.reviews && business.reviews.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-cyan-500/10">
                        <h4 className="text-sm font-semibold text-cyan-400">{t.recentReviews}</h4>
                        {business.reviews.slice(0, 3).map((review, idx) => (
                          <div key={`${business.place_id}-review-${review.time ?? idx}`} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-cyan-50">{review.author_name}</span>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={`${business.place_id}-review-${review.time ?? idx}-star-${i}`}
                                    className={`w-3 h-3 ${
                                      i < review.rating ? "fill-cyan-400 text-cyan-400" : "text-cyan-500/20"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-cyan-100/60 line-clamp-2">{review.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Map open in new tab */}
            <div className="order-1 lg:order-2 lg:sticky lg:top-[200px] h-[400px] lg:h-[calc(100vh-250px)]">
              <div className="h-full rounded-xl border border-cyan-500/20 bg-white/5 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="text-center space-y-3">
                  <div className="text-cyan-100/70 text-sm">Harita bu sayfada gösterilmiyor.</div>
                  <a
                    href={`/map?location=${encodeURIComponent(location)}&keyword=${encodeURIComponent(keyword)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-cyan-500/30 bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                  >
                    Yeni sekmede haritayı aç
                  </a>
                  <div className="text-xs text-cyan-100/60">Numaraya göre mekan isimlerini orada görebilirsiniz.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && businesses.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/10 mb-6">
              <Search className="w-10 h-10 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-semibold text-cyan-50 mb-2">{t.startSearch}</h2>
            <p className="text-cyan-100/60">{t.startSearchDesc}</p>
          </div>
        )}
      </div>
    </div>
    </PinVisibilityProvider>
  )
}
