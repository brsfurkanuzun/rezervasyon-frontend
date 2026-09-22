import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../../shared/api/endpoints'
import { Button } from '../../shared/ui/Button'
import { Field, Input } from '../../shared/ui/Field'
import { usePaths } from '../../shared/i18n/paths'
import type { AuthAudience } from './AuthLayout'
import { useAuthStore } from './store'
import type { Role } from '../../shared/types/api'

const copy: Record<
  AuthAudience,
  { title: string; subtitle: string; role: Role; switchLabel: string }
> = {
  customer: {
    title: 'Hesap oluştur',
    subtitle: 'Birkaç adımda randevu dünyasına katıl.',
    role: 'CUSTOMER',
    switchLabel: 'İşletme olarak kayıt ol',
  },
  provider: {
    title: 'İşletme hesabı',
    subtitle: 'Salonunu ekle, online randevu almaya başla.',
    role: 'PROVIDER',
    switchLabel: 'Müşteri olarak kayıt ol',
  },
}

export function RegisterPage({ audience }: { audience: AuthAudience }) {
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()
  const p = usePaths()
  const text = copy[audience]
  const loginTo = audience === 'provider' ? p.signinBusiness : p.signin
  const switchTo = audience === 'provider' ? p.signup : p.signupBusiness
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const auth = await authApi.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
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

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{text.title}</h1>
      <p className="mt-2 text-sm text-muted sm:mt-3 sm:text-base">{text.subtitle}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 sm:mt-10 sm:space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ad">
            {({ id }) => (
              <Input
                id={id}
                autoComplete="given-name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
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
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Yılmaz"
                required
              />
            )}
          </Field>
        </div>

        <Field label="E-posta">
          {({ id }) => (
            <Input
              id={id}
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="ornek@mail.com"
              required
            />
          )}
        </Field>

        <Field label="Telefon" hint="İsteğe bağlı">
          {({ id }) => (
            <Input
              id={id}
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Oluşturuluyor…' : 'Hesap oluştur'}
        </Button>
      </form>

      <p className="mt-8 text-sm text-muted sm:mt-10">
        Zaten üye misin?{' '}
        <Link to={loginTo} className="font-semibold text-ink underline-offset-2 hover:underline">
          Oturum aç
        </Link>
      </p>
      <p className="mt-2 text-sm text-muted sm:mt-3">
        <Link to={switchTo} className="inline-flex min-h-11 items-center underline-offset-2 hover:underline">
          {text.switchLabel}
        </Link>
      </p>
    </div>
  )
}
