import { cn } from '../lib/cn'

function addDays(base: Date, n: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

function fmt(d: Date) {
  return d.toISOString().slice(0, 10)
}

const daysTr = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

export function DateStrip({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const today = new Date()
  const items = Array.from({ length: 14 }, (_, i) => addDays(today, i))

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {items.map((d, i) => {
        const id = fmt(d)
        const label = i === 0 ? 'Bugün' : i === 1 ? 'Yarın' : `${daysTr[d.getDay()]} ${d.getDate()}`
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition',
              value === id ? 'bg-ink text-white' : 'bg-white text-ink ring-1 ring-line hover:bg-lilac',
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
