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
    const raw = await api.get<any>(`/time-tracking${qs ? `?${qs}` : ''}`)

    // Adapter: support both { items, pagination } and { data, total, page, limit }
    if (raw && Array.isArray(raw.items)) {
      return raw as TimeTrackingListResponse
    }

    const dataArray = Array.isArray(raw?.data) ? raw.data : []
    const page = Number(raw?.page) || params.page || 1
    const limit = Number(raw?.limit) || params.limit || 10
    const total = Number(raw?.total) || dataArray.length
    const totalPages = Math.max(1, Math.ceil(total / limit))

    const items = dataArray.map((r: any) => ({
      id: r.id,
      type: r.type as any,
      status: r.status as any,
      timestamp: r.timestamp || r.createdAt,
    }))

    return { items, pagination: { page, limit, total, totalPages } }
  }

  static async getById(id: string): Promise<TimeTrackingRecord> {
    const r = await api.get<any>(`/time-tracking/${id}`)
    // If already in expected shape
    if (r && r.id && r.type && r.status && r.timestamp) {
      return r as TimeTrackingRecord
    }
    // Adapter from flat fields
    const latitude = r?.latitude != null ? Number(r.latitude) : undefined
    const longitude = r?.longitude != null ? Number(r.longitude) : undefined
    const accuracy = r?.accuracy != null ? Number(r.accuracy) : undefined
    return {
      id: r.id,
      userId: r.userId,
      cpf: r.cpf,
      user: r.user ? { id: r.user.id, name: r.user.name } : undefined,
      type: r.type as any,
      status: r.status as any,
      timestamp: r.timestamp || r.createdAt,
      location: latitude != null && longitude != null ? { latitude, longitude, accuracy, address: r.address, city: r.city, state: r.state, country: r.country } : undefined,
      photoUrl: r.photoUrl || undefined,
      notes: r.notes || undefined,
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


