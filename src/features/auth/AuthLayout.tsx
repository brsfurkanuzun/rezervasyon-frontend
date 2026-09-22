import { Link, Outlet, useLocation } from 'react-router-dom'
import { usePaths } from '../../shared/i18n/paths'

export type AuthAudience = 'customer' | 'provider'

const panels: Record<
  AuthAudience,
  { src: string; alt: string; title: string; subtitle: string }
> = {
  customer: {
    src: '/images/auth-customer.jpg',
    alt: 'Randevusunu telefonundan planlayan mutlu bir çift',
    title: 'Güzellik ve bakım,\ntek dokunuşla.',
    subtitle: 'Yakınındaki salonları keşfet, uygun saati seç, randevunu anında al.',
  },
  provider: {
    src: '/images/auth-provider.jpg',
    alt: 'Kuaför koltuğunda müşterisine hizmet veren bir berber',
    title: 'İşletmeni büyüt,\nrandevuları yönet.',
    subtitle: 'Müşterilerin seni bulsun, müsaitliğini paylaş, takvimini kontrol altında tut.',
  },
}

function AuthHeader({ compact, home }: { compact?: boolean; home: string }) {
  return (
    <header
      className={
        compact
          ? 'relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-line/60 bg-[#faf8fc]/90 px-4 backdrop-blur-md sm:px-6'
          : 'relative z-10 flex h-14 shrink-0 items-center justify-between px-4 sm:h-16 sm:px-8 lg:px-12 xl:px-14'
      }
    >
      <Link to={home} className="font-display text-xl font-bold tracking-tight lowercase sm:text-2xl">
        randevu
      </Link>
      <Link to={home} className="text-xs text-muted transition hover:text-ink sm:text-sm">
        <span className="sm:hidden">Ana sayfa</span>
        <span className="hidden sm:inline">Ana sayfaya dön</span>
      </Link>
    </header>
  )
}

/**
 * Full-bleed auth split: form left / photo right on desktop;
 * header → hero → form stacked on mobile.
 * Desktop locks to viewport height; form column scrolls if needed.
 */
export function AuthLayout() {
  const { pathname } = useLocation()
  const p = usePaths()
  const audience: AuthAudience = /\/(signin|signup)\/business(?:\/|$)/.test(pathname)
    ? 'provider'
    : 'customer'
  const panel = panels[audience]

  return (
    <div className="min-h-dvh bg-[#faf8fc] lg:h-dvh lg:overflow-hidden">
      <div className="lg:hidden">
        <AuthHeader compact home={p.home} />
      </div>

      <div className="lg:grid lg:h-full lg:grid-cols-2">
        <aside className="relative h-[32svh] min-h-36 max-h-52 w-full sm:h-[36svh] sm:max-h-60 lg:order-2 lg:h-full lg:max-h-none lg:min-h-0">
          <img
            src={panel.src}
            alt={panel.alt}
            className="absolute inset-0 h-full w-full object-cover object-[center_28%] lg:object-center"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/25 to-ink/10 lg:via-ink/15 lg:to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6 lg:p-10 xl:p-14">
            <p className="font-display text-xl font-bold leading-[1.1] tracking-tight whitespace-pre-line sm:text-2xl lg:text-4xl xl:text-5xl">
              {panel.title}
            </p>
            <p className="mt-1.5 max-w-md text-xs leading-relaxed text-white/85 sm:mt-2 sm:text-sm lg:mt-4 lg:text-base">
              {panel.subtitle}
            </p>
          </div>
        </aside>

        <div className="relative flex min-h-0 flex-col lg:order-1 lg:h-full lg:overflow-y-auto">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 50% at 0% 0%, rgba(217,204,232,0.45), transparent 60%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(243,238,248,0.8), transparent 55%)',
            }}
          />

          <div className="sticky top-0 z-20 hidden bg-[#faf8fc]/90 backdrop-blur-md lg:block">
            <AuthHeader home={p.home} />
          </div>

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-6 sm:px-8 lg:px-12 xl:px-14">
            <div className="w-full max-w-md">
              <Outlet context={{ audience } satisfies { audience: AuthAudience }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
