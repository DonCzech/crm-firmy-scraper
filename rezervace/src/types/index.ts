export interface User {
  id: string
  email: string
  name: string
  slug: string
  avatar_color: string
  avatar_url?: string
  bio: string
  timezone: string
  created_at: string
}

export interface Service {
  id: string
  user_id: string
  name: string
  description: string
  duration_minutes: number
  price: number
  currency: string
  color: string
  image_url: string
  is_active: boolean
  is_addon: boolean
  sort_order: number | null
  created_at: string
}

export interface Availability {
  id: string
  user_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

export interface Booking {
  id: string
  service_id: string
  provider_id: string
  client_name: string
  client_email: string
  client_phone: string
  client_notes: string
  booking_date: string
  start_time: string
  duration_minutes: number
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending'
  price: number
  currency: string
  payment_status: string
  confirmation_token: string
  created_at: string
  updated_at: string
  staff_id?: string | null
  staff_name?: string
  // Joined fields
  service_name?: string
  service_color?: string
  provider_name?: string
  provider_email?: string
}

export interface StaffAvailability {
  id: string
  staff_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

export interface Staff {
  id: string
  user_id: string
  name: string
  color: string
  bio: string
  avatar_url: string
  is_active: boolean
  sort_order: number
  created_at: string
  // Joined
  availability?: StaffAvailability[]
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface BookingFormData {
  clientName: string
  clientEmail: string
  clientPhone: string
  clientNotes: string
}

export interface DashboardStats {
  totalBookings: number
  todayBookings: number
  weekBookings: number
  monthRevenue: number
  totalClients: number
}

export interface JWTPayload {
  userId: string
  email: string
  name: string
  slug: string
}
