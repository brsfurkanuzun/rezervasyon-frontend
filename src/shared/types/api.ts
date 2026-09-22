export type Role = 'CUSTOMER' | 'PROVIDER' | 'ADMIN'

export interface ApiResponse<T> {
  success: boolean
  data: T
  pagination?: PaginationMeta
}

export interface PaginationMeta {
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: Role
  active?: boolean
  isActive?: boolean
  createdAt?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface Category {
  id: string
  code: string
  name: string
  description?: string
}

export interface BusinessSummary {
  id: string
  name: string
  slug: string
  city?: string
  district?: string
  logoUrl?: string
  coverImageUrl?: string
  status?: string
  averageRating?: number
  reviewCount: number
  startingPrice?: number
  categories?: Category[]
}

export interface ServiceItem {
  id: string
  name: string
  description?: string
  durationMinutes: number
  price: number
  currency: string
  isActive: boolean
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  title?: string
  bio?: string
  photoUrl?: string
  isActive: boolean
  serviceIds?: string[]
}

export interface Review {
  id: string
  customerId: string
  customerName: string
  businessId: string
  appointmentId: string
  rating: number
  comment?: string
  createdAt: string
}

export interface BusinessDetail {
  id: string
  name: string
  slug: string
  description?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  district?: string
  latitude?: number
  longitude?: number
  logoUrl?: string
  coverImageUrl?: string
  timezone: string
  autoConfirm: boolean
  status: string
  averageRating?: number
  reviewCount: number
  categories: Category[]
  services: ServiceItem[]
  employees: Employee[]
  recentReviews: Review[]
}

export interface TimeSlot {
  start: string
  end: string
  available: boolean
}

export interface EmployeeAvailability {
  employeeId: string
  employeeName: string
  slots: TimeSlot[]
}

export interface AvailabilityResponse {
  date: string
  employees: EmployeeAvailability[]
}

export interface Appointment {
  id: string
  customerId: string
  businessId: string
  businessName: string
  employeeId: string
  employeeName: string
  serviceId: string
  serviceName: string
  startDateTime: string
  endDateTime: string
  status: string
  price: number
  customerNote?: string
  cancellationReason?: string
  createdAt: string
}

export interface Favorite {
  id: string
  businessId: string
  businessName: string
  businessSlug: string
  createdAt: string
}

export interface WorkingHour {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
}
