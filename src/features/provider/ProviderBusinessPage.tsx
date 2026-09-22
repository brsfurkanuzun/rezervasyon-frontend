import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { providerApi } from '../../shared/api/endpoints'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { useState } from 'react'

export function ProviderBusinessPage() {
  const { id = '' } = useParams()
  const qc = useQueryClient()
  const { data: services = [] } = useQuery({
    queryKey: ['services', id],
    queryFn: () => providerApi.listServices(id),
    enabled: !!id,
  })
  const { data: employees = [] } = useQuery({
    queryKey: ['employees', id],
    queryFn: () => providerApi.listEmployees(id),
    enabled: !!id,
  })
  const { data: appointments } = useQuery({
    queryKey: ['biz-appointments', id],
    queryFn: () => providerApi.appointments(id),
    enabled: !!id,
  })

  const [svc, setSvc] = useState({ name: '', durationMinutes: 30, price: 500, currency: 'TRY' })
  const [emp, setEmp] = useState({ firstName: '', lastName: '', title: 'Uzman' })

  const addService = useMutation({
    mutationFn: () => providerApi.createService(id, svc),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services', id] }),
  })
  const addEmployee = useMutation({
    mutationFn: async () => {
      const created = await providerApi.createEmployee(id, {
        ...emp,
        serviceIds: services.map((s) => s.id),
      })
      const hours = [1, 2, 3, 4, 5].map((dayOfWeek) => ({
        dayOfWeek,
        startTime: '09:00:00',
        endTime: '18:00:00',
        isAvailable: true,
      }))
      await providerApi.setWorkingHours(id, created.id, hours)
      return created
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees', id] }),
  })

  const action = useMutation({
    mutationFn: async ({ appointmentId, type }: { appointmentId: string; type: 'confirm' | 'complete' | 'noShow' }) => {
      if (type === 'confirm') return providerApi.confirm(id, appointmentId)
      if (type === 'complete') return providerApi.complete(id, appointmentId)
      return providerApi.noShow(id, appointmentId)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['biz-appointments', id] }),
  })

  return (
    <main className="mx-auto max-w-4xl space-y-10 px-4 py-10">
      <h1 className="font-display text-3xl font-bold">İşletme yönetimi</h1>

      <section>
        <h2 className="font-semibold">Hizmetler</h2>
        <ul className="mt-3 space-y-2">
          {services.map((s) => (
            <li key={s.id} className="rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-line">
              {s.name} · {s.durationMinutes} dk · {s.price} {s.currency}
            </li>
          ))}
        </ul>
        <form
          className="mt-3 grid gap-2 sm:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault()
            addService.mutate()
          }}
        >
          <Input placeholder="Ad" value={svc.name} onChange={(e) => setSvc({ ...svc, name: e.target.value })} required />
          <Input type="number" placeholder="Dk" value={svc.durationMinutes} onChange={(e) => setSvc({ ...svc, durationMinutes: Number(e.target.value) })} />
          <Input type="number" placeholder="Fiyat" value={svc.price} onChange={(e) => setSvc({ ...svc, price: Number(e.target.value) })} />
          <Button type="submit">Ekle</Button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold">Çalışanlar</h2>
        <ul className="mt-3 space-y-2">
          {employees.map((e) => (
            <li key={e.id} className="rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-line">
              {e.firstName} {e.lastName} · {e.title}
            </li>
          ))}
        </ul>
        <form
          className="mt-3 grid gap-2 sm:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault()
            addEmployee.mutate()
          }}
        >
          <Input placeholder="Ad" value={emp.firstName} onChange={(e) => setEmp({ ...emp, firstName: e.target.value })} required />
          <Input placeholder="Soyad" value={emp.lastName} onChange={(e) => setEmp({ ...emp, lastName: e.target.value })} required />
          <Input placeholder="Ünvan" value={emp.title} onChange={(e) => setEmp({ ...emp, title: e.target.value })} />
          <Button type="submit">Ekle + saatler</Button>
        </form>
      </section>

      <section>
        <h2 className="font-semibold">Randevular</h2>
        <ul className="mt-3 space-y-2">
          {(appointments?.data || []).map((a) => (
            <li key={a.id} className="rounded-xl bg-white p-4 ring-1 ring-line">
              <p className="font-medium">
                {a.serviceName} · {new Date(a.startDateTime).toLocaleString('tr-TR')}
              </p>
              <p className="text-sm text-muted">{a.status}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {a.status === 'PENDING' && (
                  <Button size="sm" onClick={() => action.mutate({ appointmentId: a.id, type: 'confirm' })}>Onayla</Button>
                )}
                {['PENDING', 'CONFIRMED'].includes(a.status) && (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => action.mutate({ appointmentId: a.id, type: 'complete' })}>Tamamla</Button>
                    <Button size="sm" variant="ghost" onClick={() => action.mutate({ appointmentId: a.id, type: 'noShow' })}>No-show</Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
