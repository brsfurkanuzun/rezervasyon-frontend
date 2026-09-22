import { cn } from '../lib/cn'
import type { InputHTMLAttributes } from 'react'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-2xl border border-line bg-white px-4 py-3 text-ink outline-none transition placeholder:text-muted focus:border-lilac-deep focus:ring-2 focus:ring-lilac-deep/40',
        className,
      )}
      {...props}
    />
  )
}
