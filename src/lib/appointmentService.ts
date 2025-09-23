import { api } from './api'
import type { Appointment, AppointmentListResponse, AppointmentQueryDto } from '@/types/appointments'

export class AppointmentService {
  static async list(params: AppointmentQueryDto = {}): Promise<AppointmentListResponse> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const qs = searchParams.toString()
    const raw = await api.get<unknown>(`/appointments${qs ? `?${qs}` : ''}`)

    // Support { items } shape
    if (raw && typeof raw === 'object' && Array.isArray((raw as { items?: unknown[] }).items)) {
      return raw as AppointmentListResponse
    }

    // Support { appointments, total, page, limit }
    const obj = (raw ?? {}) as { appointments?: unknown[]; data?: unknown[]; page?: number; limit?: number; total?: number }
    const dataArray = Array.isArray(obj.appointments)
      ? (obj.appointments as Appointment[])
      : Array.isArray(obj.data)
        ? (obj.data as Appointment[])
        : []
    const page = Number(obj.page) || params.page || 1
    const limit = Number(obj.limit) || params.limit || 10
    const total = Number(obj.total) || dataArray.length
    const totalPages = Math.max(1, Math.ceil(total / limit))

    return { items: dataArray, pagination: { page, limit, total, totalPages } }
  }

  static async getById(id: string): Promise<Appointment> {
    return api.get<Appointment>(`/appointments/${id}`)
  }
}


