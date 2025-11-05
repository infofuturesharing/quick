import { type NextRequest, NextResponse } from "next/server"

// Minimal response types to satisfy TypeScript in dev
interface NearbySearchResponse {
  status: string
  results?: any[]
  next_page_token?: string
  error_message?: string
}

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY

export async function GET(request: NextRequest) {
  console.log("[v0] Places API called")

  const searchParams = request.nextUrl.searchParams
  const location = searchParams.get("location")
  const keyword = searchParams.get("keyword")
  const radiusParam = searchParams.get("radius")

  console.log("[v0] Search params:", { location, keyword })

  if (!location || !keyword) {
    console.log("[v0] Missing location or keyword")
    return NextResponse.json({ error: "Location and keyword are required" }, { status: 400 })
  }

  if (!GOOGLE_PLACES_API_KEY) {
    console.log("[v0] Google Places API key not configured")
    return NextResponse.json({ error: "Google Places API key not configured" }, { status: 500 })
  }

  console.log("[v0] API key present:", !!GOOGLE_PLACES_API_KEY)

  try {
    // 1) Geocode the textual location to lat/lng
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${GOOGLE_PLACES_API_KEY}`
    const geocodeRes = await fetch(geocodeUrl)
    const geocodeData = await geocodeRes.json()
    if (geocodeData.status !== "OK" || !geocodeData.results?.[0]?.geometry?.location) {
      console.log("[v0] Geocoding failed:", geocodeData.status, geocodeData.error_message)
      // Fallback: use Places Text Search biased to TR region without lat/lng
      const query = `${keyword} ${location}`
      const textUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&region=tr&key=${GOOGLE_PLACES_API_KEY}`
      const textRes = await fetch(textUrl)
      const textData = await textRes.json()
      console.log("[v0] Text search status:", textData.status, "results:", textData.results?.length || 0)

      if (textData.status === "ZERO_RESULTS") {
        return NextResponse.json({ results: [] }, { status: 200 })
      }
      if (textData.status === "REQUEST_DENIED") {
        return NextResponse.json({ error: textData.error_message || "API erişimi reddedildi", results: [] }, { status: 200 })
      }
      if (textData.status !== "OK" || !Array.isArray(textData.results)) {
        return NextResponse.json({ error: textData.error_message || "Arama başarısız", results: [] }, { status: 200 })
      }

      // Deduplicate and fetch details for text search results
      const seenText = new Set<string>()
      const textPlaces = textData.results.filter((p: any) => {
        if (!p.place_id || seenText.has(p.place_id)) return false
        seenText.add(p.place_id)
        return true
      })
      console.log("[v0] Fetching details for", textPlaces.length, "text places")

      const detailedTextPlaces = await Promise.all(
        textPlaces.map(async (place: any) => {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,reviews,geometry,types,opening_hours,address_components&key=${GOOGLE_PLACES_API_KEY}`
          const detailsResponse = await fetch(detailsUrl)
          const detailsData = await detailsResponse.json()
          if (detailsData.status === "OK") {
            return detailsData.result
          }
          // Mark incomplete when details could not be resolved
          return { ...place, _incomplete: true }
        }),
      )

      const validTextPlaces = detailedTextPlaces.filter((p: any) => {
        const hasId = !!p.place_id
        const hasGeo = !!p.geometry?.location?.lat && !!p.geometry?.location?.lng
        return hasId && hasGeo
      })
      const incompleteTextCount = detailedTextPlaces.length - validTextPlaces.length

      console.log("[v0] Returning", validTextPlaces.length, "valid places (text search fallback)", "incomplete:", incompleteTextCount)
      return NextResponse.json({ results: validTextPlaces, meta: { incomplete_count: incompleteTextCount } })
    }
    const { lat, lng } = geocodeData.results[0].geometry.location
    const radius = Math.max(100, Math.min(Number(radiusParam || 3000), 50000)) // default 3km, clamp to [100, 50km]

    // 2) Nearby Search with pagination (up to ~60 results)
    const baseNearby = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(
      keyword,
    )}&key=${GOOGLE_PLACES_API_KEY}`

    console.log("[v0] Nearby search:", { lat, lng, radius, keyword })

    let allResults: any[] = []
    let pageUrl: string | null = baseNearby
    let pageCount = 0
    while (pageUrl && pageCount < 3) {
      const res: Response = await fetch(pageUrl as string)
      const data: NearbySearchResponse = await res.json()
      console.log(`[v0] Nearby page ${pageCount + 1} status:`, data.status, "results:", data.results?.length || 0)

      if (data.status === "OK" && Array.isArray(data.results)) {
        allResults = allResults.concat(data.results)
      } else if (data.status === "ZERO_RESULTS") {
        break
      } else if (data.status === "REQUEST_DENIED") {
        return NextResponse.json({ error: data.error_message || "API erişimi reddedildi" , results: [] }, { status: 200 })
      } else {
        break
      }

      const token: string | undefined = data.next_page_token
      if (token) {
        // next_page_token requires a short delay (~2s) before it becomes valid
        await new Promise((r) => setTimeout(r, 2100))
        pageUrl = `${baseNearby}&pagetoken=${token}`
        pageCount += 1
      } else {
        pageUrl = null
      }
    }

    console.log("[v0] Total nearby results:", allResults.length)

    if (allResults.length === 0) {
      console.log("[v0] No nearby results found")
      return NextResponse.json({ results: [] }, { status: 200 })
    }

    // 3) Get detailed info for each place (up to 60)
    const seen = new Set<string>()
    const places = allResults.filter((p) => {
      if (!p.place_id || seen.has(p.place_id)) return false
      seen.add(p.place_id)
      return true
    })
    console.log("[v0] Fetching details for", places.length, "places")

    const detailedPlaces = await Promise.all(
      places.map(async (place: any) => {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,reviews,geometry,types,opening_hours,address_components&key=${GOOGLE_PLACES_API_KEY}`

        const detailsResponse = await fetch(detailsUrl)
        const detailsData = await detailsResponse.json()

        if (detailsData.status === "OK") {
          return detailsData.result
        }
        // Mark incomplete when details could not be resolved
        return { ...place, _incomplete: true }
      }),
    )

    const validPlaces = detailedPlaces.filter((p: any) => {
      const hasId = !!p.place_id
      const hasGeo = !!p.geometry?.location?.lat && !!p.geometry?.location?.lng
      return hasId && hasGeo
    })
    const incompleteCount = detailedPlaces.length - validPlaces.length

    console.log("[v0] Returning", validPlaces.length, "valid places", "incomplete:", incompleteCount)
    return NextResponse.json({ results: validPlaces, meta: { incomplete_count: incompleteCount } })
  } catch (error) {
    console.error("[v0] Error fetching places:", error)
    return NextResponse.json({ error: "Internal server error", results: [] }, { status: 500 })
  }
}
