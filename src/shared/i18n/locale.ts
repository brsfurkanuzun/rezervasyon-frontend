export const LOCALES = ['tr', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'tr'

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value)
}

export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE
  const lang = navigator.language.slice(0, 2).toLowerCase()
  return isLocale(lang) ? lang : DEFAULT_LOCALE
}
