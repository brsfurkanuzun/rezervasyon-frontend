import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { catalogApi } from '../../shared/api/endpoints'
import { SearchBar } from '../../shared/ui/SearchBar'
import { VenueCard } from '../../shared/ui/VenueCard'
import { favoriteApi } from '../../shared/api/endpoints'
import { useAuthStore } from '../auth/store'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usePaths } from '../../shared/i18n/paths'

export function HomePage() {
  const user = useAuthStore((s) => s.user)
  const p = usePaths()
  const qc = useQueryClient()
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: catalogApi.categories })
  const { data: page } = useQuery({
    queryKey: ['businesses', 'home'],
    queryFn: () => catalogApi.searchBusinesses(new URLSearchParams({ size: '12', sort: 'name,asc' })),
  })
  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: favoriteApi.list,
    enabled: user?.role === 'CUSTOMER',
  })
  const favIds = new Set(favorites.map((f) => f.businessId))
  const toggleFav = useMutation({
    mutationFn: async (businessId: string) => {
      if (favIds.has(businessId)) await favoriteApi.remove(businessId)
      else await favoriteApi.add(businessId)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  })

  return (
    <main>
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-14 text-center md:pt-20">
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          Yerel kişisel bakım için rezervasyon yapın
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted md:text-lg">
          En yüksek puanlı kuaförleri, güzellik salonlarını, berberleri ve spa’ları keşfedin — uygun saati seçin, anında alın.
        </p>
        <div className="mx-auto mt-8 max-w-xl text-left">
          <SearchBar />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`${p.search}?category=${c.code}`}
              className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-medium ring-1 ring-line hover:bg-lilac"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold">Öne çıkanlar</h2>
          <Link to={p.search} className="text-sm font-medium text-muted hover:text-ink">
            Tümünü gör
          </Link>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-4">
          {(page?.data || []).map((b) => (
            <VenueCard
              key={b.id}
              business={b}
              favorited={favIds.has(b.id)}
              onToggleFavorite={
                user?.role === 'CUSTOMER' ? () => toggleFav.mutate(b.id) : undefined
              }
            />
          ))}
        </div>
        {!page?.data?.length && (
          <p className="rounded-2xl bg-white p-8 text-center text-muted ring-1 ring-line">
            Henüz listelenecek işletme yok. Backend’i <code className="text-ink">dev</code> profiliyle çalıştırın.
          </p>
        )}
      </section>
    </main>
  )
}
