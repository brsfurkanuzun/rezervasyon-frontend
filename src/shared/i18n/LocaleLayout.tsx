import { useEffect } from 'react'
import { Navigate, Outlet, useParams } from 'react-router-dom'
import { DEFAULT_LOCALE, isLocale } from './locale'

export function LocaleLayout() {
  const { locale } = useParams()

  useEffect(() => {
    if (isLocale(locale)) document.documentElement.lang = locale
  }, [locale])

  if (!isLocale(locale)) {
    return <Navigate to={`/${DEFAULT_LOCALE}`} replace />
  }

  return <Outlet />
}
