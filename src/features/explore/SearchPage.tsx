import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { catalogApi } from '../../shared/api/endpoints'
import { SearchBar } from '../../shared/ui/SearchBar'
import { VenueCard } from '../../shared/ui/VenueCard'
import { DateStrip } from '../../shared/ui/DateStrip'

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('query') || ''
  const city = params.get('city') || ''
  const category = params.get('category') || ''
  const date = params.get('date') || ''

  const qs = new URLSearchParams({ size: '24' })
  if (query) qs.set('query', query)
  if (city) qs.set('city', city)
  if (category) qs.set('category', category)

  const { data, isLoading } = useQuery({
    queryKey: ['businesses', 'search', qs.toString()],
    queryFn: () => catalogApi.searchBusinesses(qs),
  })

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <SearchBar compact initial={{ q: query, city, date }} />
      <div className="mt-6">
        <DateStrip
          value={date || new Date().toISOString().slice(0, 10)}
          onChange={(v) => {
            const next = new URLSearchParams(params)
            next.set('date', v)
            setParams(next)
          }}
        />
      </div>
      <p className="mt-6 text-sm text-muted">
        {data?.pagination?.totalElements ?? 0} mekan bulundu
        {category ? ` · ${category}` : ''}
      </p>
      {isLoading ? (
        <p className="mt-8 text-muted">Yükleniyor…</p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.data || []).map((b) => (
            <VenueCard key={b.id} business={b} />
          ))}
        </div>
      )}
    </main>
  )
}
