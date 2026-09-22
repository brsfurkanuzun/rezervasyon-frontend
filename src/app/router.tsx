import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ShellLayout } from '../shared/ui/Layout'
import { Protected } from '../shared/ui/Protected'
import { HomePage } from '../features/explore/HomePage'
import { SearchPage } from '../features/explore/SearchPage'
import { VenueDetailPage } from '../features/venue/VenueDetailPage'
import { BookingPage } from '../features/booking/BookingPage'
import { AuthLayout } from '../features/auth/AuthLayout'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { AppointmentsPage } from '../features/account/AppointmentsPage'
import { FavoritesPage } from '../features/account/FavoritesPage'
import { ProviderPanelPage } from '../features/provider/ProviderPanelPage'
import { ProviderBusinessPage } from '../features/provider/ProviderBusinessPage'
import { LocaleLayout } from '../shared/i18n/LocaleLayout'
import { DEFAULT_LOCALE, detectLocale } from '../shared/i18n/locale'
import { useLocale } from '../shared/i18n/paths'

function RootRedirect() {
  return <Navigate to={`/${detectLocale()}`} replace />
}

function LocaleHomeRedirect() {
  const locale = useLocale()
  return <Navigate to={`/${locale}`} replace />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/:locale" element={<LocaleLayout />}>
          <Route element={<AuthLayout />}>
            <Route path="signin" element={<LoginPage audience="customer" />} />
            <Route path="signin/business" element={<LoginPage audience="provider" />} />
            <Route path="signup" element={<RegisterPage audience="customer" />} />
            <Route path="signup/business" element={<RegisterPage audience="provider" />} />
          </Route>

          <Route element={<ShellLayout />}>
            <Route index element={<HomePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="venues/:slug" element={<VenueDetailPage />} />
            <Route path="venues/:slug/book" element={<BookingPage />} />
            <Route
              path="account/appointments"
              element={
                <Protected roles={['CUSTOMER', 'ADMIN']}>
                  <AppointmentsPage />
                </Protected>
              }
            />
            <Route
              path="account/favorites"
              element={
                <Protected roles={['CUSTOMER']}>
                  <FavoritesPage />
                </Protected>
              }
            />
            <Route
              path="panel"
              element={
                <Protected roles={['PROVIDER', 'ADMIN']} loginKind="business">
                  <ProviderPanelPage />
                </Protected>
              }
            />
            <Route
              path="panel/businesses/:id"
              element={
                <Protected roles={['PROVIDER', 'ADMIN']} loginKind="business">
                  <ProviderBusinessPage />
                </Protected>
              }
            />
            <Route path="*" element={<LocaleHomeRedirect />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={`/${DEFAULT_LOCALE}`} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
