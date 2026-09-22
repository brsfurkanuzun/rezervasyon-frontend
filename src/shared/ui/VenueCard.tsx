import { Link } from 'react-router-dom'
import type { BusinessSummary } from '../types/api'
import { cn } from '../lib/cn'
import { usePaths } from '../i18n/paths'

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'

export function VenueCard({
  business,
  favorited,
  onToggleFavorite,
}: {
  business: BusinessSummary
  favorited?: boolean
  onToggleFavorite?: () => void
}) {
  const p = usePaths()
  const href = p.venue(business.slug)
  const image = business.coverImageUrl || business.logoUrl || PLACEHOLDER
  const category = business.categories?.[0]?.name || 'Güzellik'
  return (
    <article className="group min-w-[260px] max-w-[320px] flex-1">
      <div className="relative overflow-hidden rounded-2xl">
        <Link to={href}>
          <img
            src={image}
            alt={business.name}
            className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>
        {onToggleFavorite && (
          <button
            type="button"
            aria-label="Favori"
            onClick={onToggleFavorite}
            className={cn(
              'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm',
              favorited && 'text-rose-300',
            )}
          >
            ♥
          </button>
        )}
      </div>
      <Link to={href} className="mt-3 block">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-[15px] font-semibold leading-snug">{business.name}</h3>
          {business.averageRating != null && (
            <span className="shrink-0 text-sm font-medium">
              <span className="text-star">★</span> {business.averageRating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted">
          {[business.district, business.city].filter(Boolean).join(', ') || 'Türkiye'}
        </p>
        <p className="mt-1 text-sm text-muted">
          {category}
          {business.reviewCount > 0 ? ` · ${business.reviewCount} değerlendirme` : ''}
          {business.startingPrice != null ? ` · ${business.startingPrice} TL'den` : ''}
        </p>
      </Link>
    </article>
  )
}
