import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingApi, reviewApi } from '../../shared/api/endpoints'
import { Button } from '../../shared/ui/Button'
import { useState } from 'react'

export function AppointmentsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['my-appointments'], queryFn: bookingApi.mine })
  const [reviewFor, setReviewFor] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const cancel = useMutation({
    mutationFn: (id: string) => bookingApi.cancel(id, 'Müşteri iptali'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-appointments'] }),
  })
  const review = useMutation({
    mutationFn: () => reviewApi.create({ appointmentId: reviewFor, rating, comment }),
    onSuccess: () => {
      setReviewFor(null)
      setComment('')
      qc.invalidateQueries({ queryKey: ['my-appointments'] })
    },
  })

  if (isLoading) return <p className="p-8 text-center text-muted">Yükleniyor…</p>

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Randevularım</h1>
      <ul className="mt-6 space-y-3">
        {(data?.data || []).map((a) => (
          <li key={a.id} className="rounded-2xl bg-white p-4 ring-1 ring-line">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{a.businessName}</p>
                <p className="text-sm text-muted">
                  {a.serviceName} · {a.employeeName}
                </p>
                <p className="mt-1 text-sm">
                  {new Date(a.startDateTime).toLocaleString('tr-TR')} · {a.status}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {['PENDING', 'CONFIRMED'].includes(a.status) && (
                  <Button size="sm" variant="secondary" onClick={() => cancel.mutate(a.id)}>
                    İptal
                  </Button>
                )}
                {a.status === 'COMPLETED' && (
                  <Button size="sm" onClick={() => setReviewFor(a.id)}>
                    Yorum yaz
                  </Button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      {!data?.data?.length && <p className="mt-6 text-muted">Henüz randevun yok.</p>}

      {reviewFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6">
            <h2 className="font-display text-xl font-semibold">Değerlendirme</h2>
            <label className="mt-4 block text-sm">
              Puan
              <input
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-line px-3 py-2"
              />
            </label>
            <textarea
              className="mt-3 min-h-24 w-full rounded-xl border border-line p-3"
              placeholder="Yorum"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setReviewFor(null)}>Vazgeç</Button>
              <Button onClick={() => review.mutate()} disabled={review.isPending}>Gönder</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
