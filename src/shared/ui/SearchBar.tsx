import { useNavigate } from 'react-router-dom'
import { useEffect, useId, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { LucideIcon } from 'lucide-react'
import {
  Apple,
  Brain,
  Droplet,
  Dumbbell,
  Ellipsis,
  Flower2,
  Hand,
  HeartHandshake,
  LayoutGrid,
  MapPin,
  Paintbrush,
  PenTool,
  PersonStanding,
  Scissors,
  Search,
  Sparkles,
} from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { usePaths } from '../i18n/paths'
import { catalogApi } from '../api/endpoints'
import { cn } from '../lib/cn'

const CURRENT_LOCATION = 'Mevcut Konum'
const ALL_SERVICES = 'Tüm İşlemler'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  ALL: LayoutGrid,
  HAIRDRESSER: Scissors,
  BARBER: Scissors,
  BEAUTY_SALON: Sparkles,
  NAIL_SALON: Hand,
  SPA: Flower2,
  MASSAGE: HeartHandshake,
  MAKEUP: Paintbrush,
  SKIN_CARE: Droplet,
  YOGA: PersonStanding,
  PILATES: Dumbbell,
  DIETITIAN: Apple,
  PSYCHOLOGIST: Brain,
  TATTOO_PIERCING: PenTool,
  OTHER: Ellipsis,
}

function CategoryIcon({ code }: { code: string }) {
  const Icon = CATEGORY_ICONS[code] ?? Search
  return <Icon aria-hidden strokeWidth={1.75} />
}

function ServiceOption({
  label,
  code,
  selected,
  onSelect,
}: {
  label: string
  code?: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-lilac/70',
        selected && 'bg-lilac/50',
      )}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onSelect}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lilac text-ink [&_svg]:h-5 [&_svg]:w-5">
        <CategoryIcon code={code || 'ALL'} />
      </span>
      <span className={cn('text-[15px] leading-snug', selected && 'font-medium')}>{label}</span>
    </button>
  )
}

export function SearchBar({
  initial,
}: {
  compact?: boolean
  initial?: { q?: string; city?: string; date?: string; category?: string }
}) {
  const navigate = useNavigate()
  const p = usePaths()
  const listId = useId()
  const serviceRef = useRef<HTMLDivElement>(null)

  const [serviceLabel, setServiceLabel] = useState(initial?.q || ALL_SERVICES)
  const [categoryCode, setCategoryCode] = useState(initial?.category || '')
  const [city, setCity] = useState(initial?.city || CURRENT_LOCATION)
  const [date, setDate] = useState(initial?.date || '')
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.categories,
  })

  useEffect(() => {
    if (!initial?.category || !categories.length) return
    const match = categories.find((c) => c.code === initial.category)
    if (match) {
      setCategoryCode(match.code)
      setServiceLabel(match.name)
    }
  }, [categories, initial?.category])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!serviceRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(filter.toLowerCase()),
  )

  function selectService(label: string, code = '') {
    setServiceLabel(label)
    setCategoryCode(code)
    setFilter('')
    setOpen(false)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (categoryCode) params.set('category', categoryCode)
    else if (serviceLabel && serviceLabel !== ALL_SERVICES) params.set('query', serviceLabel)
    if (city && city !== CURRENT_LOCATION) params.set('city', city)
    if (date) params.set('date', date)
    const qs = params.toString()
    navigate(qs ? `${p.search}?${qs}` : p.search)
  }

  return (
    <form
      onSubmit={submit}
      className="search-glow flex flex-col gap-2 rounded-3xl bg-white p-3 md:flex-row md:items-center"
    >
      <div className="grid flex-1 gap-2 md:grid-cols-3">
        <div className="relative min-w-0" ref={serviceRef}>
          <label className="block">
            <span className="sr-only">İşlem</span>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 flex h-5 w-5 -translate-y-1/2 text-muted [&_svg]:h-5 [&_svg]:w-5">
                <Search aria-hidden strokeWidth={1.8} />
              </span>
              <Input
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                value={open ? filter : serviceLabel}
                placeholder={ALL_SERVICES}
                onChange={(e) => {
                  setFilter(e.target.value)
                  setOpen(true)
                }}
                onFocus={() => {
                  setFilter('')
                  setOpen(true)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setOpen(false)
                }}
                className="pl-11"
              />
            </div>
          </label>
          {open && (
            <div
              id={listId}
              role="listbox"
              className="absolute left-0 z-30 mt-2 w-[min(100vw-2rem,28rem)] max-h-[min(70vh,28rem)] overflow-auto rounded-3xl border border-line bg-white p-2 shadow-[0_20px_50px_rgba(60,40,80,0.18)] md:w-[32rem]"
            >
              <div className="grid gap-1 sm:grid-cols-2">
                <ServiceOption
                  label={ALL_SERVICES}
                  selected={!categoryCode && serviceLabel === ALL_SERVICES}
                  onSelect={() => selectService(ALL_SERVICES)}
                />
                {filtered.map((c) => (
                  <ServiceOption
                    key={c.id}
                    label={c.name}
                    code={c.code}
                    selected={categoryCode === c.code}
                    onSelect={() => selectService(c.name, c.code)}
                  />
                ))}
              </div>
              {!filtered.length && (
                <p className="px-4 py-6 text-center text-sm text-muted">Sonuç yok</p>
              )}
            </div>
          )}
        </div>
        <label className="block min-w-0">
          <span className="sr-only">Konum</span>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 flex h-5 w-5 -translate-y-1/2 text-muted [&_svg]:h-5 [&_svg]:w-5">
              <MapPin aria-hidden strokeWidth={1.8} />
            </span>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onFocus={() => {
                if (city === CURRENT_LOCATION) setCity('')
              }}
              onBlur={() => {
                if (!city.trim()) setCity(CURRENT_LOCATION)
              }}
              className="pl-11"
            />
          </div>
        </label>
        <label className="block min-w-0">
          <span className="sr-only">Zaman</span>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>
      <Button type="submit" size="lg" className="w-full shrink-0 md:w-auto">
        randevu Ara
      </Button>
    </form>
  )
}
