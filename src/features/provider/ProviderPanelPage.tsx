import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { providerApi } from '../../shared/api/endpoints'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { useState } from 'react'
import { usePaths } from '../../shared/i18n/paths'

export function ProviderPanelPage() {
  const qc = useQueryClient()
  const p = usePaths()
  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['provider-businesses'],
    queryFn: providerApi.myBusinesses,
  })
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', city: 'Istanbul', district: 'Kadikoy', timezone: 'Europe/Istanbul' })
  const create = useMutation({
    mutationFn: () => providerApi.createBusiness({ ...form, autoConfirm: true }),
    onSuccess: () => {
      setOpen(false)
      qc.invalidateQueries({ queryKey: ['provider-businesses'] })
    },
  })

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">İşletme paneli</h1>
        <Button onClick={() => setOpen(true)}>Yeni işletme</Button>
      </div>
      {isLoading && <p className="mt-6 text-muted">Yükleniyor…</p>}
      <ul className="mt-6 space-y-3">
        {businesses.map((b) => (
          <li key={b.id} className="flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-line">
            <div>
              <p className="font-semibold">{b.name}</p>
              <p className="text-sm text-muted">{b.status} · {b.slug}</p>
            </div>
            <Link to={p.panelBusiness(b.id)}>
              <Button variant="secondary" size="sm">Yönet</Button>
            </Link>
          </li>
        ))}
      </ul>
      {!businesses.length && !isLoading && (
        <p className="mt-6 text-muted">Henüz işletmen yok. Seed provider ile giriş yapabilirsin.</p>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            className="w-full max-w-md space-y-3 rounded-3xl bg-white p-6"
            onSubmit={(e) => {
              e.preventDefault()
              create.mutate()
            }}
          >
            <h2 className="font-display text-xl font-semibold">Yeni işletme</h2>
            <Input placeholder="Ad" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Şehir" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Input placeholder="İlçe" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Vazgeç</Button>
              <Button type="submit" disabled={create.isPending}>Oluştur</Button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}
