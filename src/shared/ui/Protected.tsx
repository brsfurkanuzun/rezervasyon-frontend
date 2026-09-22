import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/store'
import type { Role } from '../types/api'
import { usePaths } from '../i18n/paths'

export function Protected({
  children,
  roles,
  loginKind = 'customer',
}: {
  children: React.ReactNode
  roles?: Role[]
  loginKind?: 'customer' | 'business'
}) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const p = usePaths()
  const loginTo = loginKind === 'business' ? p.signinBusiness : p.signin

  if (!user) return <Navigate to={loginTo} replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(user.role)) return <Navigate to={p.home} replace />
  return children
}
