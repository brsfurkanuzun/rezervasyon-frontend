import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { cn } from '../lib/cn'
import { usePaths } from '../i18n/paths'

export function SearchBar({ compact = false, initial }: { compact?: boolean; initial?: { q?: string; city?: string; date?: string } }) {
  const navigate = useNavigate()
  const p = usePaths()
  const [q, setQ] = useState(initial?.q || '')
  const [city, setCity] = useState(initial?.city || '')
  const [date, setDate] = useState(initial?.date || '')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q) params.set('query', q)
    if (city) params.set('city', city)
    if (date) params.set('date', date)
    const qs = params.toString()
    navigate(qs ? `${p.search}?${qs}` : p.search)
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        'search-glow rounded-3xl bg-white p-3',
        compact ? 'flex flex-col gap-2 md:flex-row md:items-center' : 'space-y-3',
      )}
    >
      <div className={cn('grid gap-2', compact ? 'md:grid-cols-3 md:flex-1' : '')}>
        <label className="block">
          {!compact && <span className="mb-1 block px-1 text-xs font-medium text-muted">İşlem</span>}
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tüm işlemler" />
        </label>
        <label className="block">
          {!compact && <span className="mb-1 block px-1 text-xs font-medium text-muted">Konum</span>}
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Şehir / ilçe" />
        </label>
        <label className="block">
          {!compact && <span className="mb-1 block px-1 text-xs font-medium text-muted">Zaman</span>}
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>
      <Button type="submit" size="lg" className={cn('w-full', compact && 'md:w-auto md:shrink-0')}>
        randevu Ara
      </Button>
    </form>
  )
}
