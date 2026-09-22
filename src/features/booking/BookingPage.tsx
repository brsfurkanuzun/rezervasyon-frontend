import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { bookingApi, catalogApi } from '../../shared/api/endpoints'
import { DateStrip } from '../../shared/ui/DateStrip'
import { Button } from '../../shared/ui/Button'
import { useAuthStore } from '../auth/store'
import { cn } from '../../shared/lib/cn'
import { usePaths } from '../../shared/i18n/paths'

export function BookingPage() {
  const { slug = '' } = useParams()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const p = usePaths()
  const [serviceId, setServiceId] = useState<string>('')
  const [employeeId, setEmployeeId] = useState<string>('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [slotStart, setSlotStart] = useState<string>('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const { data: business } = useQuery({
    queryKey: ['business', slug],
    queryFn: () => catalogApi.businessBySlug(slug),
    enabled: !!slug,
  })

  const employeesForService = useMemo(() => {
    if (!business || !serviceId) return business?.employees || []
    return business.employees.filter((e) => e.serviceIds?.includes(serviceId))
  }, [business, serviceId])

  const availParams = new URLSearchParams({ serviceId, date })
  if (employeeId) availParams.set('employeeId', employeeId)

  const { data: availability, isFetching } = useQuery({
    queryKey: ['availability', business?.id, serviceId, employeeId, date],
    queryFn: () => catalogApi.availability(business!.id, availParams),
    enabled: !!business?.id && !!serviceId,
  })

  const slots = useMemo(() => {
    if (!availability) return []
    if (employeeId) {
      return availability.employees.find((e) => e.employeeId === employeeId)?.slots || []
    }
    // merge: prefer first employee available for each start
    const map = new Map<string, { start: string; end: string; available: boolean; employeeId: string }>()
    for (const emp of availability.employees) {
      for (const s of emp.slots) {
        if (!map.has(s.start) || (s.available && !map.get(s.start)!.available)) {
          map.set(s.start, { ...s, employeeId: emp.employeeId })
        }
      }
    }
    return [...map.values()].sort((a, b) => a.start.localeCompare(b.start))
  }, [availability, employeeId])

  const create = useMutation({
    mutationFn: async () => {
      if (!user) {
        navigate(p.signin, { state: { from: p.book(slug) } })
        return
      }
      if (!business || !serviceId || !slotStart) throw new Error('Eksik seçim')
      let emp = employeeId
      if (!emp) {
        const matched = slots.find((s) => s.start === slotStart) as { employeeId?: string } | undefined
        emp = matched?.employeeId || ''
      }
      if (!emp) throw new Error('Çalışan seçilemedi')
      // Backend expects Instant; local wall time in business TZ (Istanbul demo):
      const istanbul = `${date}T${slotStart}:00+03:00`
      return bookingApi.create({
        businessId: business.id,
        employeeId: emp,
        serviceId,
        startDateTime: new Date(istanbul).toISOString(),
        customerNote: note || undefined,
      })
    },
    onSuccess: () => navigate(p.appointments),
    onError: (e: Error) => setError(e.message),
  })

  if (!business) return <p className="p-8 text-center text-muted">Yükleniyor…</p>

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link to={p.venue(slug)} className="text-sm text-muted hover:text-ink">
        ← {business.name}
      </Link>
      <h1 className="mt-3 font-display text-3xl font-bold">Randevu al</h1>

      <section className="mt-8">
        <h2 className="font-semibold">1. Hizmet</h2>
        <div className="mt-3 space-y-2">
          {business.services.filter((s) => s.isActive).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setServiceId(s.id)
                setEmployeeId('')
                setSlotStart('')
              }}
              className={cn(
                'flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-left ring-1 ring-line',
                serviceId === s.id && 'ring-2 ring-ink',
              )}
            >
              <span>
                {s.name} <span className="text-muted">· {s.durationMinutes} dk</span>
              </span>
              <span className="font-semibold">{s.price} {s.currency}</span>
            </button>
          ))}
        </div>
      </section>

      {serviceId && (
        <section className="mt-8">
          <h2 className="font-semibold">2. Uzman (opsiyonel)</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEmployeeId('')}
              className={cn('rounded-full px-4 py-2 text-sm ring-1 ring-line', !employeeId && 'bg-ink text-white')}
            >
              Fark etmez
            </button>
            {employeesForService.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setEmployeeId(e.id)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm ring-1 ring-line',
                  employeeId === e.id && 'bg-ink text-white',
                )}
              >
                {e.firstName} {e.lastName}
              </button>
            ))}
          </div>
        </section>
      )}

      {serviceId && (
        <section className="mt-8">
          <h2 className="font-semibold">3. Tarih & saat</h2>
          <div className="mt-3">
            <DateStrip value={date} onChange={(v) => { setDate(v); setSlotStart('') }} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {isFetching && <p className="col-span-full text-muted">Slotlar yükleniyor…</p>}
            {!isFetching && slots.length === 0 && (
              <p className="col-span-full text-muted">Bu gün için uygun slot yok.</p>
            )}
            {slots.map((s) => (
              <button
                key={s.start}
                type="button"
                disabled={!s.available}
                onClick={() => setSlotStart(s.start)}
                className={cn(
                  'rounded-xl py-2.5 text-sm font-medium ring-1 ring-line disabled:opacity-30',
                  slotStart === s.start ? 'bg-ink text-white' : 'bg-white',
                )}
              >
                {s.start}
              </button>
            ))}
          </div>
        </section>
      )}

      {slotStart && (
        <section className="mt-8 space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Not (opsiyonel)"
            className="min-h-24 w-full rounded-2xl border border-line bg-white p-4 outline-none focus:ring-2 focus:ring-lilac-deep/40"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button size="lg" className="w-full" disabled={create.isPending} onClick={() => create.mutate()}>
            {create.isPending ? 'Alınıyor…' : 'Randevuyu onayla'}
          </Button>
        </section>
      )}
    </main>
  )
}
