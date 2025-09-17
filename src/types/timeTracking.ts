// Types and DTOs for Time Tracking (Ponto Eletrônico)

export enum TimeTrackingType {
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
}

export enum TimeTrackingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ValidationAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface GeoLocation {
  latitude: number
  longitude: number
  accuracy?: number
  address?: string
  city?: string
  state?: string
  country?: string
}

export interface DeviceInfo {
  userAgent?: string
  platform?: string
  browser?: string
  deviceType?: string
}

export interface TimeTrackingRecord {
  id: string
  userId?: string
  cpf?: string
  user?: { id: string; name?: string }
  type: TimeTrackingType
  status: TimeTrackingStatus
  timestamp: string
  location?: GeoLocation
  photoUrl?: string
  notes?: string
}

export interface TimeTrackingListResponse {
  items: Pick<TimeTrackingRecord, 'id' | 'type' | 'status' | 'timestamp'>[]
  pagination?: { page: number; limit: number; total: number; totalPages: number }
}

export interface RegisterTimeTrackingDto {
  type: TimeTrackingType
  photoData?: string
  photoUrl?: string
  location?: GeoLocation
  deviceInfo?: DeviceInfo
  ipAddress?: string
  notes?: string
}

export interface ValidateTimeTrackingDto {
  timeTrackingId: string
  action: ValidationAction
  reason?: string
  additionalInfo?: string
}

export interface TimeTrackingQueryDto {
  userId?: string
  cpf?: string
  type?: TimeTrackingType
  status?: TimeTrackingStatus
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface MyTimeTrackingSettings {
  workdayStart?: string
  workdayEnd?: string
  breakMinutes?: number
  geofencing?: { radiusMeters?: number; latitude?: number; longitude?: number }
}

export interface GenerateTimeTrackingReportDto {
  userId: string
  periodStart: string
  periodEnd: string
  notes?: string
}

export interface TimeTrackingReportSummary {
  id: string
  status: ReportStatus
  period?: { start: string; end: string }
  generatedAt?: string
}

export interface TimeTrackingReportListResponse {
  items: TimeTrackingReportSummary[]
}

export interface CaptureLocationDto {
  latitude: number
  longitude: number
  accuracy?: number
}

export interface CaptureLocationResponse {
  success: boolean
  location: { latitude: number; longitude: number; accuracy?: number; timestamp?: string }
  message?: string
}

export interface CapturePhotoDto {
  photoData: string
}

export interface CapturePhotoResponse {
  success: boolean
  photoUrl?: string
  message?: string
}


