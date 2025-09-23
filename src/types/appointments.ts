// Types and DTOs for Appointments (Agendamentos)

export type UUID = string

export enum AppointmentType {
  CONSULTATION = 'CONSULTATION',
  TREATMENT = 'TREATMENT',
  PROCEDURE = 'PROCEDURE',
  FOLLOW_UP = 'FOLLOW_UP',
  EMERGENCY = 'EMERGENCY',
  MAINTENANCE = 'MAINTENANCE',
  EVALUATION = 'EVALUATION',
  OTHER = 'OTHER',
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  RESCHEDULED = 'RESCHEDULED',
  WAITING = 'WAITING',
}

export enum AppointmentPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface AppointmentPricing {
  amount: number
  partnerDiscountPercentage?: number
  partnerDiscountAmount?: number
  finalAmount?: number
  agreementId?: UUID
}

export interface Appointment {
  id: UUID
  clientId: UUID
  professionalId?: UUID
  serviceId: UUID
  scheduledDate: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime?: string // HH:mm
  status: AppointmentStatus
  appointmentType: AppointmentType
  priority?: AppointmentPriority
  agreementId?: UUID
  notes?: string
  pricing?: AppointmentPricing
  createdAt?: string
  updatedAt?: string
  // Optional expanded relationships
  client?: { id: UUID; name?: string; email?: string; phone?: string }
  professional?: { id: UUID; name?: string; email?: string; phone?: string } | null
  service?: { id: UUID; name?: string; description?: string | null; currentPrice?: string | number; duration?: number; color?: string }
  partner?: { id: UUID; name?: string } | null
}

export interface AppointmentListResponse {
  items: Appointment[]
  pagination?: { page: number; limit: number; total: number; totalPages: number }
}

export interface AppointmentQueryDto {
  page?: number
  limit?: number
  status?: AppointmentStatus
  clientId?: UUID
  professionalId?: UUID
  serviceId?: UUID
  scheduledDate?: string
}


