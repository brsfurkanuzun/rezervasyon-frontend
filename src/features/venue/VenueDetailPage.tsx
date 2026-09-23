import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Clock, MapPin, Star } from 'lucide-react'
import { catalogApi } from '../../shared/api/endpoints'
import { Button } from '../../shared/ui/Button'
import { usePaths } from '../../shared/i18n/paths'
import { cn } from '../../shared/lib/cn'
import type { BusinessDetail } from '../../shared/types/api'

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1400&q=80'

/** Geçici: işletme saatleri API’de yok; seed ile uyumlu Pzt–Cum 09:00–18:00. */
function getOpenStatus(timezone: string) {
  const closing = '18:00'
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone || 'Europe/Istanbul',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]))
  const weekday = parts.weekday
  const [h, m] = `${parts.hour || '0'}:${parts.minute || '0'}`.split(':').map(Number)
  const minutes = h * 60 + m
  const isWeekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekday)
  const open =
    isWeekday &&
    ((minutes >= 9 * 60 && minutes < 13 * 60) || (minutes >= 14 * 60 && minutes < 18 * 60))
  return { open, closing }
}

function StarRating({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const filled = Math.round(value)
  const dim = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <span className="inline-flex items-center gap-0.5 text-star" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={dim}
          fill={i < filled ? 'currentColor' : 'none'}
          strokeWidth={i < filled ? 0 : 1.6}
        />
      ))}
    </span>
  )
}

function directionsUrl(data: BusinessDetail) {
  if (data.latitude != null && data.longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${data.latitude},${data.longitude}`
  }
  const q = [data.address, data.district, data.city].filter(Boolean).join(', ')
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`
}

function formatRating(value: number) {
  return value.toFixed(1).replace('.', ',')
}

function BookingCard({
  data,
  bookTo,
  open,
  closing,
  mapsHref,
  showIdentity,
}: {
  data: BusinessDetail
  bookTo: string
  open: boolean
  closing: string
  mapsHref: string
  showIdentity: boolean
}) {
  const rating = data.averageRating
  const address = [data.address, data.district, data.city].filter(Boolean).join(', ')

  return (
    <aside className="flex flex-col rounded-3xl bg-white p-8 shadow-[0_12px_40px_rgba(60,40,80,0.12)] ring-1 ring-line md:sticky md:top-24">
      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out',
          showIdentity ? 'mb-4 grid-rows-[1fr] opacity-100' : 'mb-0 grid-rows-[0fr] opacity-0',
        )}
        aria-hidden={!showIdentity}
      >
        <div className="overflow-hidden">
          <ul className="flex flex-col gap-2">
            <li>
              <h2 className="font-display text-[1.625rem] font-bold leading-tight tracking-tight text-ink">
                {data.name}
              </h2>
            </li>
            <li>
              <div className="flex items-center gap-1.5">
                {rating != null ? (
                  <>
                    <span className="sr-only">
                      {data.reviewCount} oylarla {formatRating(rating)} derecelendirme
                    </span>
                    <span className="text-base font-semibold tabular-nums text-ink" aria-hidden>
                      {formatRating(rating)}
                    </span>
                    <StarRating value={rating} />
                    <span className="ms-1 text-base font-medium text-muted" aria-hidden>
                      ({data.reviewCount})
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-base font-semibold text-ink">Yeni</span>
                    <StarRating value={0} />
                    <span className="ms-1 text-base font-medium text-muted">({data.reviewCount})</span>
                  </>
                )}
              </div>
            </li>
          </ul>
        </div>
      </div>

      <Link to={bookTo} className="block w-full" id="book-now-sticky-bar">
        <Button
          size="lg"
          className="h-12 w-full rounded-full px-6 text-[15px] font-semibold tracking-tight"
        >
          Rezervasyon yap
        </Button>
      </Link>

      <div className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
        <div className="flex items-start gap-2.5">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden strokeWidth={1.8} />
          <p>
            <span className={open ? 'font-medium text-emerald-700' : 'font-medium text-danger'}>
              {open ? 'Açık' : 'Kapalı'}
            </span>{' '}
            <span className="text-muted">Kapanış: {closing}</span>
          </p>
        </div>

        {address && (
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden strokeWidth={1.8} />
            <div>
              <p className="text-ink">{address}</p>
              <a
                href={mapsHref}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block font-medium text-blue-600 underline-offset-2 hover:underline"
              >
                Adres tarifi alın
              </a>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

export function VenueDetailPage() {
  const { slug = '' } = useParams()
  const p = usePaths()
  const headerRef = useRef<HTMLDivElement>(null)
  const [headerInView, setHeaderInView] = useState(true)

  const { data, isLoading, error } = useQuery({
    queryKey: ['business', slug],
    queryFn: () => catalogApi.businessBySlug(slug),
    enabled: !!slug,
  })

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setHeaderInView(entry.isIntersecting), {
      threshold: 0,
      rootMargin: '0px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [data])

  if (isLoading) return <p className="p-8 text-center text-muted">Yükleniyor…</p>
  if (error || !data)
    return <p className="p-8 text-center text-danger">{(error as Error)?.message || 'Bulunamadı'}</p>

  const rating = data.averageRating
  const { open, closing } = getOpenStatus(data.timezone)
  const place = [data.district, data.city].filter(Boolean).join(', ')
  const mapsHref = directionsUrl(data)

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div ref={headerRef}>
        <h1 className="font-display text-3xl font-bold md:text-4xl">{data.name}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5 text-ink">
            {rating != null ? (
              <>
                <span className="font-semibold tabular-nums">{formatRating(rating)}</span>
                <StarRating value={rating} size="sm" />
              </>
            ) : (
              <>
                <span className="font-semibold">Yeni</span>
                <StarRating value={0} size="sm" />
              </>
            )}
            <span className="text-muted">({data.reviewCount} değerlendirme)</span>
          </span>
          <span aria-hidden className="text-line">
            ·
          </span>
          <span className={open ? 'font-medium text-emerald-700' : 'font-medium text-danger'}>
            {open ? 'Açık' : 'Kapalı'}
          </span>
          <span className="text-muted">Kapanış {closing}</span>
          {place && (
            <>
              <span aria-hidden className="text-line">
                ·
              </span>
              <span>{place}</span>
            </>
          )}
          <span aria-hidden className="text-line">
            ·
          </span>
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-ink underline-offset-2 hover:underline"
          >
            <MapPin className="h-3.5 w-3.5" aria-hidden strokeWidth={2} />
            Adres tarifi al
          </a>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl">
        <img
          src={data.coverImageUrl || data.logoUrl || PLACEHOLDER}
          alt={data.name}
          className="aspect-[21/9] w-full object-cover"
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="min-w-0 space-y-10 pb-16">
          <section>
            <h2 className="font-display text-xl font-semibold">Hizmetler</h2>
            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line">
              {data.services.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4 px-4 py-4">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-muted">{s.durationMinutes} dk</p>
                  </div>
                  <p className="font-semibold">
                    {s.price} {s.currency}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section>
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

          <section>
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
        </div>

        <BookingCard
          data={data}
          bookTo={p.book(data.slug)}
          open={open}
          closing={closing}
          mapsHref={mapsHref}
          showIdentity={!headerInView}
        />
      </div>
    </main>
  )
}
