import { api, apiPage } from './client'
import type {
  Appointment,
  AuthResponse,
  AvailabilityResponse,
  BusinessDetail,
  BusinessSummary,
  Category,
  Employee,
  Favorite,
  Review,
  ServiceItem,
  User,
  WorkingHour,
} from '../types/api'

export const authApi = {
  register: (body: object) =>
    api<AuthResponse>('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: object) =>
    api<AuthResponse>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  checkEmail: (email: string) =>
    api<{ exists: boolean }>('/api/v1/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  me: () => api<User>('/api/v1/auth/me'),
  logout: () => api<void>('/api/v1/auth/logout', { method: 'POST' }),
}

export const catalogApi = {
  categories: () => api<Category[]>('/api/v1/categories'),
  searchBusinesses: (params: URLSearchParams) =>
    apiPage<BusinessSummary[]>(`/api/v1/businesses?${params}`),
  businessBySlug: (slug: string) => api<BusinessDetail>(`/api/v1/businesses/${slug}`),
  availability: (businessId: string, params: URLSearchParams) =>
    api<AvailabilityResponse>(`/api/v1/businesses/${businessId}/availability?${params}`),
  reviews: (businessId: string) =>
    apiPage<Review[]>(`/api/v1/businesses/${businessId}/reviews?size=20`),
}

export const bookingApi = {
  create: (body: object) =>
    api<Appointment>('/api/v1/appointments', { method: 'POST', body: JSON.stringify(body) }),
  mine: () => apiPage<Appointment[]>('/api/v1/appointments/my?size=50'),
  cancel: (id: string, reason?: string) =>
    api<Appointment>(`/api/v1/appointments/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
}

export const favoriteApi = {
  list: () => api<Favorite[]>('/api/v1/favorites'),
  add: (businessId: string) =>
    api<Favorite>(`/api/v1/favorites/${businessId}`, { method: 'POST' }),
  remove: (businessId: string) =>
    api<void>(`/api/v1/favorites/${businessId}`, { method: 'DELETE' }),
}

export const reviewApi = {
  create: (body: object) =>
    api<Review>('/api/v1/reviews', { method: 'POST', body: JSON.stringify(body) }),
}

export const providerApi = {
  myBusinesses: () => api<BusinessSummary[]>('/api/v1/provider/businesses'),
  createBusiness: (body: object) =>
    api<BusinessSummary>('/api/v1/businesses', { method: 'POST', body: JSON.stringify(body) }),
  updateBusiness: (id: string, body: object) =>
    api<BusinessSummary>(`/api/v1/businesses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  listServices: (businessId: string) =>
    api<ServiceItem[]>(`/api/v1/businesses/${businessId}/services`),
  createService: (businessId: string, body: object) =>
    api<ServiceItem>(`/api/v1/businesses/${businessId}/services`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  listEmployees: (businessId: string) =>
    api<Employee[]>(`/api/v1/businesses/${businessId}/employees`),
  createEmployee: (businessId: string, body: object) =>
    api<Employee>(`/api/v1/businesses/${businessId}/employees`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  setWorkingHours: (businessId: string, employeeId: string, body: WorkingHour[]) =>
    api<WorkingHour[]>(`/api/v1/businesses/${businessId}/employees/${employeeId}/working-hours`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  appointments: (businessId: string) =>
    apiPage<Appointment[]>(`/api/v1/businesses/${businessId}/appointments?size=50`),
  confirm: (businessId: string, id: string) =>
    api<Appointment>(`/api/v1/businesses/${businessId}/appointments/${id}/confirm`, { method: 'POST' }),
  complete: (businessId: string, id: string) =>
    api<Appointment>(`/api/v1/businesses/${businessId}/appointments/${id}/complete`, { method: 'POST' }),
  noShow: (businessId: string, id: string) =>
    api<Appointment>(`/api/v1/businesses/${businessId}/appointments/${id}/no-show`, { method: 'POST' }),
}
