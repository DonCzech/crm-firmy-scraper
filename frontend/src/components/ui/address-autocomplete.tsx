"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { MapPinIcon, SearchIcon, LoaderIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NominatimResult {
  place_id: number
  display_name: string
  address: {
    road?: string
    pedestrian?: string
    house_number?: string
    suburb?: string
    city?: string
    town?: string
    village?: string
    municipality?: string
    county?: string
    state?: string
    postcode?: string
    country?: string
  }
  lat: string
  lon: string
}

function formatAddress(r: NominatimResult): string {
  const a = r.address
  const street = a.road ?? a.pedestrian
  const city = a.city ?? a.town ?? a.village ?? a.municipality ?? a.county

  const parts: string[] = []
  if (street) parts.push(a.house_number ? `${street} ${a.house_number}` : street)
  if (a.postcode && city) parts.push(`${a.postcode} ${city}`)
  else if (city) parts.push(city)

  return parts.join(", ") || r.display_name.split(",").slice(0, 3).join(",").trim()
}

function formatSubtitle(r: NominatimResult): string {
  const a = r.address
  const city = a.city ?? a.town ?? a.village ?? a.municipality
  const parts: string[] = []
  if (a.suburb && a.suburb !== city) parts.push(a.suburb)
  if (city) parts.push(city)
  if (a.county && a.county !== city) parts.push(a.county)
  return parts.join(", ")
}

async function fetchAddresses(query: string, signal: AbortSignal): Promise<NominatimResult[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search")
  url.searchParams.set("q", query)
  url.searchParams.set("format", "json")
  url.searchParams.set("addressdetails", "1")
  url.searchParams.set("limit", "8")
  url.searchParams.set("countrycodes", "cz")

  const res = await fetch(url.toString(), {
    signal,
    headers: { "User-Agent": "CRM-Calendar/1.0" },
  })
  if (!res.ok) throw new Error("Nominatim error")
  return res.json() as Promise<NominatimResult[]>
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Hledat adresu...",
  className,
  id,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [results, setResults] = useState<NominatimResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Sync external value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Abort on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const search = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setResults([])
      setIsOpen(false)
      return
    }

    // Cancel previous in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    try {
      const data = await fetchAddresses(query, controller.signal)
      setResults(data)
      setIsOpen(data.length > 0)
      setActiveIndex(-1)
    } catch (err) {
      // Ignore abort/cancel errors, surface others
      if (err instanceof Error && err.name !== "AbortError") {
        console.warn("Address search failed:", err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    onChange(val) // keep parent in sync while typing

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void search(val)
    }, 300)
  }

  const selectResult = (result: NominatimResult) => {
    const formatted = formatAddress(result)
    setInputValue(formatted)
    onChange(formatted)
    setIsOpen(false)
    setResults([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault()
      const r = results[activeIndex]
      if (r) selectResult(r)
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-8 text-sm",
            "ring-offset-background transition-colors",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <LoaderIcon className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
          ) : inputValue.length >= 3 ? (
            <SearchIcon className="w-3.5 h-3.5 text-muted-foreground opacity-50" />
          ) : null}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border bg-popover shadow-lg overflow-hidden">
          <ul className="max-h-60 overflow-y-auto py-1">
            {results.map((result, index) => {
              const main = formatAddress(result)
              const sub = formatSubtitle(result)
              return (
                <li key={result.place_id}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      selectResult(result)
                    }}
                    className={cn(
                      "w-full flex items-start gap-2.5 px-3 py-2 text-left text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      activeIndex === index && "bg-accent text-accent-foreground",
                    )}
                  >
                    <MapPinIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{main}</div>
                      {sub && <div className="text-xs text-muted-foreground truncate">{sub}</div>}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="px-3 py-1.5 border-t bg-muted/30">
            <span className="text-[10px] text-muted-foreground">
              © OpenStreetMap contributors
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
