import { cn } from '../lib/cn'
import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: (field: { id: string }) => ReactNode
  className?: string
}) {
  const id = useId()

  return (
    <div className={cn('block', className)}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {children({ id })}
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </div>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-base text-ink outline-none transition placeholder:text-muted/80 focus:border-lilac-deep focus:ring-2 focus:ring-lilac-deep/40',
        className,
      )}
      {...props}
    />
  )
}
