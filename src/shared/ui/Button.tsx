import { cn } from '../lib/cn'
import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ className, variant = 'primary', size = 'md', ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium transition disabled:opacity-50',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-5 py-2.5 text-sm',
        size === 'lg' && 'px-6 py-3.5 text-base',
        variant === 'primary' && 'bg-ink text-white hover:bg-black',
        variant === 'secondary' && 'border border-line bg-white text-ink hover:bg-lilac/60',
        variant === 'ghost' && 'text-ink hover:bg-lilac/70',
        variant === 'danger' && 'bg-danger text-white',
        className,
      )}
      {...props}
    />
  )
}
