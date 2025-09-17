import { api } from './api'
import type {
  TimeTrackingRecord,
  TimeTrackingListResponse,
  RegisterTimeTrackingDto,
  ValidateTimeTrackingDto,
  TimeTrackingQueryDto,
  MyTimeTrackingSettings,
  GenerateTimeTrackingReportDto,
  TimeTrackingReportListResponse,
  TimeTrackingReportSummary,
  CaptureLocationDto,
  CaptureLocationResponse,
  CapturePhotoDto,
  CapturePhotoResponse
} from '@/types/timeTracking'

export class TimeTrackingService {
  static async register(data: RegisterTimeTrackingDto): Promise<TimeTrackingRecord> {
    return api.post<TimeTrackingRecord>('/time-tracking/register', data)
  }

  static async list(params: TimeTrackingQueryDto = {}): Promise<TimeTrackingListResponse> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const qs = searchParams.toString()
    const raw = await api.get<unknown>(`/time-tracking${qs ? `?${qs}` : ''}`)

    // Adapter: support both { items, pagination } and { data, total, page, limit }
    if (raw && typeof raw === 'object' && Array.isArray((raw as { items?: unknown[] }).items)) {
      return raw as TimeTrackingListResponse
    }

    const obj = (raw ?? {}) as { data?: unknown[]; page?: number; limit?: number; total?: number }
    const dataArray = Array.isArray(obj.data) ? obj.data : []
    const page = Number(obj.page) || params.page || 1
    const limit = Number(obj.limit) || params.limit || 10
    const total = Number(obj.total) || dataArray.length
    const totalPages = Math.max(1, Math.ceil(total / limit))

    const items = dataArray.map((rUnknown) => {
      const r = rUnknown as { id: string; type: string; status: string; timestamp?: string; createdAt?: string }
      return {
        id: r.id,
        type: r.type as unknown as TimeTrackingRecord['type'],
        status: r.status as unknown as TimeTrackingRecord['status'],
        timestamp: r.timestamp || r.createdAt || new Date().toISOString(),
      }
    })

    return { items, pagination: { page, limit, total, totalPages } }
  }

  static async getById(id: string): Promise<TimeTrackingRecord> {
    const r = await api.get<unknown>(`/time-tracking/${id}`)
    const rr = r as {
      id: string
      type?: string
      status?: string
      timestamp?: string
      createdAt?: string
      latitude?: number | string
      longitude?: number | string
      accuracy?: number | string
      userId?: string
      cpf?: string
      address?: string
      city?: string
      state?: string
      country?: string
      photoUrl?: string
      notes?: string
      user?: { id: string; name?: string }
    } | null
    if (!rr) {
      throw new Error('Registro não encontrado')
    }
    // If already in expected shape
    if (rr.id && rr.type && rr.status && (rr.timestamp || rr.createdAt)) {
      return rr as TimeTrackingRecord
    }
    // Adapter from flat fields
    const latitude = rr?.latitude != null ? Number(rr.latitude) : undefined
    const longitude = rr?.longitude != null ? Number(rr.longitude) : undefined
    const accuracy = rr?.accuracy != null ? Number(rr.accuracy) : undefined
    return {
      id: rr.id,
      userId: rr.userId,
      cpf: rr.cpf,
      user: rr.user ? { id: rr.user.id, name: rr.user.name } : undefined,
      type: rr.type as unknown as TimeTrackingRecord['type'],
      status: rr.status as unknown as TimeTrackingRecord['status'],
      timestamp: rr.timestamp || rr.createdAt || new Date().toISOString(),
      location: latitude != null && longitude != null ? { latitude, longitude, accuracy, address: rr.address, city: rr.city, state: rr.state, country: rr.country } : undefined,
      photoUrl: rr.photoUrl || undefined,
      notes: rr.notes || undefined,
    }
  }

  static async validate(data: ValidateTimeTrackingDto): Promise<{ success: boolean; status: string }> {
    return api.put<{ success: boolean; status: string }>(`/time-tracking/validate`, data)
  }

  static async getMySettings(): Promise<MyTimeTrackingSettings> {
    return api.get<MyTimeTrackingSettings>('/time-tracking/settings/my')
  }

  static async updateMySettings(settings: MyTimeTrackingSettings): Promise<{ success: boolean }> {
    return api.put<{ success: boolean }>('/time-tracking/settings/my', settings)
  }

  static async generateReport(data: GenerateTimeTrackingReportDto): Promise<TimeTrackingReportSummary> {
    return api.post<TimeTrackingReportSummary>('/time-tracking/reports/generate', data)
  }

  static async listReports(params: { userId?: string; status?: string; startDate?: string; endDate?: string } = {}): Promise<TimeTrackingReportListResponse> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const qs = searchParams.toString()
    return api.get<TimeTrackingReportListResponse>(`/time-tracking/reports${qs ? `?${qs}` : ''}`)
  }

  static async getReportById(id: string): Promise<{ id: string; message?: string; status?: string }> {
    return api.get<{ id: string; message?: string; status?: string }>(`/time-tracking/reports/${id}`)
  }

  static async approveReport(id: string): Promise<{ id: string; message?: string }> {
    return api.put<{ id: string; message?: string }>(`/time-tracking/reports/${id}/approve`)
  }

  static async captureLocation(data: CaptureLocationDto): Promise<CaptureLocationResponse> {
    return api.post<CaptureLocationResponse>('/time-tracking/capture-location', data)
  }

  static async capturePhoto(data: CapturePhotoDto): Promise<CapturePhotoResponse> {
    return api.post<CapturePhotoResponse>('/time-tracking/capture-photo', data)
  }
}


