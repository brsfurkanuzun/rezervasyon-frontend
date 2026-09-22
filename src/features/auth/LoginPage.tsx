import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../../shared/api/endpoints'
import { Button } from '../../shared/ui/Button'
import { Field, Input } from '../../shared/ui/Field'
import { usePaths } from '../../shared/i18n/paths'
import type { AuthAudience } from './AuthLayout'
import { useAuthStore } from './store'
import type { Role } from '../../shared/types/api'

type Step = 'email' | 'password' | 'register'

const copy: Record<
  AuthAudience,
  {
    title: string
    subtitle: string
    registerTitle: string
    registerSubtitle: string
    role: Role
  }
> = {
  customer: {
    title: 'Hoş geldin',
    subtitle: 'E-postanla devam et — hesabın varsa giriş, yoksa kayıt.',
    registerTitle: 'Hesap oluştur',
    registerSubtitle: 'Birkaç bilgiyle randevu dünyasına katıl.',
    role: 'CUSTOMER',
  },
  provider: {
    title: 'İşletme girişi',
    subtitle: 'E-postanla devam et — hesabın varsa giriş, yoksa kayıt.',
    registerTitle: 'İşletme hesabı',
    registerSubtitle: 'Salonunu eklemek için hesabını oluştur.',
    role: 'PROVIDER',
  },
}

function OrSeparator({ label = 'veya' }: { label?: string }) {
  return (
    <div className="relative my-4 flex items-center gap-3" role="separator" aria-label={label}>
      <div className="h-px flex-1 bg-line" />
      <span className="shrink-0 text-xs font-medium uppercase tracking-[0.14em] text-muted">{label}</span>
      <div className="h-px flex-1 bg-line" />
    </div>
  )
}

function SocialButton({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex w-full items-center justify-center rounded-full border border-line bg-white px-4 py-3 text-sm font-medium text-ink transition hover:bg-lilac/40"
    >
      <span className="absolute left-4 flex h-6 w-6 items-center justify-center [&_svg]:h-6 [&_svg]:w-6" aria-hidden>
        {icon}
      </span>
      <span className="text-center">{label}</span>
    </button>
  )
}

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="8" y="2.5" width="8" height="19" rx="2" />
    <path d="M11 18.5h2" strokeLinecap="round" />
  </svg>
)

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#EA4335"
      d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.5-5.1 3.5-3.1 0-5.6-2.5-5.6-5.6S8.9 6.1 12 6.1c1.8 0 3 .7 3.7 1.4l2.5-2.4C16.8 3.7 14.6 2.7 12 2.7 6.9 2.7 2.7 6.9 2.7 12S6.9 21.3 12 21.3c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"
    />
  </svg>
)

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M16.7 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9-.7 0-1.9-.8-3.1-.8-1.6 0-3.1 1-3.9 2.5-1.7 2.9-.4 7.2 1.2 9.6.8 1.1 1.7 2.4 3 2.3 1.2-.1 1.6-.8 3.1-.8s1.8.8 3.1.7c1.3-.1 2.1-1.1 2.9-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.4-.9-2.4-3.7zM14.4 5.5c.6-.8 1.1-1.9.9-3-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.5 3-1.4z" />
  </svg>
)

export function LoginPage({ audience }: { audience: AuthAudience }) {
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()
  const location = useLocation()
  const p = usePaths()
  const text = copy[audience]
  const from =
    (location.state as { from?: string })?.from || (audience === 'provider' ? p.panel : p.home)

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialNote, setSocialNote] = useState('')

  function resetToEmail() {
    setStep('email')
    setPassword('')
    setFirstName('')
    setLastName('')
    setPhone('')
    setError('')
    setShowPassword(false)
    setSocialNote('')
  }

  async function onCheckEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSocialNote('')
    try {
      const result = await authApi.checkEmail(email.trim())
      setStep(result.exists ? 'password' : 'register')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const auth = await authApi.login({ email: email.trim(), password })
      setSession(auth)
      if (audience === 'provider' || auth.user.role === 'PROVIDER') {
        navigate(p.panel)
      } else {
        navigate(from)
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const auth = await authApi.register({
        firstName,
        lastName,
        email: email.trim(),
        password,
        phone: phone || undefined,
        role: text.role,
      })
      setSession(auth)
      navigate(text.role === 'PROVIDER' ? p.panel : p.home)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const heading = step === 'register' ? text.registerTitle : text.title
  const subtitle = step === 'register' ? text.registerSubtitle : text.subtitle
  const showEmailExtras = step === 'email'
  const altPrompt =
    audience === 'customer' ? 'İşletme hesabınız mı var?' : 'Müşteri hesabınız mı var?'
  const altLinkLabel =
    audience === 'customer' ? 'İşletmeler için giriş yapın' : 'Müşteriler için giriş yapın'
  const altLinkTo = audience === 'customer' ? p.signinBusiness : p.signin

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-[2.15rem]">{heading}</h1>
      <p className="mt-2 text-sm text-muted sm:text-base">{subtitle}</p>

      {step === 'email' && (
        <form onSubmit={onCheckEmail} className="mt-6 space-y-4">
          <Field label="E-posta">
            {({ id }) => (
              <Input
                id={id}
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
                required
              />
            )}
          </Field>

          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
            {loading ? 'Kontrol ediliyor…' : 'Devam et'}
          </Button>
        </form>
      )}

      {showEmailExtras && (
        <div className="mt-2">
          <OrSeparator />

          <div className="space-y-2.5">
            <SocialButton
              label="Mobil ile devam et"
              icon={<PhoneIcon />}
              onClick={() => setSocialNote('Mobil ile giriş yakında.')}
            />
            <SocialButton
              label="Google ile devam et"
              icon={<GoogleIcon />}
              onClick={() => setSocialNote('Google ile giriş yakında.')}
            />
            <SocialButton
              label="Apple ile devam et"
              icon={<AppleIcon />}
              onClick={() => setSocialNote('Apple ile giriş yakında.')}
            />
          </div>

          {socialNote && (
            <p className="mt-2 text-center text-sm text-muted" role="status">
              {socialNote}
            </p>
          )}

          <div className="my-5 h-px bg-line" role="separator" />

          <p className="text-center text-sm text-muted">{altPrompt}</p>
          <p className="mt-1.5 text-center">
            <Link
              to={altLinkTo}
              className="text-sm font-semibold text-ink underline-offset-2 hover:underline"
            >
              {altLinkLabel}
            </Link>
          </p>
        </div>
      )}

      {step === 'password' && (
        <form onSubmit={onLogin} className="mt-6 space-y-4">
          <div className="rounded-2xl bg-lilac/40 px-4 py-3 text-sm">
            <p className="text-muted">E-posta</p>
            <div className="mt-0.5 flex items-center justify-between gap-3">
              <p className="truncate font-medium text-ink">{email}</p>
              <button
                type="button"
                onClick={resetToEmail}
                className="shrink-0 text-xs font-medium text-ink underline-offset-2 hover:underline"
              >
                Değiştir
              </button>
            </div>
          </div>

          <Field label="Şifre">
            {({ id }) => (
              <div className="relative">
                <Input
                  id={id}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 min-h-11 min-w-14 -translate-y-1/2 px-2 text-xs font-medium text-muted hover:text-ink"
                >
                  {showPassword ? 'Gizle' : 'Göster'}
                </button>
              </div>
            )}
          </Field>

          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
            {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
          </Button>
        </form>
      )}

      {step === 'register' && (
        <form onSubmit={onRegister} className="mt-6 space-y-4">
          <div className="rounded-2xl bg-lilac/40 px-4 py-3 text-sm">
            <p className="text-muted">E-posta</p>
            <div className="mt-0.5 flex items-center justify-between gap-3">
              <p className="truncate font-medium text-ink">{email}</p>
              <button
                type="button"
                onClick={resetToEmail}
                className="shrink-0 text-xs font-medium text-ink underline-offset-2 hover:underline"
              >
                Değiştir
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ad">
              {({ id }) => (
                <Input
                  id={id}
                  autoComplete="given-name"
                  autoFocus
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ayşe"
                  required
                />
              )}
            </Field>
            <Field label="Soyad">
              {({ id }) => (
                <Input
                  id={id}
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Yılmaz"
                  required
                />
              )}
            </Field>
          </div>

          <Field label="Telefon" hint="İsteğe bağlı">
            {({ id }) => (
              <Input
                id={id}
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+90 5xx xxx xx xx"
              />
            )}
          </Field>

          <Field label="Şifre" hint="En az 8 karakter">
            {({ id }) => (
              <div className="relative">
                <Input
                  id={id}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 min-h-11 min-w-14 -translate-y-1/2 px-2 text-xs font-medium text-muted hover:text-ink"
                >
                  {showPassword ? 'Gizle' : 'Göster'}
                </button>
              </div>
            )}
          </Field>

          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
            {loading ? 'Oluşturuluyor…' : 'Hesap oluştur'}
          </Button>
        </form>
      )}
    </div>
  )
}
