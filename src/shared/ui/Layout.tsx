import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/store'
import { Button } from './Button'
import { cn } from '../lib/cn'
import { LOCALES, type Locale } from '../i18n/locale'
import { useLocale, usePaths, withLocale } from '../i18n/paths'

export function ShellLayout() {
  const user = useAuthStore((s) => s.user)
  const clearSession = useAuthStore((s) => s.clearSession)
  const p = usePaths()
  const locale = useLocale()
  const location = useLocation()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to={p.home} className="font-display text-2xl font-bold tracking-tight lowercase">
            randevu
          </Link>
          <nav className="flex items-center gap-1 text-sm sm:gap-2">
            <div className="mr-1 flex items-center gap-0.5 rounded-full bg-lilac/50 p-0.5 ring-1 ring-line sm:mr-2">
              {LOCALES.map((l) => (
                <Link
                  key={l}
                  to={withLocale(location.pathname, l as Locale, location.search)}
                  className={cn(
                    'rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide',
                    locale === l ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink',
                  )}
                >
                  {l}
                </Link>
              ))}
            </div>
            {user?.role === 'PROVIDER' && (
              <NavLink to={p.panel} className={({ isActive }) => cn('rounded-full px-3 py-2', isActive && 'bg-lilac')}>
                Panel
              </NavLink>
            )}
            {user ? (
              <>
                <NavLink
                  to={p.appointments}
                  className={({ isActive }) => cn('rounded-full px-3 py-2', isActive && 'bg-lilac')}
                >
                  Randevularım
                </NavLink>
                <NavLink
                  to={p.favorites}
                  className={({ isActive }) => cn('rounded-full px-3 py-2', isActive && 'bg-lilac')}
                >
                  Favoriler
                </NavLink>
                <Button variant="ghost" size="sm" onClick={clearSession}>
                  Çıkış
                </Button>
              </>
            ) : (
              <>
                <Link to={p.signin} className="rounded-full px-3 py-2">
                  Oturum aç
                </Link>
                <Link to={p.signinBusiness}>
                  <Button variant="secondary" size="sm">
                    İşletmeler için
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
      <footer className="mt-20 border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-10 text-sm text-muted md:flex-row md:justify-between">
          <span className="font-display text-base font-semibold text-ink lowercase">randevu</span>
          <span>Yerel güzellik ve bakım için anında rezervasyon.</span>
        </div>
      </footer>
    </div>
  )
}
