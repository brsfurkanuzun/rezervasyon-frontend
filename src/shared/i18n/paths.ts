import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { DEFAULT_LOCALE, isLocale, type Locale } from './locale'

export function useLocale(): Locale {
  const { locale } = useParams()
  return isLocale(locale) ? locale : DEFAULT_LOCALE
}

/** Locale-aware app paths (English segments). */
export function paths(locale: Locale) {
  const root = `/${locale}`
  return {
    home: root,
    signin: `${root}/signin`,
    signinBusiness: `${root}/signin/business`,
    signup: `${root}/signup`,
    signupBusiness: `${root}/signup/business`,
    search: `${root}/search`,
    venue: (slug: string) => `${root}/venues/${slug}`,
    book: (slug: string) => `${root}/venues/${slug}/book`,
    appointments: `${root}/account/appointments`,
    favorites: `${root}/account/favorites`,
    panel: `${root}/panel`,
    panelBusiness: (id: string) => `${root}/panel/businesses/${id}`,
  } as const
}

export function usePaths() {
  const locale = useLocale()
  return useMemo(() => paths(locale), [locale])
}

/** Swap locale prefix while keeping the rest of the pathname (+ search). */
export function withLocale(pathname: string, next: Locale, search = '') {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length && isLocale(parts[0])) parts[0] = next
  else parts.unshift(next)
  return `/${parts.join('/')}${search}`
}
