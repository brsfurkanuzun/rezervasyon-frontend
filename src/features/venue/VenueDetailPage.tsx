import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { catalogApi } from '../../shared/api/endpoints'
import { Button } from '../../shared/ui/Button'
import { usePaths } from '../../shared/i18n/paths'

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1400&q=80'

export function VenueDetailPage() {
  const { slug = '' } = useParams()
  const p = usePaths()
  const { data, isLoading, error } = useQuery({
    queryKey: ['business', slug],
    queryFn: () => catalogApi.businessBySlug(slug),
    enabled: !!slug,
  })

  if (isLoading) return <p className="p-8 text-center text-muted">Yükleniyor…</p>
  if (error || !data)
    return <p className="p-8 text-center text-danger">{(error as Error)?.message || 'Bulunamadı'}</p>

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="overflow-hidden rounded-3xl">
        <img
          src={data.coverImageUrl || data.logoUrl || PLACEHOLDER}
          alt={data.name}
          className="aspect-[21/9] w-full object-cover"
        />
      </div>
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">{data.name}</h1>
          <p className="mt-1 text-muted">
            {[data.address, data.district, data.city].filter(Boolean).join(', ')}
          </p>
          <p className="mt-2 text-sm">
            {data.averageRating != null && (
              <span className="font-medium">
                <span className="text-star">★</span> {data.averageRating.toFixed(1)}{' '}
              </span>
            )}
            <span className="text-muted">{data.reviewCount} değerlendirme</span>
          </p>
        </div>
        <Link to={p.book(data.slug)}>
          <Button size="lg">Randevu al</Button>
        </Link>
      </div>

      {data.description && <p className="mt-6 max-w-3xl text-muted">{data.description}</p>}

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Hizmetler</h2>
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line">
          {data.services.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-4 px-4 py-4">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted">{s.durationMinutes} dk</p>
              </div>
              <p className="font-semibold">{s.price} {s.currency}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Ekip</h2>
        <div className="mt-4 flex gap-4 overflow-x-auto">
          {data.employees.map((e) => (
            <div key={e.id} className="min-w-[140px] rounded-2xl bg-white p-4 ring-1 ring-line">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-lilac font-display text-lg font-semibold">
                {e.firstName[0]}
              </div>
              <p className="mt-3 font-medium">
                {e.firstName} {e.lastName}
              </p>
              <p className="text-sm text-muted">{e.title || 'Uzman'}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 pb-16">
        <h2 className="font-display text-xl font-semibold">Yorumlar</h2>
        <div className="mt-4 space-y-3">
          {data.recentReviews.length === 0 && <p className="text-muted">Henüz yorum yok.</p>}
          {data.recentReviews.map((r) => (
            <article key={r.id} className="rounded-2xl bg-white p-4 ring-1 ring-line">
              <p className="font-medium">
                {r.customerName} · <span className="text-star">★</span> {r.rating}
              </p>
              {r.comment && <p className="mt-1 text-sm text-muted">{r.comment}</p>}
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
