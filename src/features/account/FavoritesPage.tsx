import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { favoriteApi } from '../../shared/api/endpoints'
import { Button } from '../../shared/ui/Button'
import { usePaths } from '../../shared/i18n/paths'

export function FavoritesPage() {
  const qc = useQueryClient()
  const p = usePaths()
  const { data = [], isLoading } = useQuery({ queryKey: ['favorites'], queryFn: favoriteApi.list })
  const remove = useMutation({
    mutationFn: favoriteApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  })

  if (isLoading) return <p className="p-8 text-center text-muted">Yükleniyor…</p>

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Favoriler</h1>
      <ul className="mt-6 space-y-3">
        {data.map((f) => (
          <li key={f.id} className="flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-line">
            <Link to={p.venue(f.businessSlug)} className="font-semibold hover:underline">
              {f.businessName}
            </Link>
            <Button size="sm" variant="secondary" onClick={() => remove.mutate(f.businessId)}>
              Kaldır
            </Button>
          </li>
        ))}
      </ul>
      {!data.length && <p className="mt-6 text-muted">Favori işletmen yok.</p>}
    </main>
  )
}
