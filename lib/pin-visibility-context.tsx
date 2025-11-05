"use client"

import React, { createContext, useContext, useMemo, useRef, useState } from "react"

type VisibilityMap = Record<string, boolean>

type PinVisibilityContextValue = {
  visiblePins: VisibilityMap
  activePlaceId: string | null
  setVisible: (placeId: string, visible: boolean) => void
  selectPin: (placeId: string | null) => void
  debouncedSelect: (placeId: string | null) => void
  transitionDurationMs: number
}

const PinVisibilityContext = createContext<PinVisibilityContextValue | null>(null)

export function usePinVisibility() {
  const ctx = useContext(PinVisibilityContext)
  if (!ctx) throw new Error("usePinVisibility must be used within PinVisibilityProvider")
  return ctx
}

export function PinVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [visiblePins, setVisiblePins] = useState<VisibilityMap>({})
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null)

  const transitionDurationMs = 300
  const debounceMs = 150
  const debounceRef = useRef<number | null>(null)

  const setVisible = (placeId: string, visible: boolean) => {
    setVisiblePins((prev) => ({ ...prev, [placeId]: visible }))
  }

  const selectPin = (placeId: string | null) => {
    setActivePlaceId((prev) => (prev === placeId ? placeId : placeId))
    // Ensure new selected pin is visible and others keep their prior state
    if (placeId) setVisible(placeId, true)
  }

  const debouncedSelect = (placeId: string | null) => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    debounceRef.current = window.setTimeout(() => {
      selectPin(placeId)
    }, debounceMs)
  }

  const value = useMemo(
    () => ({ visiblePins, activePlaceId, setVisible, selectPin, debouncedSelect, transitionDurationMs }),
    [visiblePins, activePlaceId]
  )

  return <PinVisibilityContext.Provider value={value}>{children}</PinVisibilityContext.Provider>
}